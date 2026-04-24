import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { log } from '../core/Logger.js';

let adjusting = false;

/**
 * Watch `.env` for changes and update process.env accordingly.
 * When SESSION_COUNT changes, call SessionManager.adjustSessionCount(newCount).
 */
export function initEnvWatcher(sessionManager) {
    try {
        const envPath = path.join(process.cwd(), '.env');

        if (!fs.existsSync(envPath)) {
            log('info', '.env not found — env watcher idle');
            return;
        }

        // Load initial values (already loaded by dotenv/config) but parse fresh to know baseline
        let lastParsed = dotenv.parse(fs.readFileSync(envPath));

        fs.watch(envPath, { persistent: true }, async (eventType) => {
            if (eventType !== 'change') return;
            if (adjusting) return;
            adjusting = true;

            try {
                const raw = fs.readFileSync(envPath, 'utf-8');
                const parsed = dotenv.parse(raw);

                // Update process.env with new values
                for (const [k, v] of Object.entries(parsed)) {
                    if (process.env[k] !== v) {
                        process.env[k] = v;
                        log('info', `Env updated: ${k}`);
                    }
                }

                // If SESSION_COUNT changed, instruct session manager to adjust
                const oldCount = Number(lastParsed.SESSION_COUNT) || Number(process.env.SESSION_COUNT) || 2;
                const newCount = Number(parsed.SESSION_COUNT) || 2;

                if (newCount !== oldCount) {
                    log('info', `Detected SESSION_COUNT change: ${oldCount} -> ${newCount}`);
                    if (sessionManager && typeof sessionManager.adjustSessionCount === 'function') {
                        try {
                            await sessionManager.adjustSessionCount(newCount);
                        } catch (err) {
                            log('error', `Failed to adjust sessions: ${err.message}`);
                        }
                    }
                }

                lastParsed = parsed;
            } catch (err) {
                log('error', `Env watcher error: ${err.message}`);
            } finally {
                adjusting = false;
            }
        });

        log('info', 'Started .env watcher for dynamic session adjustments');
    } catch (err) {
        log('warn', `Failed to start env watcher: ${err.message}`);
    }
}

export default { initEnvWatcher };
