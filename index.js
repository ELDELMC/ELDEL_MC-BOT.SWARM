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
import errorReporter from './core/ErrorReporter.js';
import { startFlushCycle } from './core/spyMode.js';

// ─── Global error handlers ───
let errorHandlerReady = false;

// Flag to prevent exit during error reporting
let isShuttingDown = false;

process.on('unhandledRejection', async (reason, promise) => {
    log('error', `Unhandled Promise Rejection: ${String(reason).substring(0, 100)}`);
    
    if (errorHandlerReady && !isShuttingDown) {
        try {
            await errorReporter.handleUnhandledRejection(reason, promise);
        } catch (err) {
            log('error', `Failed to report rejection: ${err.message}`);
        }
    }
});

process.on('uncaughtException', async (err) => {
    isShuttingDown = true;
    log('error', `Uncaught Exception: ${err.message}`);
    console.error(err.stack);
    
    if (errorHandlerReady) {
        try {
            await errorReporter.handleUncaughtException(err);
        } catch (reportErr) {
            log('error', `Failed to report exception: ${reportErr.message}`);
        }
    }
    
    // Exit cleanly after attempting to report
    setTimeout(() => process.exit(1), 3000);
});

// ─── Data defaults ───
const DATA_DEFAULTS = {
    'banned.json': [],
    'owner.json': [config.ownerNumber],
    'warnings.json': {},
    'activity.json': {},
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

// Start server with port fallback
let server;
const tryPort = (port, maxAttempts = 3) => {
    return new Promise((resolve, reject) => {
        const srv = app.listen(port, () => {
            log('success', `Health server on port ${port}`);
            resolve(srv);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE' && maxAttempts > 1) {
                log('warn', `Port ${port} in use, trying ${port + 1}...`);
                tryPort(port + 1, maxAttempts - 1).then(resolve).catch(reject);
            } else {
                reject(err);
            }
        });
    });
};

tryPort(PORT).then(srv => {
    server = srv;
}).catch(err => {
    log('error', `Failed to start health server: ${err.message}`);
    process.exit(1);
});

// Graceful shutdown for Express server
const shutdown = () => {
    log('info', 'Received shutdown signal, closing Express server...');
    
    // Clean up session locks
    try {
        const sessionsDir = path.join(process.cwd(), 'sessions');
        if (fs.existsSync(sessionsDir)) {
            const sessionFolders = fs.readdirSync(sessionsDir);
            for (const folder of sessionFolders) {
                if (folder.startsWith('session-')) {
                    const lockFile = path.join(sessionsDir, folder, '.session.lock');
                    try {
                        if (fs.existsSync(lockFile)) {
                            fs.unlinkSync(lockFile);
                            log('info', `Removed session lock: ${folder}`);
                        }
                    } catch (_) { /* ignore */ }
                }
            }
        }
    } catch (_) { /* ignore */ }
    
    if (server) {
        server.close(() => {
            log('info', 'Express server closed, exiting process');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ─── Memory watchdog ───
setInterval(() => {
    const usedMB = process.memoryUsage().rss / 1024 / 1024;
    if (usedMB > 450) {
        log('warn', `RAM too high (${usedMB.toFixed(0)}MB > 450MB). Restarting...`);
        process.exit(1);
    }
}, 30_000);

// ─── Session health watchdog ───
setInterval(() => {
    const status = sessionManager.getStatus();
    const connectedCount = Object.values(status).filter(s => s.connected).length;
    const totalCount = Object.keys(status).length;
    
    if (connectedCount === 0 && totalCount > 0) {
        log('error', `⚠️ No sessions connected (0/${totalCount}). Health check failed!`);
    } else if (connectedCount < totalCount) {
        log('warn', `Session health: ${connectedCount}/${totalCount} connected`);
    } else {
        log('success', `Session health: ${connectedCount}/${totalCount} connected ✓`);
    }
}, 60_000);

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

    // ─── SPY MODE: Iniciar flush periódico al disco ───
    startFlushCycle();

    // Start all sessions
    await sessionManager.startAll();

    // Enable error reporting now that sessions are running
    errorHandlerReady = true;

    log('success', 'JUANCHOTE-SWARM is running!');
}

main().catch((err) => {
    log('error', `Fatal: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
});
