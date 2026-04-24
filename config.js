import 'dotenv/config';

// Export dynamic getters so changes to process.env (e.g., via .env edits)
// are visible at runtime without reloading modules.
const config = {
    // ─── Bot Identity ───
    get botName() { return process.env.BOT_NAME || '⸙𝙴𝙻𝙳𝙴𝙻_𝙼𝙲-𝙱𝙾𝚃⸙'; },
    get ownerNumber() { return process.env.OWNER_NUMBER || ''; },
    get author() { return process.env.AUTHOR || 'ELDEL_MC'; },

    // ─── Sessions ───
    get sessionCount() { return Number(process.env.SESSION_COUNT) || 2; },
    get deviceNames() {
        const count = this.sessionCount;
        const names = [];
        for (let i = 0; i < count; i++) {
            const envVar = i === 0 ? 'BOT_ROTO' : i === 1 ? 'PERSONAL' : `SESION_${i + 1}`;
            names.push(process.env[envVar] || `Session ${i + 1}`);
        }
        return names;
    },
    // Pairing numbers: comma-separated, e.g. "573001234567,573009876543"
    get pairingNumbers() {
        return process.env.PAIRING_NUMBERS
            ? process.env.PAIRING_NUMBERS.split(',').map(n => n.trim()).filter(Boolean)
            : [];
    },

    // ─── Commands ───
    get prefixes() { return process.env.PREFIXES ? process.env.PREFIXES.split(',') : ['.', '!', '/', '#']; },
    get prefix() { return this.prefixes[0]; },
    get commandMode() { return process.env.COMMAND_MODE || 'public'; },

    // ─── Server ───
    get port() { return Number(process.env.PORT) || 3000; },
    get timeZone() { return process.env.TIMEZONE || 'America/Bogota'; },

    // ─── Performance ───
    get deduplicatorTTL() { return Number(process.env.DEDUP_TTL) || 60; },        // seconds
    get adminCacheTTL() { return Number(process.env.ADMIN_CACHE_TTL) || 300; },   // seconds
    get sharedDataCacheMs() { return Number(process.env.DATA_CACHE_MS) || 5000; }, // ms

    // ─── Warn system ───
    get warnCount() { return Number(process.env.WARN_COUNT) || 3; },

    // ─── ESTABILIDAD 24/7 (Nuevos) ───
    get keepAliveMs() { return Number(process.env.KEEPALIVE_MS) || 60000; },
    get watchdogTimeoutMs() { return Number(process.env.WATCHDOG_TIMEOUT_MS) || 180000; },
    get maxReconnectAttempts() { return Number(process.env.MAX_RECONNECT_ATTEMPTS) || 10; },
    get baseReconnectDelayMs() { return Number(process.env.RECONNECT_DELAY_MS) || 15000; },
};

export default config;
