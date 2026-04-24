import fs from 'fs';
import path from 'path';
import { reply, bullet, header, toMono } from '../core/Formatter.js';
import { DB_DIR } from '../CLONADOR/utils/clonador.js';
import loadBalancer from '../core/LoadBalancer.js';
import sessionManager from '../core/SessionManager.js';

/**
 * ─── INVO (INVITE) COMMAND ───
 * Invite users from database files to the group with random intervals.
 * Both active sessions split the work equally to avoid overloading one session.
 * Usage: .invo (show databases) or .invo <number> (start inviting from selected DB)
 */

// ✅ UNIFIED DATABASE PATH (imported from clonador utility)
const DB_PATH = DB_DIR;

/**
 * Read all database files and return their metadata.
 * @returns {Array<{index: number, name: string, file: string, count: number}>}
 */
function getDatabaseList() {
    if (!fs.existsSync(DB_PATH)) {
        try {
            fs.mkdirSync(DB_PATH, { recursive: true });
        } catch (err) {
            return [];
        }
    }
    const files = fs.readdirSync(DB_PATH).filter(f => f.endsWith('.json'));
    
    return files.map((file, index) => {
        const filePath = path.join(DB_PATH, file);
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const count = Array.isArray(data) ? data.length : Object.keys(data).length;
            const displayName = file.replace('.json', '').replace(/_/g, ' ');
            return {
                index: index + 1,
                name: displayName,
                file: file,
                count: count,
            };
        } catch (err) {
            return {
                index: index + 1,
                name: file.replace('.json', ''),
                file: file,
                count: 0,
            };
        }
    }).sort((a, b) => a.index - b.index);
}

/**
 * Generate random interval between 3-8 seconds to avoid WhatsApp ban.
 * @returns {number} Milliseconds
 */
function getRandomInterval() {
    return Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000; // 3-8 seconds
}

/**
 * Extract phone numbers from database entry.
 * @param {any} entry - Can be string or object
 * @returns {string|null}
 */
function extractPhoneNumber(entry) {
    if (typeof entry === 'string') {
        return entry;
    } else if (entry && typeof entry === 'object' && entry.phone) {
        return entry.phone;
    } else if (entry && typeof entry === 'object' && entry.number) {
        return entry.number;
    }
    return null;
}

/**
 * Normalize a phone number to Baileys format.
 * @param {string} phoneNumber
 * @returns {string|null}
 */
function normalizePhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;
    
    // Remove special characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Extract 10-12 digit numbers
    if (cleaned.length < 10 || cleaned.length > 15) {
        return null;
    }
    
    return `${cleaned}@s.whatsapp.net`;
}

/**
 * Add users to group with random intervals using a single session.
 * @param {object} sock - Baileys socket
 * @param {string} chatId - Group JID
 * @param {Array<string>} userNumbers - Array of phone numbers
 * @param {number} sessionIndex - Session number (for logging)
 * @returns {Promise<{added: number, failed: number, skipped: number, results: Array}>}
 */
async function addUsersToGroupFromSession(sock, chatId, userNumbers, sessionIndex) {
    let added = 0;
    let failed = 0;
    let skipped = 0;
    const results = [];

    // Get current group members to avoid duplicates
    let currentMembers = [];
    try {
        const groupMetadata = await sock.groupMetadata(chatId);
        currentMembers = groupMetadata.participants.map(p => p.id);
    } catch (err) {
        // Continue anyway
    }

    for (let i = 0; i < userNumbers.length; i++) {
        const phoneNumber = userNumbers[i];
        const normalized = normalizePhoneNumber(phoneNumber);

        if (!normalized) {
            skipped++;
            results.push(`[S${sessionIndex}] ${phoneNumber} - ❌ Número inválido`);
            continue;
        }

        // Check if already in group
        if (currentMembers.includes(normalized)) {
            skipped++;
            results.push(`[S${sessionIndex}] ${phoneNumber} - ⏭️ Ya en grupo`);
            continue;
        }

        try {
            await sock.groupParticipantsUpdate(chatId, [normalized], 'add');
            added++;
            results.push(`[S${sessionIndex}] ${phoneNumber} - ✅`);
            currentMembers.push(normalized);

            // Wait for random interval before next invite (except for last one)
            if (i < userNumbers.length - 1) {
                const interval = getRandomInterval();
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        } catch (err) {
            failed++;
            results.push(`[S${sessionIndex}] ${phoneNumber} - ❌ ${err.message?.substring(0, 30)}`);
            
            // Add small delay even on error
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return { added, failed, skipped, results, sessionIndex };
}

/**
 * Distribute users equally between active sessions and add them in parallel.
 * @param {string} chatId - Group JID
 * @param {Array<string>} userNumbers - Array of phone numbers
 * @returns {Promise<{added: number, failed: number, skipped: number, details: Array}>}
 */
async function addUsersWithMultipleSessions(chatId, userNumbers) {
    const activeSessions = loadBalancer.getActiveSessions();
    
    if (activeSessions.length === 0) {
        throw new Error('No hay sesiones activas disponibles');
    }

    // Split users equally among active sessions
    const chunks = [];
    const chunkSize = Math.ceil(userNumbers.length / activeSessions.length);
    
    for (let i = 0; i < userNumbers.length; i += chunkSize) {
        chunks.push(userNumbers.slice(i, i + chunkSize));
    }

    // Execute invitations in parallel (one chunk per session)
    const promises = [];
    for (let i = 0; i < activeSessions.length && i < chunks.length; i++) {
        const sessionIndex = activeSessions[i];
        const sock = loadBalancer.getSocket(sessionIndex);
        if (sock && chunks[i].length > 0) {
            promises.push(
                addUsersToGroupFromSession(sock, chatId, chunks[i], sessionIndex)
            );
        }
    }

    // Wait for all sessions to finish
    const results = await Promise.all(promises);

    // Aggregate results
    let totalAdded = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    const allDetails = [];

    for (const result of results) {
        totalAdded += result.added;
        totalFailed += result.failed;
        totalSkipped += result.skipped;
        allDetails.push(...result.results);
    }

    return {
        added: totalAdded,
        failed: totalFailed,
        skipped: totalSkipped,
        details: allDetails,
        sessionsUsed: activeSessions.length,
    };
}

export default {
    command: 'invo',
    aliases: ['invite', 'invitar', 'agregar'],
    category: 'admin',
    description: 'Invitar usuarios desde bases de datos al grupo con intervalos variables',
    usage: '.invo (ver bases) o .invo <número> (iniciar invitación)',
    groupOnly: true,
    adminOnly: true,
    cooldown: 5000,

    async handler(sock, message, args, context) {
        const { chatId, sessionIndex } = context;
        const senderId = message.key.participant || message.key.remoteJid;

        try {
            // Quick validation
            if (!chatId) {
                return;
            }

            // Get list of databases
            const databases = getDatabaseList();

            if (databases.length === 0) {
                await sock.sendMessage(chatId, {
                    text: reply('❌ No hay bases de datos disponibles.\n\nVerifica que existan archivos .json en:\ndb/grupos_clonados/'),
                }, { quoted: message });
                return;
            }

            // If no argument, show menu
            if (!args || args.length === 0) {
                let msg = '';
                msg += header('INVITATION MANAGER') + '\n\n';
                msg += '📊 ' + toMono('Bases Disponibles:') + '\n\n';

                let totalUsers = 0;
                for (const db of databases) {
                    msg += bullet(`${db.index}️⃣ ${db.name} - ${toMono(String(db.count))} usuarios`) + '\n';
                    totalUsers += db.count;
                }

                msg += '\n' + toMono('─'.repeat(40)) + '\n';
                msg += bullet(`Total de usuarios: ${toMono(String(totalUsers))}`) + '\n\n';
                msg += '💡 ' + toMono('Uso:') + '\n';
                msg += `  ${toMono('.invo 1')} - Agregar desde primera base\n`;
                msg += `  ${toMono('.invo 2')} - Agregar desde segunda base\n`;
                msg += `  etc...\n\n`;
                msg += '⚠️ Nota: Los intervalos son aleatorios (3-8s) para evitar baneo.';

                await sock.sendMessage(chatId, {
                    text: msg,
                }, { quoted: message });
                return;
            }

            // Parse the number argument
            const selectedIndex = parseInt(args[0]);

            if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > databases.length) {
                await sock.sendMessage(chatId, {
                    text: reply(`❌ Número inválido. Use .invo para ver las opciones disponibles.`),
                }, { quoted: message });
                return;
            }

            const selectedDB = databases[selectedIndex - 1];

            // Load the selected database
            const dbFilePath = path.join(DB_PATH, selectedDB.file);
            let userNumbers = [];

            try {
                const dbContent = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
                
                if (Array.isArray(dbContent)) {
                    userNumbers = dbContent.map(entry => extractPhoneNumber(entry)).filter(p => p);
                } else if (typeof dbContent === 'object') {
                    userNumbers = Object.values(dbContent).map(entry => extractPhoneNumber(entry)).filter(p => p);
                }
            } catch (err) {
                await sock.sendMessage(chatId, {
                    text: reply(`❌ Error al leer la base de datos: ${err.message}`),
                }, { quoted: message });
                return;
            }

            if (userNumbers.length === 0) {
                await sock.sendMessage(chatId, {
                    text: reply(`❌ La base de datos ${toMono(selectedDB.name)} está vacía.`),
                }, { quoted: message });
                return;
            }

            // Check if confirmed with "si"
            const confirmation = args[1]?.toLowerCase();
            const isConfirmed = confirmation === 'si' || confirmation === 'yes' || confirmation === 'y' || confirmation === 'ok';

            if (!isConfirmed) {
                // Show confirmation message
                let confirmMsg = '';
                confirmMsg += header('⚠️ CONFIRMACIÓN') + '\n\n';
                confirmMsg += bullet(`Base seleccionada: ${toMono(selectedDB.name)}`) + '\n';
                confirmMsg += bullet(`Usuarios a agregar: ${toMono(String(userNumbers.length))}`) + '\n';
                confirmMsg += bullet(`Intervalo: ${toMono('3-8 segundos (aleatorio)')}`);
                confirmMsg += '\n\n';
                confirmMsg += toMono('Uso:') + '\n';
                confirmMsg += `${toMono(`.invo ${selectedIndex} si`)} - Confirmar y comenzar\n`;
                confirmMsg += `${toMono('.invo')} - Ver bases nuevamente`;

                await sock.sendMessage(chatId, {
                    text: confirmMsg,
                }, { quoted: message });
                return;
            }

            // Start the invitation process
            let startMsg = '';
            startMsg += header('🚀 INICIANDO INVITACIÓN') + '\n\n';
            startMsg += bullet(`Base: ${toMono(selectedDB.name)}`) + '\n';
            startMsg += bullet(`Total: ${toMono(String(userNumbers.length))} usuarios`) + '\n';
            startMsg += bullet(`Sesiones: ${toMono('Ambas (distribuidas equitativamente)')}`);
            startMsg += bullet(`Intervalo: ${toMono('3-8 segundos (aleatorio)')}`);
            startMsg += '\n\n';
            startMsg += '⏳ Proceso iniciado. Las 2 sesiones trabajarán en paralelo...';

            await sock.sendMessage(chatId, {
                text: startMsg,
            }, { quoted: message });

            // Execute the invitation in background with multiple sessions
            setTimeout(async () => {
                try {
                    const result = await addUsersWithMultipleSessions(chatId, userNumbers);

                    // Send summary
                    let summaryMsg = '';
                    summaryMsg += header('📊 RESULTADO FINAL') + '\n\n';
                    summaryMsg += bullet(`🤖 Sesiones usadas: ${toMono(String(result.sessionsUsed))}`) + '\n';
                    summaryMsg += bullet(`✅ Agregados: ${toMono(String(result.added))}`) + '\n';
                    summaryMsg += bullet(`❌ Errores: ${toMono(String(result.failed))}`) + '\n';
                    summaryMsg += bullet(`⏭️  Ya en grupo: ${toMono(String(result.skipped))}`) + '\n\n';

                    // Show distribution if multiple sessions
                    if (result.sessionsUsed > 1) {
                        summaryMsg += '📍 Distribución por sesión:\n';
                        const sessionStats = {};
                        for (const detail of result.details) {
                            const match = detail.match(/\[S\d+\]/);
                            if (match) {
                                const sessionTag = match[0];
                                sessionStats[sessionTag] = (sessionStats[sessionTag] || 0) + 1;
                            }
                        }
                        for (const [session, count] of Object.entries(sessionStats)) {
                            summaryMsg += `  ${session}: ${toMono(String(count))} usuarios\n`;
                        }
                    }

                    await sock.sendMessage(chatId, {
                        text: summaryMsg,
                    });
                } catch (err) {
                    await sock.sendMessage(chatId, {
                        text: reply(`❌ Error durante invitación: ${err.message}`),
                    });
                }
            }, 500);

        } catch (err) {
            await sock.sendMessage(chatId, {
                text: reply(`❌ Error: ${err.message}`),
            }, { quoted: message });
        }
    },
};
