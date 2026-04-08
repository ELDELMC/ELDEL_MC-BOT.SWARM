import 'dotenv/config';

const _prefixes = process.env.PREFIXES
    ? process.env.PREFIXES.split(',')
    : ['.', '!', '/', '#'];

const config = {
    // ─── Bot Identity ───
    botName: process.env.BOT_NAME || '⸙𝙴𝙻𝙳𝙴𝙻_𝙼𝙲-𝙱𝙾𝚃⸙',
    ownerNumber: process.env.OWNER_NUMBER || '',
    author: process.env.AUTHOR || 'ELDEL_MC',

    // ─── Sessions ───
    sessionCount: Number(process.env.SESSION_COUNT) || 2,
    // Device names for display (e.g., BOT_ROTO, PERSONAL)
    deviceNames: [
        process.env.BOT_ROTO ? 'BOT_ROTO' : 'Session 1',
        process.env.PERSONAL ? 'PERSONAL' : 'Session 2',
        process.env.SESION_3 ? 'SESION_3' : 'Session 3',
        process.env.SESION_4 ? 'SESION_4' : 'Session 4',
    ],
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
};

export default config;
