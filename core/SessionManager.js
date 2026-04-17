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
import errorReporter from './ErrorReporter.js';

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
        // Track sessions currently requesting a pairing code to avoid duplicate calls
        this.pairingInProgress = new Set();
        // Lock timeout: if a lock is older than this, it's considered stale (5 minutes)
        this.lockTimeoutMs = 5 * 60 * 1000;
        // Track reconnection attempts for error reporting
        this.reconnectionAttempts = new Map();
        // Max reconnection attempts before giving up and requiring manual intervention
        this.maxReconnectionAttempts = config.maxReconnectAttempts || 10;
        
        // ─── ESTABILIDAD MEJORADA ───
        // Backoff exponencial: sessionIndex → { attempt, lastAttempt }
        this.reconnectBackoff = new Map();
        // Sesiones que están en proceso de cierre para evitar restart loops
        this.closingSessions = new Map();
        // Historial de desconexiones para análisis
        this.disconnectHistory = new Map();
        // Keep-alive intervals por sesión
        this.keepAliveIntervals = new Map();
        // Watchdog intervals
        this.watchdogIntervals = new Map();
        // Config de estabilidad
        this.keepAliveMs = config.keepAliveMs || 60000;
        this.watchdogTimeoutMs = config.watchdogTimeoutMs || 180000;
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
     * SECUENCIAL: Solo inicia siguiente sesión cuando la anterior esté conectada.
     */
    async startAll() {
        const count = config.sessionCount || 2;

        // Ensure sessions directory
        if (!fs.existsSync(this.sessionsDir)) {
            fs.mkdirSync(this.sessionsDir, { recursive: true });
        }

        log('session', `Starting ${count} sessions sequentially...`);

        // Start sessions SECUENCIALMENTE - espera que una se conecte antes de iniciar la otra
        for (let i = 1; i <= count; i++) {
            if (i > 1) {
                // Esperar a que la sesión anterior esté conectada (10 min timeout para dar tiempo de escanear)
                log('info', `Esperando conexión de S${i-1} antes de iniciar S${i}...`, i);
                await this._waitForConnection(i - 1, 600000); // 10 min timeout
                
                // Verificar si realmente se conectó
                if (!this.connected.get(i - 1)) {
                    log('error', `S${i-1} no se conectó. No se iniciarán más sesiones.`, i);
                    break;
                }
                
                log('success', `S${i-1} conectada. Iniciando S${i}...`, i);
                
                // Delay adicional antes de iniciar siguiente sesión (30s)
                await delay(30000);
            }
            
            // Iniciar sesión
            this._startSession(i).catch(err => {
                log('error', `Failed to start session ${i}: ${err.message}`, i);
            });
            
            // Si no es la última sesión, esperar un poco antes de iniciar el ciclo de espera
            if (i < count) {
                // Delay inicial antes de empezar a esperar (30s)
                await delay(30000);
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
                
                // ─── CONNECTION SETTINGS (OPTIMIZADO PARA ESTABILIDAD) ───
                defaultQueryTimeoutMs: 180000,        // 3 min para queries
                connectTimeoutMs: 120000,            // 2 min para conectar
                keepAliveIntervalMs: 45000,          // 45s (no tan agresivo)
                qrTimeout: 300000,
                maxDiffSyncMs: 86400000,
                
                // ─── RETRY SETTINGS (OPTIMIZADOS) ───
                retryRequestDelayMs: 200,
                maxMsgsInMemory: 100,
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
                console.log(`\n[S${sessionIndex}] Opciones de vinculación para Session ${sessionIndex}:`);
                console.log(`\n1. Escanea el QR a continuación:`);
                console.log(await QRCode.toString(qr, { type: 'terminal', small: true }));
                console.log(`\n2. O usa Código de Vinculación (configure BOT_ROTO/PERSONAL o PAIRING_NUMBERS/OWNER_NUMBER en .env)`);
                log('info', `QR generado. Esperando escaneo o código...`, sessionIndex);
            } catch (_e) {
                log('info', `QR generado (no se pudo renderizar)`, sessionIndex);
            }

            const pairingNumbers = config.pairingNumbers || [];
            const deviceNameValue = config.deviceNames[sessionIndex - 1];
            const availableNumber = process.env[`PAIRING_NUMBER_${sessionIndex}`] ||
                pairingNumbers[sessionIndex - 1] ||
                config.ownerNumber ||
                (deviceNameValue !== `Session ${sessionIndex}` ? deviceNameValue : null);

            if (availableNumber && !this.pairingInProgress.has(sessionIndex)) {
                // Start pairing in background
                this._handlePairing(sessionIndex, sock).catch(err => {
                    log('error', `Background pairing error: ${err.message}`, sessionIndex);
                });
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
            
            // Reset reconnection attempt counter on successful connection
            this._resetBackoff(sessionIndex);
            this.reconnectionAttempts.delete(sessionIndex);
            
            // Iniciar keep-alive activo
            this._startKeepAlive(sessionIndex);
            
            // Iniciar watchdog
            this._startWatchdog(sessionIndex);
            
            log('info', `Keep-alive y watchdog activados para S${sessionIndex}`, sessionIndex);
        }

        if (connection === 'close') {
            // Verificar si está en proceso de cierre para evitar restart loops
            if (this._isClosing(sessionIndex)) {
                log('info', `S${sessionIndex} en proceso de cierre, ignorando disconnect`, sessionIndex);
                return;
            }
            
            const currentSock = this.sockets.get(sessionIndex);
            
            this.connected.set(sessionIndex, false);
            loadBalancer.unregister(sessionIndex);
            this.sockets.delete(sessionIndex);

            // Detener keep-alive y watchdog
            this._stopKeepAlive(sessionIndex);
            this._stopWatchdog(sessionIndex);

            // CRITICAL: If the connection closed, we MUST allow the session to be restarted
            if (this.starting.has(sessionIndex)) {
                log('info', `Unblocking S${sessionIndex} 'starting' state due to socket closure.`, sessionIndex);
                this.starting.delete(sessionIndex);
            }

            const statusCode = lastDisconnect?.error?.output?.statusCode || 0;
            const errorMsg = lastDisconnect?.error?.message || lastDisconnect?.error?.toString?.() || `Code: ${statusCode}`;
            const isRegistered = sock.authState?.creds?.registered === true;
            
            log('warn', `Cerrada. Código: ${statusCode}, Error: ${errorMsg}, Registrado: ${isRegistered}`, sessionIndex);
            
            // ─── PROTEGER CONTRA RESTART LOOPS ───
            // Si hay muchos intentos recientes, aumentar delay
            const recentAttempts = this.reconnectionAttempts.get(sessionIndex) || 0;
            if (recentAttempts > 3) {
                log('warn', `S${sessionIndex} múltiples desconexiones. Aplicandobackoff agresivo...`, sessionIndex);
            }
            
            // ─── REPORT SIGNIFICANT DISCONNECTIONS ───
            const reportableErrors = [401, 404, 440, 515, 428, DisconnectReason.loggedOut, DisconnectReason.restartRequired];
            if (reportableErrors.includes(statusCode) && isRegistered) {
                const reconnectAttempts = (this.reconnectionAttempts.get(sessionIndex) || 0) + 1;
                this.reconnectionAttempts.set(sessionIndex, reconnectAttempts);
                
                // Check if we've exceeded max reconnection attempts
                if (reconnectAttempts > this.maxReconnectionAttempts) {
                    log('error', `S${sessionIndex} exceeded max reconnection attempts (${this.maxReconnectionAttempts}). Stopping auto-reconnect.`, sessionIndex);
                    this.awaitingPairing.add(sessionIndex);
                    // Don't restart, require manual intervention
                    return;
                }
                
                // Report error asynchronously to avoid blocking reconnection logic
                errorReporter.handleSessionDisconnection(sessionIndex, lastDisconnect?.error, reconnectAttempts).catch(err => {
                    log('warn', `Failed to report session disconnection: ${err.message}`);
                });
            }
            
            // ─── USAR DELAY INTELIGENTE ───
            // Si tiene credenciales = reintento rápido
            // Si NO tiene credenciales = delay largo para QR
            const delayMs = this._getReconnectDelay(sessionIndex, statusCode);
            
            // Strategic reconnect logic based on error codes
            const criticalErrors = [DisconnectReason.loggedOut, 404];
            const recoveryErrors = [515, 428, 401, DisconnectReason.restartRequired];
            
            if (criticalErrors.includes(statusCode)) {
                // Reset reconnection attempts on critical error
                this.reconnectionAttempts.delete(sessionIndex);
                
                if (this.starting.has(sessionIndex)) {
                     log('warn', `Already restarting session ${sessionIndex}, skipping duplicate request`, sessionIndex);
                     return;
                }
                
                // CRITICAL: Wipe and require re-pairing only if not registered
                if (!isRegistered) {
                    log('error', `Error crítico ${statusCode} sin registro. Limpiando sesión...`, sessionIndex);
                    const sessionPath = path.join(this.sessionsDir, `session-${sessionIndex}`);
                    try {
                        fs.rmSync(sessionPath, { recursive: true, force: true });
                        fs.mkdirSync(sessionPath, { recursive: true });
                    } catch (_) {}
                    this.awaitingPairing.add(sessionIndex);
                    log('info', `Sesión limpiada. Re-intentando inicio para vinculación (delay: ${delayMs/1000}s)...`, sessionIndex);
                    
                    await delay(delayMs);
                    await this._startSession(sessionIndex);
                    return;
                } else {
                    // Registered but got logged out - try to recover WITHOUT clearing session
                    log('warn', `Sesión ${sessionIndex} desconectada pero registrada. Reintentando sin borrar credenciales (delay: ${delayMs/1000}s)...`, sessionIndex);
                    this._markAsClosing(sessionIndex, delayMs);
                    await delay(delayMs);
                    await this._startSession(sessionIndex);
                    return;
                }
            }

            if (statusCode === 440) {
                log('warn', `Conflicto detectado (440). Esperando delay (${delayMs/1000}s)...`, sessionIndex);
                this._markAsClosing(sessionIndex, delayMs);
                await delay(delayMs);
                await this._startSession(sessionIndex);
                return;
            }
            
            if (recoveryErrors.includes(statusCode)) {
                if (this.starting.has(sessionIndex)) {
                    log('info', `Session S${sessionIndex} already has a start operation in progress. Waiting for it...`, sessionIndex);
                    return;
                }

                if (isRegistered && (statusCode === 401 || statusCode === 428)) {
                    // Sesión registrada - delay rápido
                    log('warn', `Conflicto (${statusCode}). Delay: ${delayMs/1000}s sin borrar sesión...`, sessionIndex);
                    this._markAsClosing(sessionIndex, delayMs);
                    await delay(delayMs);
                    await this._startSession(sessionIndex);
                } else if (isRegistered && (statusCode === 515 || statusCode === DisconnectReason.restartRequired)) {
                    log('info', `Reinicio automático de sesión registrada...`, sessionIndex);
                    await delay(8000);
                    await this._startSession(sessionIndex);
                } else {
                    // Primera vinculación - delay largo
                    if (statusCode === 515 || statusCode === DisconnectReason.restartRequired) {
                        log('info', `Stream error durante vinculación. Reiniciando (delay: ${delayMs/1000}s)...`, sessionIndex);
                        await delay(delayMs);
                        await this._startSession(sessionIndex);
                    } else {
                        log('info', `Error de recuperación (${statusCode}). Reiniciando pairing (delay: ${delayMs/1000}s)...`, sessionIndex);
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
            
            // Transient errors: usar backoff exponencial
            if (!this.starting.has(sessionIndex)) {
                const delayMs = Math.max(backoffDelay, 15000);
                log('warn', `Reconectando con backoff (${delayMs / 1000}s)...`, sessionIndex);
                this._markAsClosing(sessionIndex, delayMs);
                await delay(delayMs);
                await this._startSession(sessionIndex);
            }
        }
    }

    async _handlePairing(sessionIndex, sock) {
        if (this.pairingInProgress.has(sessionIndex)) {
            return;
        }
        this.pairingInProgress.add(sessionIndex);

        try {
            const pairingNumbers = config.pairingNumbers || [];
            const deviceNameValue = config.deviceNames[sessionIndex - 1];
            let phoneNumberInput = process.env[`PAIRING_NUMBER_${sessionIndex}`] ||
                                 pairingNumbers[sessionIndex - 1] ||
                                 config.ownerNumber ||
                                 (deviceNameValue !== `Session ${sessionIndex}` ? deviceNameValue : null);

            const doPairing = async (num, attempt = 1) => {
                // Stop if socket was replaced or closed AND we're not expecting reconnection
                if (this.sockets.get(sessionIndex) !== sock && !this.starting.has(sessionIndex)) return;
                // Don't stop on connection close during pairing - let it retry
                // if (this.connected.get(sessionIndex) === false) {
                //     log('warn', `Stopping pairing loop: connection closed`, sessionIndex);
                //     return;
                // }

                if (!num) {
                    // INTERACTIVE PROMPT: Only if it's the current socket and it's still alive
                    if (process.stdin.isTTY) {
                        const rl = readline.createInterface({
                            input: process.stdin,
                            output: process.stdout,
                        });
                        
                        log('info', "Waiting for number input... QR scan will also work.", sessionIndex);
                        
                        num = await new Promise((resolve) => {
                            // Close prompt if socket becomes connected via QR elsewhere
                            const checkInterval = setInterval(() => {
                                if (this.connected.get(sessionIndex) === true || this.sockets.get(sessionIndex) !== sock) {
                                    clearInterval(checkInterval);
                                    rl.close();
                                    resolve(null);
                                }
                            }, 2000);

                            rl.question(`Please type your WhatsApp number for Session ${sessionIndex} \nFormat: 573001234567 (without + or spaces) : `, (answer) => {
                                clearInterval(checkInterval);
                                rl.close();
                                resolve(answer.trim());
                            });
                        });
                        
                        // If resolve(null) was called because it connected via QR, num will be null
                        if (!num) return; 
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
                    console.log(`\n2. Código de Vinculación generado para [${deviceName}]: ${code}`);
                    console.log(`   📱 Vincular en WhatsApp → Configuración → Dispositivos vinculados → Vincular dispositivo`);
                    console.log(`   ⏱️  Tienes 5 minutos para ingresar el código: ${code}\n`);
                    // Success - don't retry until connection closes
                    return;
                } catch (err) {
                    const errorMsg = err?.message || err?.toString?.() || 'Unknown error';
                    if (errorMsg.includes('Connection Closed') || errorMsg.includes('Stream Errored')) {
                        log('warn', `Pairing interrupted by connection error. Waiting 30s before retry...`, sessionIndex);
                        await delay(30000); // 30s delay on connection error
                    } else if (attempt < 5) { // Reducido de 12 a 5 intentos
                        // Progressive delays: 30s, 45s, 60s, 90s, 120s
                        const delayTime = [30000, 45000, 60000, 90000, 120000][attempt - 1] || 60000;
                        log('warn', `Pairing failed (attempt ${attempt}/5): ${errorMsg}. Retrying in ${delayTime/1000}s...`, sessionIndex);
                        await delay(delayTime);
                        return doPairing(num, attempt + 1);
                    } else {
                        log('error', `❌ Pairing failed after 5 attempts: ${errorMsg}. Esperando 2 min...`, sessionIndex);
                        await delay(120000); // Wait 2 min before trying again
                        return doPairing(num, 1); // Reset attempts
                    }
                }
            };

            // Intelligent wait: poll for readiness instead of blind 25s
            let isReady = false;
            let attempts = 0;
            while (!isReady && attempts < 60) { // Increased from 30 to 60 attempts
                if (this.sockets.get(sessionIndex) !== sock) return;
                if (sock.authState?.creds?.noiseKey) {
                    isReady = true;
                    break;
                }
                await delay(1000);
                attempts++;
            }

            if (!isReady) {
                log('warn', `Socket not ready for pairing after 60s. Proceeding anyway...`, sessionIndex);
                // Don't return - try pairing even if not fully ready
            }

            await doPairing(phoneNumberInput);
        } finally {
            this.pairingInProgress.delete(sessionIndex);
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

    // ═══════════════════════════════════════════════════════════
    // │          MEJORAS DE ESTABILIDAD 24/7                      │
    // ═══════════════════════════════════════════════════════════

    /**
     * Verificar si una sesión tiene credenciales válidas guardadas
     * @returns {boolean} true si la sesión ya está vinculada
     */
    _hasExistingCredentials(sessionIndex) {
        const sessionPath = path.join(this.sessionsDir, `session-${sessionIndex}`);
        const credsPath = path.join(sessionPath, 'creds.json');
        
        try {
            if (fs.existsSync(credsPath)) {
                const stats = fs.statSync(credsPath);
                if (stats.size > 100) {
                    // Verificar que sea JSON válido
                    const raw = fs.readFileSync(credsPath, 'utf-8');
                    const creds = JSON.parse(raw);
                    return creds?.registered === true;
                }
            }
        } catch (_) { /* ignore */ }
        
        return false;
    }

    /**
     * Calcular delay de reconexión basándose en si hay credenciales o no
     * - Si hay credenciales (sesión ya была): reintento rápido
     * - Si no hay credenciales (primer inicio): delay largo para QR
     */
    _getReconnectDelay(sessionIndex, statusCode) {
        const hasCredentials = this._hasExistingCredentials(sessionIndex);
        
        if (hasCredentials) {
            // Sesión ya была vinculada - reintento rápido como antes
            return this._calculateBackoff(sessionIndex, statusCode);
        } else {
            // Primera vinculación - delay largo para escanear QR
            const longDelays = {
                401: 60000,    // 1 min
                428: 30000,    // 30s
                440: 120000,   // 2 min
                404: 60000,    // 1 min
                515: 45000,    // 45s
            };
            return longDelays[statusCode] || 60000;
        }
    }

    /**
     * Verificar si es primer inicio (sin credenciales)
     */
    _isFirstTimeSetup(sessionIndex) {
        return !this._hasExistingCredentials(sessionIndex);
    }

    /**
     * Calcular delay de reconexión con backoff exponencial (solo para sesiones ya vinculadas)
     */
    _calculateBackoff(sessionIndex, statusCode) {
        const backoff = this.reconnectBackoff.get(sessionIndex) || { attempt: 0 };
        backoff.attempt++;
        backoff.lastAttempt = Date.now();
        this.reconnectBackoff.set(sessionIndex, backoff);

        // Delays base por código de error
        const baseDelays = {
            401: 60000,    // 1 min
            428: 15000,    // 15s
            440: 120000,   // 2 min
            404: 30000,    // 30s
            515: 8000,     // 8s
        };

        const baseDelay = baseDelays[statusCode] || 15000;
        
        // Backoff exponencial: delay * 2^attempt (max 5 minutos)
        const exponentialDelay = Math.min(baseDelay * Math.pow(1.5, backoff.attempt - 1), 300000);
        
        // Reset después de 5 minutos sin intentos
        const timeSinceLastAttempt = Date.now() - (backoff.lastAttempt || 0);
        if (timeSinceLastAttempt > 300000) {
            backoff.attempt = 0;
            this.reconnectBackoff.set(sessionIndex, backoff);
        }

        return exponentialDelay;
    }

    /**
     * Resetear backoff después de reconexión exitosa
     */
    _resetBackoff(sessionIndex) {
        this.reconnectBackoff.set(sessionIndex, { attempt: 0, lastAttempt: null });
        this.reconnectionAttempts.delete(sessionIndex);
    }

    /**
     * Iniciar keep-alive activo para una sesión
     * Envía ping periódico para mantener conexión viva
     */
    _startKeepAlive(sessionIndex) {
        // Limpiar intervalo anterior si existe
        this._stopKeepAlive(sessionIndex);

        const interval = setInterval(async () => {
            const sock = this.sockets.get(sessionIndex);
            if (!sock || !this.connected.get(sessionIndex)) {
                this._stopKeepAlive(sessionIndex);
                return;
            }

            try {
                // Enviar presencia para mantener alive
                await sock.sendPresence('available').catch(() => {});
                log('debug', `Keep-alive sent to S${sessionIndex}`, sessionIndex);
            } catch (err) {
                log('warn', `Keep-alive failed for S${sessionIndex}: ${err.message}`, sessionIndex);
            }
        }, this.keepAliveMs);

        this.keepAliveIntervals.set(sessionIndex, interval);
    }

    /**
     * Detener keep-alive
     */
    _stopKeepAlive(sessionIndex) {
        const interval = this.keepAliveIntervals.get(sessionIndex);
        if (interval) {
            clearInterval(interval);
            this.keepAliveIntervals.delete(sessionIndex);
        }
    }

    /**
     * Iniciar watchdog para detectar sesiones colgadas
     */
    _startWatchdog(sessionIndex) {
        // Limpiar watchdog anterior
        this._stopWatchdog(sessionIndex);

        let lastMessageTime = Date.now();

        const interval = setInterval(async () => {
            const sock = this.sockets.get(sessionIndex);
            if (!sock) {
                this._stopWatchdog(sessionIndex);
                return;
            }

            // Verificar si la conexión está responsive
            const now = Date.now();
            const timeSinceLastContact = now - lastMessageTime;

            if (timeSinceLastContact > this.watchdogTimeoutMs) {
                log('warn', `S${sessionIndex} sin actividad por ${Math.round(timeSinceLastContact/1000)}s. Verificando conexión...`, sessionIndex);
                
                try {
                    // Forzar verificación con un query simple
                    await sock.fetchContacts(1).then(() => {
                        lastMessageTime = Date.now(); // Actualizar si responde
                    }).catch(() => {
                        // No respondió - puede estar colgada
                        log('warn', `S${sessionIndex} no responde. Reconectando...`, sessionIndex);
                        this._startSession(sessionIndex);
                    });
                } catch (err) {
                    log('warn', `Watchdog error S${sessionIndex}: ${err.message}`, sessionIndex);
                }
            }
        }, this.watchdogTimeoutMs / 2); // Verificar cada mitad del timeout

        this.watchdogIntervals.set(sessionIndex, interval);
    }

    /**
     * Detener watchdog
     */
    _stopWatchdog(sessionIndex) {
        const interval = this.watchdogIntervals.get(sessionIndex);
        if (interval) {
            clearInterval(interval);
            this.watchdogIntervals.delete(sessionIndex);
        }
    }

    /**
     * Marcar sesión como closing para evitar restart loops
     */
    _markAsClosing(sessionIndex, durationMs = 30000) {
        this.closingSessions.set(sessionIndex, Date.now() + durationMs);
        
        // Auto-limpiar después del duration
        setTimeout(() => {
            this.closingSessions.delete(sessionIndex);
        }, durationMs + 5000);
    }

    /**
     * Verificar si sesión está en proceso de cierre
     */
    _isClosing(sessionIndex) {
        const closingTime = this.closingSessions.get(sessionIndex);
        if (!closingTime) return false;
        return Date.now() < closingTime;
    }

    /**
     * Cleanup completo de todos los intervalos
     */
    cleanupAll() {
        // Limpiar keep-alives
        for (const sessionIndex of this.keepAliveIntervals.keys()) {
            this._stopKeepAlive(sessionIndex);
        }
        
        // Limpiar watchdogs
        for (const sessionIndex of this.watchdogIntervals.keys()) {
            this._stopWatchdog(sessionIndex);
        }
        
        // Limpiar backoffs
        this.reconnectBackoff.clear();
        
        log('info', 'SessionManager cleanup completed');
    }
}

export default new SessionManager();
