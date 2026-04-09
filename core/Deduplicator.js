/**
 * ─── DEDUPLICATOR ───
 * Ensures only ONE session processes each incoming message.
 * Uses a Map with TTL-based automatic cleanup.
 * 
 * Flow:
 *   1. Session receives message → calls claim(messageId, sessionIndex)
 *   2. If messageId is new → returns true (this session handles it)
 *   3. If messageId already claimed → returns false (another session got it)
 *   4. Entries expire after TTL seconds automatically
 */

import { log } from './Logger.js';
import config from '../config.js';

class Deduplicator {
    constructor() {
        /** @type {Map<string, { sessionIndex: number, timestamp: number }>} */
        this.seen = new Map();
        this.ttl = (config.deduplicatorTTL || 60) * 1000; // ms

        // Cleanup expired entries every 30 seconds
        this._cleanupInterval = setInterval(() => this._cleanup(), 30_000);
    }

    /**
     * Try to claim a message for a session.
     * @param {string} messageId - The unique message key ID
     * @param {number} sessionIndex - 1-based session number
     * @returns {boolean} true if this session should process the message
     */
    claim(messageId, sessionIndex) {
        if (!messageId) return false;

        const existing = this.seen.get(messageId);
        if (existing) {
            // Already claimed by another (or same) session
            return false;
        }

        // ─── LOAD BALANCING / WORK DISTRIBUTION ───
        // Use a simple hash of the message ID to 'assign' it to a session.
        // This ensures that when N sessions receive the same message simultaneously,
        // they naturally spread the work instead of Session 1 winning every race.
        
        const totalSessions = config.sessionCount || 1;
        if (totalSessions > 1) {
            // Primitive but effective hash from the message ID string
            let hash = 0;
            for (let i = 0; i < messageId.length; i++) {
                hash = ((hash << 5) - hash) + messageId.charCodeAt(i);
                hash |= 0; // Convert to 32bit integer
            }
            const assignedSession = (Math.abs(hash) % totalSessions) + 1;

            if (assignedSession !== sessionIndex) {
                // If it's not my 'assigned' turn, I skip the claim.
                // This forces the other sessions to take their respective shares of the load.
                return false;
            }
        }

        // Claim it
        this.seen.set(messageId, {
            sessionIndex,
            timestamp: Date.now(),
        });

        return true;
    }

    /**
     * Check if a message was already claimed.
     * @param {string} messageId
     * @returns {boolean}
     */
    isClaimed(messageId) {
        return this.seen.has(messageId);
    }

    /**
     * Get which session claimed a message.
     * @param {string} messageId
     * @returns {number|null}
     */
    getClaimant(messageId) {
        const entry = this.seen.get(messageId);
        return entry ? entry.sessionIndex : null;
    }

    /**
     * Remove expired entries.
     */
    _cleanup() {
        const now = Date.now();
        let removed = 0;
        for (const [key, value] of this.seen) {
            if (now - value.timestamp > this.ttl) {
                this.seen.delete(key);
                removed++;
            }
        }
        if (removed > 0) {
            log('debug', `Deduplicator cleanup: removed ${removed} expired entries (${this.seen.size} active)`);
        }
    }

    /**
     * Get stats.
     */
    stats() {
        return {
            active: this.seen.size,
            ttlSeconds: this.ttl / 1000,
        };
    }

    destroy() {
        clearInterval(this._cleanupInterval);
        this.seen.clear();
    }
}

// Singleton — all sessions share the same deduplicator
export default new Deduplicator();
