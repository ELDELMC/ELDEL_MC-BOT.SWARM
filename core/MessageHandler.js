/**
 * ─── MESSAGE HANDLER ───
 * Processes incoming messages that have been claimed by the Deduplicator.
 * Routes commands, checks permissions, applies formatting.
 */

import config from '../config.js';
import { log, logMessage } from './Logger.js';
import { reply, toMono } from './Formatter.js';
import commandHandler from './CommandHandler.js';
import adminChecker from './AdminChecker.js';
import loadBalancer from './LoadBalancer.js';
import sharedData from './SharedData.js';

/**
 * Extract readable text from a Baileys message object.
 */
function extractText(message) {
    const m = message.message;
    if (!m) return '';
    return (
        m.conversation ||
        m.extendedTextMessage?.text ||
        m.imageMessage?.caption ||
        m.videoMessage?.caption ||
        m.buttonsResponseMessage?.selectedButtonId ||
        ''
    ).trim();
}

/**
 * Detect message type label for logging.
 */
function getMessageType(message) {
    const key = Object.keys(message.message || {})[0] || 'unknown';
    const labels = {
        conversation: 'TEXT',
        extendedTextMessage: 'TEXT',
        imageMessage: 'IMAGE',
        videoMessage: 'VIDEO',
        audioMessage: 'AUDIO',
        documentMessage: 'DOC',
        stickerMessage: 'STICKER',
        contactMessage: 'CONTACT',
        locationMessage: 'LOCATION',
    };
    return labels[key] || key.replace('Message', '').toUpperCase();
}

/**
 * Check if a user is the owner.
 */
function isOwner(senderId) {
    if (!config.ownerNumber) return false;
    const senderNum = senderId.replace('@s.whatsapp.net', '').replace('@lid', '').split(':')[0];
    return senderNum === config.ownerNumber;
}

/**
 * Check if a user is banned.
 */
function isBanned(senderId) {
    const banned = sharedData.read('banned.json', []);
    const senderNorm = senderId.replace('@s.whatsapp.net', '').replace('@lid', '').split(':')[0];
    return banned.some(b => {
        const bNorm = b.replace('@s.whatsapp.net', '').replace('@lid', '').split(':')[0];
        return bNorm === senderNorm;
    });
}

/**
 * Handle an incoming message.
 * Called ONLY by the session that won the deduplication race.
 * 
 * @param {object} sock - Baileys socket for the winning session
 * @param {object} message - The Baileys message object
 * @param {number} sessionIndex - 1-based session number
 */
export async function handleMessage(sock, message, sessionIndex) {
    try {
        if (!message?.message) return;

        // Unwrap ephemeral
        if (Object.keys(message.message)[0] === 'ephemeralMessage') {
            message.message = message.message.ephemeralMessage.message;
        }

        // Skip status broadcasts
        if (message.key?.remoteJid === 'status@broadcast') return;

        // Skip protocol/reaction messages
        const msgType = Object.keys(message.message)[0];
        if (['senderKeyDistributionMessage', 'protocolMessage', 'reactionMessage'].includes(msgType)) return;

        const chatId = message.key.remoteJid;
        const isGroup = chatId?.endsWith('@g.us') || false;
        const senderId = message.key.participant || message.key.remoteJid;
        const fromMe = message.key.fromMe;
        const messageText = extractText(message);
        const isCommand = config.prefixes.some(p => messageText.startsWith(p));

        // ─── Log the message ───
        logMessage({
            sessionIndex,
            fromMe,
            senderName: message.pushName || '',
            senderPhone: senderId?.split('@')[0]?.split(':')[0] || '',
            groupName: isGroup ? (await sock.groupMetadata(chatId).catch(() => null))?.subject : null,
            messageType: getMessageType(message),
            messageText,
            isCommand,
        });

        // ─── Not a command → skip ───
        if (!isCommand) return;

        // ─── Check banned ───
        if (!fromMe && isBanned(senderId)) {
            log('warn', `Banned user blocked: ${senderId.split('@')[0]}`, sessionIndex);
            return;
        }

        // ─── Parse command ───
        const match = commandHandler.getCommand(messageText.toLowerCase(), config.prefixes);
        if (!match) {
            // Try suggestion
            const usedPrefix = config.prefixes.find(p => messageText.startsWith(p));
            if (usedPrefix) {
                const typed = messageText.slice(usedPrefix.length).trim().split(/\s+/)[0].toLowerCase();
                const suggestion = commandHandler.findSuggestion(typed);
                if (suggestion) {
                    await sock.sendMessage(chatId, {
                        text: reply(`Quisiste decir ${usedPrefix}${suggestion}?`),
                    }, { quoted: message });
                }
            }
            return;
        }

        const { command: cmd, prefix: usedPrefix } = match;

        // ─── Cooldown ───
        if (commandHandler.isOnCooldown(senderId, cmd.command, cmd.cooldown || 3000)) {
            return;
        }

        // ─── Permission checks ───
        const senderIsOwner = fromMe || isOwner(senderId);

        // Owner-only commands
        if (cmd.ownerOnly && !senderIsOwner) {
            await sock.sendMessage(chatId, {
                text: reply('Este comando es solo para el owner del bot.'),
            }, { quoted: message });
            return;
        }

        // Group-only commands
        if (cmd.groupOnly && !isGroup) {
            await sock.sendMessage(chatId, {
                text: reply('Este comando solo funciona en grupos.'),
            }, { quoted: message });
            return;
        }

        // ─── Admin checks ───
        let isSenderAdmin = false;
        let isBotAdmin = false;

        if (cmd.adminOnly && isGroup) {
            // For admin commands, we might need to pick a different session
            const adminResult = await adminChecker.check(sock, chatId, senderId);
            isBotAdmin = adminResult.isBotAdmin;
            isSenderAdmin = adminResult.isSenderAdmin;

            if (!isBotAdmin) {
                // Try to find another session that IS admin
                const alternative = await loadBalancer.pick(chatId, true);
                if (alternative && alternative.sessionIndex !== sessionIndex) {
                    const altAdmin = await adminChecker.check(alternative.sock, chatId, senderId);
                    if (altAdmin.isBotAdmin) {
                        // Delegate to the admin session
                        log('balancer', `Delegating admin command to S${alternative.sessionIndex}`, sessionIndex);
                        sock = alternative.sock;
                        isBotAdmin = altAdmin.isBotAdmin;
                        isSenderAdmin = altAdmin.isSenderAdmin;
                    }
                }

                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, {
                        text: reply('El bot necesita ser administrador para ejecutar este comando.'),
                    }, { quoted: message });
                    return;
                }
            }

            if (!isSenderAdmin && !senderIsOwner) {
                await sock.sendMessage(chatId, {
                    text: reply('Solo los administradores del grupo pueden usar este comando.'),
                }, { quoted: message });
                return;
            }
        }

        // ─── Extract args ───
        const rawArgs = messageText.slice(usedPrefix.length).trim();
        const args = rawArgs.split(/\s+/).slice(1);

        // ─── Build context ───
        const context = {
            chatId,
            senderId,
            isGroup,
            fromMe,
            isSenderAdmin,
            isBotAdmin,
            senderIsOwner,
            args,
            rawText: messageText,
            prefix: usedPrefix,
            sessionIndex,
            config,
        };

        // ─── Execute ───
        const startMs = Date.now();
        try {
            await cmd.handler(sock, message, args, context);
            const duration = Date.now() - startMs;
            commandHandler.recordExecution(cmd.command, duration, false);
            loadBalancer.completeTask(sessionIndex);
            log('cmd', `${usedPrefix}${cmd.command} (${duration}ms)`, sessionIndex);
        } catch (err) {
            const duration = Date.now() - startMs;
            commandHandler.recordExecution(cmd.command, duration, true);
            loadBalancer.completeTask(sessionIndex);
            log('error', `Command ${cmd.command} failed: ${err.message}`, sessionIndex);
            console.error(err.stack);
            await sock.sendMessage(chatId, {
                text: reply(`Error ejecutando el comando: ${err.message}`),
            }, { quoted: message }).catch(() => {});
        }

    } catch (err) {
        log('error', `MessageHandler error: ${err.message}`, sessionIndex);
        console.error(err.stack);
    }
}
