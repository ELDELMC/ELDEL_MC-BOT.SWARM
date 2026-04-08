/**
 * ─── SESSION MANAGER ───
 * Creates and manages N Baileys WhatsApp sessions.
 * Each session has its own auth folder, connection, and event handlers.
 * All sessions share the Deduplicator, LoadBalancer, and SharedData.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';
import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers,
    jidDecode,
    makeCacheableSignalKeyStore,
    delay,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { parsePhoneNumber } from 'awesome-phonenumber';
import config from '../config.js';
import { log } from './Logger.js';
import deduplicator from './Deduplicator.js';
import loadBalancer from './LoadBalancer.js';
import adminChecker from './AdminChecker.js';
import { handleMessage } from './MessageHandler.js';
import { attachSpyListener } from './spyEvent.js';

class SessionManager {
    constructor() {
        /** @type {Map<number, object>} sessionIndex → socket */
        this.sockets = new Map();
        /** @type {Map<number, boolean>} sessionIndex → connected */
        this.connected = new Map();
        this.sessionsDir = path.join(process.cwd(), 'sessions');
        // Track sessions that are waiting for manual re‑pairing after a logout
        this.awaitingPairing = new Set();
        // Track sessions currently in the process of starting to prevent concurrent starts
        this.starting = new Set();
        // Lock timeout: if a lock is older than this, it's considered stale (5 minutes)
        this.lockTimeoutMs = 5 * 60 * 1000;
    }

    /**
     * Check if another process is using this session (lock file).
     * @returns {boolean} true if locked by another process
     */
    _isSessionLocked(sessionIndex) {
        const sessionPath = path.join(this.sessionsDir, `session-${sessionIndex}`);
        const lockFile = path.join(sessionPath, '.session.lock');
        
        try {
            if (!fs.existsSync(lockFile)) return false;
            
            const lockData = fs.readFileSync(lockFile, 'utf-8');
            const { timestamp, pid } = JSON.parse(lockData);
            
            // Check if lock is stale
            const age = Date.now() - timestamp;
            if (age > this.lockTimeoutMs) {
                log('warn', `Stale lock found for session ${sessionIndex} (age: ${(age/1000).toFixed(0)}s). Removing...`, sessionIndex);
                fs.unlinkSync(lockFile);
                return false;
            }
            
            // Check if the process actually exists
            try {
                process.kill(pid, 0); // Signal 0 = check if process exists
                return true; // Process exists, session is locked
            } catch (_) {
                // Process doesn't exist, remove stale lock
                fs.unlinkSync(lockFile);
                return false;
            }
        } catch (_) {
            return false;
        }
    }

    /**
     * Create a lock file for this session.
     */
    _lockSession(sessionIndex) {
        const sessionPath = path.join(this.sessionsDir, `session-${sessionIndex}`);
        
        // Ensure session directory exists first
        if (!fs.existsSync(sessionPath)) {
            try {
                fs.mkdirSync(sessionPath, { recursive: true });
            } catch (err) {
                log('warn', `Failed to create session directory: ${err.message}`, sessionIndex);
                return;
            }
        }
        
        const lockFile = path.join(sessionPath, '.session.lock');
        
        try {
            fs.writeFileSync(lockFile, JSON.stringify({
                timestamp: Date.now(),
                pid: process.pid,
                host: os.hostname(),
            }), 'utf-8');
        } catch (err) {
            log('warn', `Failed to create session lock: ${err.message}`, sessionIndex);
        }
    }

    /**
     * Remove lock file for this session.
     */
    _unlockSession(sessionIndex) {
        const sessionPath = path.join(this.sessionsDir, `session-${sessionIndex}`);
        const lockFile = path.join(sessionPath, '.session.lock');
        
        try {
            if (fs.existsSync(lockFile)) {
                fs.unlinkSync(lockFile);
            }
        } catch (_) {
            // Ignore
        }
    }

    /**
     * Initialize and start all sessions.
     */
    async startAll() {
        const count = config.sessionCount || 2;

        // Ensure sessions directory
        if (!fs.existsSync(this.sessionsDir)) {
            fs.mkdirSync(this.sessionsDir, { recursive: true });
        }

        log('session', `Starting ${count} sessions...`);

        // Start sessions SEQUENTIALLY with aggressive delays to prevent conflicts
        for (let i = 1; i <= count; i++) {
            // Stagger session starts to avoid simultaneous connection conflicts
            const delayBefore = i === 1 ? 0 : 90000; // S2: wait 90s after S1 connects
            if (delayBefore > 0) {
                log('info', `Session ${i} iniciará en ${delayBefore / 1000}s (evitar conflictos)...`, i);
                await delay(delayBefore);
            }
            
            await this._startSession(i);
            
            // Wait for this session to connect successfully (unless it's the last one)
            if (i < count) {
                log('info', `Esperando conexión de sesión ${i}...`, i);
                await this._waitForConnection(i, 180000); // Wait max 3 minutes
            }
        }
    }

    /**
     * Wait for a session to successfully connect.
     * @param {number} sessionIndex - 1-based session number
     * @param {number} timeoutMs - Maximum time to wait in milliseconds
     */
    async _waitForConnection(sessionIndex, timeoutMs = 120000) {
        return new Promise((resolve) => {
            // Check immediately
            if (this.connected.get(sessionIndex) === true) {
                resolve();
                return;
            }

            // Poll every 500ms until connected or timeout
            const startTime = Date.now();
            const pollInterval = setInterval(() => {
                if (this.connected.get(sessionIndex) === true) {
                    clearInterval(pollInterval);
                    resolve();
                    return;
                }

                if (Date.now() - startTime > timeoutMs) {
                    clearInterval(pollInterval);
                    log('warn', `Timeout waiting for session ${sessionIndex} to connect`, sessionIndex);
                    resolve(); // Resolve anyway, don't block forever
                    return;
                }
            }, 500);
        });
    }

    /**
     * Start a single session.
     * @param {number} sessionIndex - 1-based
     */
    async _startSession(sessionIndex) {
        if (this.starting.has(sessionIndex)) {
            log('warn', `Session ${sessionIndex} already starting... skipping.`, sessionIndex);
            return;
        }

        // Check if another process is using this session
        if (this._isSessionLocked(sessionIndex)) {
            log('warn', `Session ${sessionIndex} is locked by another process. Waiting...`, sessionIndex);
            await delay(10000);
            return; // Don't attempt to start
        }

        this.starting.add(sessionIndex);

        try {
            const sessionPath = path.join(this.sessionsDir, `session-${sessionIndex}`);
            
            // Create lock file for this session
            this._lockSession(sessionIndex);
            
            // Clean up existing socket if any
            const existingSock = this.sockets.get(sessionIndex);
            if (existingSock) {
                try { existingSock.end(); } catch (_) { /* ignore */ }
                this.sockets.delete(sessionIndex);
            }

            const { version } = await fetchLatestBaileysVersion();
            
            const credsPath = path.join(sessionPath, 'creds.json');
            // If the session isn't registered (no creds.json or empty), force a clean start
            if (fs.existsSync(credsPath)) {
                try {
                    const stats = fs.statSync(credsPath);
                    if (stats.size < 100) { // If it's too small/empty
                        fs.unlinkSync(credsPath);
                    } else {
                        // Validate JSON integrity
                        try {
                            const raw = fs.readFileSync(credsPath, 'utf-8');
                            JSON.parse(raw);
                        } catch (e) {
                            log('warn', `Corrupted creds.json detected, removing for fresh auth`, sessionIndex);
                            fs.unlinkSync(credsPath);
                        }
                    }
                } catch (_) { /* ignore */ }
            }

            const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

            const sock = makeWASocket({
                version,
                logger: pino({ level: 'silent' }),
                browser: Browsers.ubuntu('Chrome'),
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                markOnlineOnConnect: true,
                syncFullHistory: false,
                generateHighQualityLinkPreview: false,
                shouldIgnoreJids: ['status@broadcast'],
                getMessage: async () => ({ conversation: '' }),
                
                // ─── CONNECTION SETTINGS ───
                defaultQueryTimeoutMs: 120000,
                connectTimeoutMs: 120000,
                keepAliveIntervalMs: 30000,
                qrTimeout: 300000,
                maxDiffSyncMs: 86400000,
                
                // ─── RETRY SETTINGS ───
                retryRequestDelayMs: 100,
                maxMsgsInMemory: 50,
                msgRetryCounterMax: 3,
            });

            // Store socket
            this.sockets.set(sessionIndex, sock);

            // ─── Creds update ───
            sock.ev.on('creds.update', saveCreds);

            // ─── Connection update ───
            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr, isNewLogin } = update;
                log('info', `[CONNECTION UPDATE] connection: ${connection}, qr: ${!!qr}, isNewLogin: ${isNewLogin}, lastError: ${lastDisconnect?.error?.message}`, sessionIndex);
                await this._handleConnectionUpdate(sessionIndex, sock, update);
            });

            // ─── Messages ───
            sock.ev.on('messages.upsert', async (chatUpdate) => {
                try {
                    const { messages, type } = chatUpdate;
                    if (type !== 'notify') return;

                    const message = messages[0];
                    if (!message?.message) return;

                    // Skip BAE5 messages
                    if (message.key.id?.startsWith('BAE5') && message.key.id?.length === 16) return;

                    // ─── DEDUPLICATION: Only one session processes each message ───
                    const msgId = message.key.id;
                    const claimed = deduplicator.claim(msgId, sessionIndex);

                    if (!claimed) {
                        // Another session already claimed this message
                        return;
                    }

                    // This session won the race — process the message
                    await handleMessage(sock, message, sessionIndex);

                } catch (err) {
                    log('error', `Message event error: ${err.message}`, sessionIndex);
                }
            });

            // ─── SPY MODE: Extracción pasiva de números reales ───
            attachSpyListener(sock, sessionIndex);

            // ─── Group updates ───
            sock.ev.on('group-participants.update', async (update) => {
                // Invalidate admin cache when group membership changes
                if (update.id) {
                    adminChecker.invalidate(update.id);
                }
            });

            // ─── Helper methods ───
            sock.decodeJid = (jid) => {
                if (!jid) return jid;
                if (/:\d+@/gi.test(jid)) {
                    const decode = jidDecode(jid) || {};
                    return (decode.user && decode.server && `${decode.user}@${decode.server}`) || jid;
                }
                return jid;
            };

            // ─── Pairing code for unregistered sessions ───
            const isRegistered = state.creds?.registered === true;
            if (!isRegistered) {
                await this._handlePairing(sessionIndex, sock);
            } else {
                log('success', `Session already registered`, sessionIndex);
            }

            return sock;

        } catch (err) {
            log('error', `Failed to start session: ${err.message}`, sessionIndex);
            // If it failed very early, ensure it's removed from starting so retry mechanisms can work
            this.starting.delete(sessionIndex);
            this._unlockSession(sessionIndex);
            
            // Strategic restart for critical initialization failures
            if (err.message.includes('Connection Closed') || err.message.includes('Stream Errored')) {
                log('info', `Trying emergency restart in 10s...`, sessionIndex);
                await delay(10000);
                return this._startSession(sessionIndex);
            }
        } finally {
            this._unlockSession(sessionIndex);
            this.starting.delete(sessionIndex);
        }
    }

    /**
     * Handle connection state changes.
     */
    async _handleConnectionUpdate(sessionIndex, sock, update) {
        const { connection, lastDisconnect, qr, isNewLogin } = update;

        if (qr) {
            try {
                const QRCode = (await import('qrcode')).default;
                console.log(`\n[S${sessionIndex}] Escanea el siguiente QR si no deseas usar Código de Vinculación:`);
                console.log(await QRCode.toString(qr, { type: 'terminal', small: true }));
                log('info', `QR generado. Esperando escaneo...`, sessionIndex);
            } catch (_e) {
                log('info', `QR generado (no se pudo renderizar)`, sessionIndex);
            }
        }

        if (connection === 'connecting') {
            log('info', `Conectando...`, sessionIndex);
        }

        if (connection === 'open') {
            this.connected.set(sessionIndex, true);
            loadBalancer.register(sessionIndex, sock);

            const user = sock.user || {};
            const phoneNum = user.id?.split(':')[0] || 'unknown';

            log('success', `🎉 CONECTADA! Teléfono: ${phoneNum}`, sessionIndex);
            console.log(`\n✅ Session ${sessionIndex} conectada exitosamente!\n`);
            
            // Reset authState tracking
            if (this.awaitingPairing.has(sessionIndex)) {
                this.awaitingPairing.delete(sessionIndex);
            }
            
            // IMPORTANT: Keep alive pinging
            if (!sock.keepAliveIntervalMs || sock.keepAliveIntervalMs < 30000) {
                log('info', `Configurando keep-alive a 30s`, sessionIndex);
            }
        }

        if (connection === 'close') {
            const currentSock = this.sockets.get(sessionIndex);
            // Only handle disconnect if it's the current socket instance
            if (currentSock && currentSock !== sock) {
                log('info', `Ignoring disconnect of old socket instance`, sessionIndex);
                return;
            }

            this.connected.set(sessionIndex, false);
            loadBalancer.unregister(sessionIndex);
            this.sockets.delete(sessionIndex);

            const statusCode = lastDisconnect?.error?.output?.statusCode || 0;
            const errorMsg = lastDisconnect?.error?.message || lastDisconnect?.error?.toString?.() || `Code: ${statusCode}`;
            const isRegistered = sock.authState?.creds?.registered === true;
            
            log('warn', `Cerrada. Código: ${statusCode}, Error: ${errorMsg}, Registrado: ${isRegistered}`, sessionIndex);
            
            // Strategic reconnect logic based on error codes
            const criticalErrors = [DisconnectReason.loggedOut, 404];
            const recoveryErrors = [515, 428, 401]; // Include 401 as recovery error
            
            if (criticalErrors.includes(statusCode)) {
                if (this.starting.has(sessionIndex)) {
                     log('warn', `Already restarting session ${sessionIndex}, skipping duplicate request`, sessionIndex);
                     return;
                }
                
                // CRITICAL: Wipe and require re-pairing
                log('error', `Error crítico ${statusCode}. Limpiando sesión...`, sessionIndex);
                const sessionPath = path.join(this.sessionsDir, `session-${sessionIndex}`);
                try {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                    fs.mkdirSync(sessionPath, { recursive: true });
                } catch (_) {}
                this.awaitingPairing.add(sessionIndex);
                log('info', `Sesión limpiada. Re-intentando inicio para vinculación...`, sessionIndex);
                
                await delay(5000);
                await this._startSession(sessionIndex);
                return;
            }

            if (statusCode === 440) {
                log('warn', `Conflicto detectado (440). Esperando 90s antes de reconectar...`, sessionIndex);
                await delay(90000);
                await this._startSession(sessionIndex);
                return;
            }
            
            if (recoveryErrors.includes(statusCode)) {
                if (this.starting.has(sessionIndex)) return;

                if (isRegistered && statusCode === 401) {
                    log('warn', `Conflicto detectado (401). Esperando 30s antes de reconectar...`, sessionIndex);
                    await delay(30000);
                    await this._startSession(sessionIndex);
                } else if (isRegistered && statusCode === 515) {
                    log('info', `Reconectando sesión registrada...`, sessionIndex);
                    await delay(10000);
                    await this._startSession(sessionIndex);
                } else if (isRegistered && statusCode === 428) {
                    log('info', `Intentando reconexión sin borrar credenciales...`, sessionIndex);
                    await delay(8000);
                    await this._startSession(sessionIndex);
                } else {
                    // Not registered, re-pair
                    // If it's a 515, try one simple restart without wiping first
                    if (statusCode === 515) {
                        log('info', `Stream error during pairing. Attempting restart without wipe...`, sessionIndex);
                        await delay(10000);
                        await this._startSession(sessionIndex);
                    } else {
                        log('info', `Reiniciando pairing...`, sessionIndex);
                        const sessionPath = path.join(this.sessionsDir, `session-${sessionIndex}`);
                        try {
                            fs.rmSync(sessionPath, { recursive: true, force: true });
                            fs.mkdirSync(sessionPath, { recursive: true });
                        } catch (_) {}
                        await delay(5000);
                        await this._startSession(sessionIndex);
                    }
                }
                return;
            }
            
            // Transient errors: simple reconnect
            if (!this.starting.has(sessionIndex)) {
                const delayMs = statusCode === 440 ? 15000 : 10000;
                log('warn', `Reconectando en ${delayMs / 1000}s...`, sessionIndex);
                await delay(delayMs);
                await this._startSession(sessionIndex);
            }
        }
    }

    async _handlePairing(sessionIndex, sock) {
        const pairingNumbers = config.pairingNumbers || [];
        // Prioritize individual variables like BOT_ROTO, PERSONAL, etc
        // Fallback to comma separated list or owner number
        let phoneNumberInput = process.env[`PAIRING_NUMBER_${sessionIndex}`] ||
                             process.env[config.deviceNames[sessionIndex - 1]] ||
                             pairingNumbers[sessionIndex - 1] ||
                             config.ownerNumber;

            const doPairing = async (num, attempt = 1) => {
                // Stop if socket was replaced or closed
                if (this.sockets.get(sessionIndex) !== sock) return;
                if (this.connected.get(sessionIndex) === false) {
                    log('warn', `Stopping pairing loop: connection closed`, sessionIndex);
                    return;
                }

                if (!num) {
                    // ... (interactive prompt)
                    if (process.stdin.isTTY) {
                        const rl = readline.createInterface({
                            input: process.stdin,
                            output: process.stdout,
                        });
                        num = await new Promise((resolve) => {
                            rl.question(`Please type your WhatsApp number for Session ${sessionIndex} \nFormat: 573001234567 (without + or spaces) : `, (answer) => {
                                rl.close();
                                resolve(answer.trim());
                            });
                        });
                    } else {
                        log('warn', `No valid pairing number provided for session ${sessionIndex}`, sessionIndex);
                        return;
                    }
                }

                num = num.replace(/[^0-9]/g, '');
                const pn = parsePhoneNumber(`+${num}`);
                if (!pn.valid) {
                    log('error', `Invalid phone format: ${num}`, sessionIndex);
                    return;
                }

                // Wait for readiness
                if (!sock.authState?.creds?.noiseKey) {
                    if (attempt < 20) {
                        await delay(2000);
                        return doPairing(num, attempt + 1);
                    }
                }

                try {
                    log('info', `Attempting pairing for Session ${sessionIndex} with: ${num}`, sessionIndex);
                    let code = await sock.requestPairingCode(num);
                    code = code?.match(/.{1,4}/g)?.join('-') || code;
                    log('success', `Pairing code generated: ${code}`, sessionIndex);
                    const deviceName = config.deviceNames[sessionIndex - 1] || `S${sessionIndex}`;
                    console.log(`\n  🔑 [${deviceName}] Your Pairing Code : ${code}\n`);
                    console.log(`   📱 Vincular en WhatsApp → Configuración → Dispositivos vinculados\n`);
                    console.log(`   ⏱️  Tienes 5 minutos para vincular - escanea el código o usa: ${code}\n`);
                } catch (err) {
                    const errorMsg = err?.message || err?.toString?.() || 'Unknown error';
                    if (errorMsg.includes('Connection Closed') || errorMsg.includes('Stream Errored')) {
                        log('warn', `Pairing interrupted by connection error. Stopping loop...`, sessionIndex);
                        return;
                    }
                    if (attempt < 8) {
                        const delayTime = attempt < 3 ? 15000 : 20000;
                        log('warn', `Pairing failed (attempt ${attempt}/8): ${errorMsg}. Retrying in ${delayTime/1000}s...`, sessionIndex);
                        await delay(delayTime);
                        return doPairing(num, attempt + 1);
                    } else {
                        log('error', `❌ Pairing failed after 8 attempts: ${errorMsg}.`, sessionIndex);
                    }
                }
            };

            // Intelligent wait: poll for readiness instead of blind 25s
            let isReady = false;
            for (let i = 0; i < 30; i++) {
                if (this.sockets.get(sessionIndex) !== sock) return;
                if (sock.authState?.creds?.noiseKey) {
                    isReady = true;
                    break;
                }
                await delay(1000);
            }

            if (!isReady) {
                log('warn', `Socket not ready for pairing after 30s.`, sessionIndex);
                return;
            }

            await doPairing(phoneNumberInput);
    }

    /**
     * Get connected session count.
     */
    getConnectedCount() {
        let count = 0;
        for (const [, connected] of this.connected) {
            if (connected) count++;
        }
        return count;
    }

    /**
     * Get status of all sessions.
     */
    getStatus() {
        const status = [];
        for (let i = 1; i <= config.sessionCount; i++) {
            status.push({
                session: `S${i}`,
                connected: this.connected.get(i) || false,
                phone: this.sockets.get(i)?.user?.id?.split(':')[0] || 'N/A',
            });
        }
        return status;
    }
}

export default new SessionManager();
