/**
 * ─── JUANCHOTE-SWARM ───
 * Multi-session WhatsApp bot with load balancing.
 * Entry point.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import express from 'express';
import config from './config.js';
import { log, logBanner } from './core/Logger.js';
import commandHandler from './core/CommandHandler.js';
import sessionManager from './core/SessionManager.js';
import sharedData from './core/SharedData.js';

// ─── Data defaults ───
const DATA_DEFAULTS = {
    'banned.json': [],
    'owner.json': [config.ownerNumber],
    'warnings.json': {},
};

// ─── Ensure data files ───
for (const [file, defaultValue] of Object.entries(DATA_DEFAULTS)) {
    sharedData.ensure(file, defaultValue);
}

// ─── Express health-check server (required by Pterodactyl) ───
const app = express();
const PORT = config.port || 3000;

app.get('/', (_req, res) => {
    const status = sessionManager.getStatus();
    res.json({
        bot: config.botName,
        uptime: process.uptime(),
        sessions: status,
        memory: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB`,
    });
});

app.listen(PORT, () => {
    log('success', `Health server on port ${PORT}`);
});

// ─── Memory watchdog ───
setInterval(() => {
    const usedMB = process.memoryUsage().rss / 1024 / 1024;
    if (usedMB > 450) {
        log('warn', `RAM too high (${usedMB.toFixed(0)}MB > 450MB). Restarting...`);
        process.exit(1);
    }
}, 30_000);

// ─── Temp folder ───
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
process.env.TMPDIR = tempDir;
process.env.TEMP = tempDir;
process.env.TMP = tempDir;

// Cleanup temp every hour
setInterval(() => {
    try {
        const files = fs.readdirSync(tempDir);
        const now = Date.now();
        for (const file of files) {
            const fp = path.join(tempDir, file);
            const stats = fs.statSync(fp);
            if (now - stats.mtimeMs > 3 * 60 * 60 * 1000) {
                fs.unlinkSync(fp);
            }
        }
    } catch (_e) { /* silent */ }
}, 60 * 60 * 1000);

// ─── Error handlers ───
process.on('uncaughtException', (err) => {
    log('error', `Uncaught Exception: ${err.message}`);
    console.error(err.stack);
});

process.on('unhandledRejection', (err) => {
    log('error', `Unhandled Rejection: ${err?.message || err}`);
    if (err?.stack) console.error(err.stack);
});

// ─── MAIN ───
async function main() {
    logBanner(config.sessionCount);

    // Load commands
    await commandHandler.loadCommands();
    commandHandler.watchPlugins();

    log('info', `Loaded ${commandHandler.commands.size} commands`);
    log('info', `Prefixes: ${config.prefixes.join(', ')}`);
    log('info', `Sessions: ${config.sessionCount}`);
    log('info', `Mode: ${config.commandMode}`);

    // Start all sessions
    await sessionManager.startAll();

    log('success', 'JUANCHOTE-SWARM is running!');
}

main().catch((err) => {
    log('error', `Fatal: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
});
