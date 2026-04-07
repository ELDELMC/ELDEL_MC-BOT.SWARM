/**
 * ─── SHARED DATA ───
 * Thread-safe(ish) JSON file read/write for concurrent sessions.
 * Uses an in-process write queue per file to serialize writes,
 * plus memory cache with TTL invalidation.
 *
 * Since all sessions run in the SAME Node.js process,
 * we don't need filesystem locks — just in-memory serialization.
 */

import fs from 'fs';
import path from 'path';
import { log } from './Logger.js';
import config from '../config.js';

const DATA_DIR = path.join(process.cwd(), 'data');

class SharedData {
    constructor() {
        /** @type {Map<string, any>} In-memory cache */
        this.cache = new Map();
        /** @type {Map<string, number>} Last read timestamp per file */
        this.cacheTimestamps = new Map();
        /** @type {Map<string, Promise<void>>} Write queue per file */
        this.writeQueues = new Map();

        this.cacheTTL = config.sharedDataCacheMs || 5000;

        // Ensure data directory exists
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
    }

    /**
     * Get the absolute path for a data file.
     * @param {string} filename - e.g. 'banned.json'
     */
    _filePath(filename) {
        return path.join(DATA_DIR, filename);
    }

    /**
     * Read a JSON file. Uses cache if fresh enough.
     * @param {string} filename
     * @param {any} defaultValue - Returned if file doesn't exist
     * @returns {any}
     */
    read(filename, defaultValue = null) {
        const now = Date.now();
        const lastRead = this.cacheTimestamps.get(filename) || 0;

        // Return cached if fresh
        if (now - lastRead < this.cacheTTL && this.cache.has(filename)) {
            return this.cache.get(filename);
        }

        // Read from disk
        const fp = this._filePath(filename);
        try {
            if (!fs.existsSync(fp)) {
                // Create with default and cache
                this.write(filename, defaultValue);
                return defaultValue;
            }
            const raw = fs.readFileSync(fp, 'utf-8');
            const data = JSON.parse(raw);
            this.cache.set(filename, data);
            this.cacheTimestamps.set(filename, now);
            return data;
        } catch (err) {
            log('error', `SharedData read error [${filename}]: ${err.message}`);
            return defaultValue;
        }
    }

    /**
     * Write a JSON file. Serialized per-file to prevent corruption.
     * @param {string} filename
     * @param {any} data
     * @returns {Promise<void>}
     */
    async write(filename, data) {
        // Chain writes per file to serialize them
        const prevQueue = this.writeQueues.get(filename) || Promise.resolve();
        const writePromise = prevQueue.then(() => this._doWrite(filename, data));
        this.writeQueues.set(filename, writePromise.catch(() => {}));
        return writePromise;
    }

    /**
     * Internal: perform the actual write.
     */
    async _doWrite(filename, data) {
        const fp = this._filePath(filename);
        try {
            const json = JSON.stringify(data, null, 2);
            fs.writeFileSync(fp, json, 'utf-8');
            // Update cache
            this.cache.set(filename, data);
            this.cacheTimestamps.set(filename, Date.now());
        } catch (err) {
            log('error', `SharedData write error [${filename}]: ${err.message}`);
            throw err;
        }
    }

    /**
     * Atomic read-modify-write. The updater function receives current data
     * and must return the new data.
     * @param {string} filename
     * @param {any} defaultValue
     * @param {(data: any) => any} updaterFn
     * @returns {Promise<any>} The updated data
     */
    async update(filename, defaultValue, updaterFn) {
        // Force fresh read (invalidate cache)
        this.cacheTimestamps.delete(filename);
        const current = this.read(filename, defaultValue);
        const updated = updaterFn(current);
        await this.write(filename, updated);
        return updated;
    }

    /**
     * Invalidate cache for a file (forces next read from disk).
     */
    invalidate(filename) {
        this.cache.delete(filename);
        this.cacheTimestamps.delete(filename);
    }

    /**
     * Ensure a data file exists with defaults.
     * @param {string} filename
     * @param {any} defaultValue
     */
    ensure(filename, defaultValue) {
        const fp = this._filePath(filename);
        if (!fs.existsSync(fp)) {
            fs.writeFileSync(fp, JSON.stringify(defaultValue, null, 2));
            log('info', `Created data file: ${filename}`);
        }
    }
}

// Singleton
export default new SharedData();
