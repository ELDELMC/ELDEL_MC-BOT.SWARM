/**
 * ─── SESSION MANAGER ───
 * Creates and manages N Baileys WhatsApp sessions.
 * Each session has its own auth folder, connection, and event handlers.
 * All sessions share the Deduplicator, LoadBalancer, and SharedData.
 */

import fs from 'fs';
import path from 'path';
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

class SessionManager {
    constructor() {
        /** @type {Map<number, object>} sessionIndex → socket */
        this.sockets = new Map();
        /** @type {Map<number, boolean>} sessionIndex → connected */
        this.connected = new Map();
        this.sessionsDir = path.join(process.cwd(), 'sessions');
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

        const startPromises = [];
        for (let i = 1; i <= count; i++) {
            startPromises.push(this._startSession(i));
        }

        await Promise.allSettled(startPromises);
    }

    /**
     * Start a single session.
     * @param {number} sessionIndex - 1-based
     */
    async _startSession(sessionIndex) {
        const sessionPath = path.join(this.sessionsDir, `session-${sessionIndex}`);

        // Ensure session folder
        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }

        try {
            const { version } = await fetchLatestBaileysVersion();
            const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

            const sock = makeWASocket({
                version,
                logger: pino({ level: 'silent' }),
                browser: Browsers.macOS('Chrome'),
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(
                        state.keys,
                        pino({ level: 'fatal' }).child({ level: 'fatal' })
                    ),
                },
                markOnlineOnConnect: true,
                generateHighQualityLinkPreview: false,
                syncFullHistory: false,
                getMessage: async () => ({ conversation: '' }),
                defaultQueryTimeoutMs: 60000,
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 10000,
            });

            // Store socket
            this.sockets.set(sessionIndex, sock);

            // ─── Creds update ───
            sock.ev.on('creds.update', saveCreds);

            // ─── Connection update ───
            sock.ev.on('connection.update', async (update) => {
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
            // Retry after delay
            await delay(5000);
            return this._startSession(sessionIndex);
        }
    }

    /**
     * Handle connection state changes.
     */
    async _handleConnectionUpdate(sessionIndex, sock, update) {
        const { connection, lastDisconnect, qr } = update;

        if (connection === 'open') {
            this.connected.set(sessionIndex, true);
            loadBalancer.register(sessionIndex, sock);

            const user = sock.user || {};
            const phoneNum = user.id?.split(':')[0] || 'unknown';

            log('success', `Connected! Phone: ${phoneNum}`, sessionIndex);

            // Send a startup message to self
            try {
                const botJid = `${phoneNum}@s.whatsapp.net`;
                await sock.sendMessage(botJid, {
                    text: `🐝 JUANCHOTE-SWARM\n\n✅ Session S${sessionIndex} connected\n⏰ ${new Date().toLocaleString('es-CO', { timeZone: config.timeZone })}\n🤖 Bot: ${config.botName}`,
                });
            } catch (_e) { /* silent */ }
        }

        if (connection === 'close') {
            this.connected.set(sessionIndex, false);
            loadBalancer.unregister(sessionIndex);

            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== 401;

            if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                log('warn', `Logged out. Clearing session for re-pairing...`, sessionIndex);
                const sessionPath = path.join(this.sessionsDir, `session-${sessionIndex}`);
                try {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                } catch (_e) { /* silent */ }
                await delay(3000);
                this._startSession(sessionIndex);
                return;
            }

            if (shouldReconnect) {
                log('warn', `Disconnected (code: ${statusCode}). Reconnecting in 5s...`, sessionIndex);
                await delay(5000);
                this._startSession(sessionIndex);
            }
        }
    }

    /**
     * Handle pairing code flow for a new session.
     */
    async _handlePairing(sessionIndex, sock) {
        const pairingNumbers = config.pairingNumbers || [];
        let phoneNumber = pairingNumbers[sessionIndex - 1] || '';

        if (!phoneNumber) {
            // If no pairing number configured, try interactive input
            if (process.stdin.isTTY) {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });

                phoneNumber = await new Promise((resolve) => {
                    rl.question(`[S${sessionIndex}] Enter WhatsApp number (e.g. 573001234567): `, (answer) => {
                        rl.close();
                        resolve(answer.trim());
                    });
                });
            } else {
                log('warn', `No pairing number for session ${sessionIndex}. Set PAIRING_NUMBERS in .env`, sessionIndex);
                return;
            }
        }

        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (!phoneNumber) {
            log('error', `Invalid phone number for session ${sessionIndex}`, sessionIndex);
            return;
        }

        const pn = parsePhoneNumber(`+${phoneNumber}`);
        if (!pn.valid) {
            log('error', `Invalid phone format: ${phoneNumber}`, sessionIndex);
            return;
        }

        // Wait for connection to be ready
        await delay(3000);

        try {
            let code = await sock.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join('-') || code;
            log('success', `Pairing code: ${code}`, sessionIndex);
            console.log(`\n  🔑 [S${sessionIndex}] PAIRING CODE: ${code}\n`);
        } catch (err) {
            log('error', `Pairing failed: ${err.message}`, sessionIndex);
            await delay(5000);
            this._startSession(sessionIndex);
        }
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
