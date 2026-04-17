import 'dotenv/config';

const _prefixes = process.env.PREFIXES
    ? process.env.PREFIXES.split(',')
    : ['.', '!', '/', '#'];

const _sessionCount = Number(process.env.SESSION_COUNT) || 2;

// Generate device names dynamically based on SESSION_COUNT
const _deviceNames = [];
for (let i = 0; i < _sessionCount; i++) {
    const envVar = i === 0 ? 'BOT_ROTO' : i === 1 ? 'PERSONAL' : `SESION_${i + 1}`;
    _deviceNames.push(process.env[envVar] || `Session ${i + 1}`);
}

const config = {
    // ─── Bot Identity ───
    botName: process.env.BOT_NAME || '⸙𝙴𝙻𝙳𝙴𝙻_𝙼𝙲-𝙱𝙾𝚃⸙',
    ownerNumber: process.env.OWNER_NUMBER || '',
    author: process.env.AUTHOR || 'ELDEL_MC',

    // ─── Sessions ───
    sessionCount: _sessionCount,
    deviceNames: _deviceNames,
    // Pairing numbers: comma-separated, e.g. "573001234567,573009876543"
    pairingNumbers: process.env.PAIRING_NUMBERS
        ? process.env.PAIRING_NUMBERS.split(',').map(n => n.trim())
        : [],

    // ─── Commands ───
    prefixes: _prefixes,
    prefix: _prefixes[0],
    commandMode: process.env.COMMAND_MODE || 'public',

    // ─── Server ───
    port: Number(process.env.PORT) || 3000,
    timeZone: process.env.TIMEZONE || 'America/Bogota',

    // ─── Performance ───
    deduplicatorTTL: Number(process.env.DEDUP_TTL) || 60,        // seconds
    adminCacheTTL: Number(process.env.ADMIN_CACHE_TTL) || 300,   // seconds
    sharedDataCacheMs: Number(process.env.DATA_CACHE_MS) || 5000, // ms

    // ─── Warn system ───
    warnCount: Number(process.env.WARN_COUNT) || 3,

    // ─── ESTABILIDAD 24/7 (Nuevos) ───
    // Keep-alive activo cada X ms (default 60000)
    keepAliveMs: Number(process.env.KEEPALIVE_MS) || 60000,
    // Watchdog timeout en ms (default 180000 = 3 min)
    watchdogTimeoutMs: Number(process.env.WATCHDOG_TIMEOUT_MS) || 180000,
    // Max reconnection attempts antes de requerir intervención
    maxReconnectAttempts: Number(process.env.MAX_RECONNECT_ATTEMPTS) || 10,
    // Delay base para reconexiones en ms (default 15000)
    baseReconnectDelayMs: Number(process.env.RECONNECT_DELAY_MS) || 15000,
};

export default config;
