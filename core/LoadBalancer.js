/**
 * ─── LOAD BALANCER ───
 * Distributes command execution across sessions fairly.
 * 
 * Strategy:
 *   1. For admin commands → picks a session that IS admin in the group
 *   2. For regular commands → round-robin, picking the least-loaded session
 *   3. Tracks task count per session for equitable distribution
 */

import { log } from './Logger.js';
import adminChecker from './AdminChecker.js';

class LoadBalancer {
    constructor() {
        /** @type {Map<number, number>} sessionIndex → task count */
        this.taskCounts = new Map();
        /** @type {number} Simple round-robin counter */
        this.roundRobinIndex = 0;
        /** @type {Map<number, object>} sessionIndex → Baileys socket */
        this.sessions = new Map();
    }

    /**
     * Register a session with the load balancer.
     * @param {number} sessionIndex - 1-based
     * @param {object} sock - Baileys socket
     */
    register(sessionIndex, sock) {
        this.sessions.set(sessionIndex, sock);
        this.taskCounts.set(sessionIndex, 0);
        log('balancer', `Registered session S${sessionIndex}`, sessionIndex);
    }

    /**
     * Unregister a session (e.g., on disconnect).
     */
    unregister(sessionIndex) {
        this.sessions.delete(sessionIndex);
        this.taskCounts.delete(sessionIndex);
    }

    /**
     * Get all active session indices.
     * @returns {number[]}
     */
    getActiveSessions() {
        return [...this.sessions.keys()];
    }

    /**
     * Get a session's socket.
     * @param {number} sessionIndex
     * @returns {object|null}
     */
    getSocket(sessionIndex) {
        return this.sessions.get(sessionIndex) || null;
    }

    /**
     * Pick the best session for a command.
     * @param {string|null} groupId - Group JID (null for private chats)
     * @param {boolean} requiresAdmin - Whether the command requires bot admin
     * @returns {Promise<{sessionIndex: number, sock: object}|null>}
     */
    async pick(groupId, requiresAdmin = false) {
        const active = this.getActiveSessions();
        if (active.length === 0) return null;

        // If only one session, use it
        if (active.length === 1) {
            const idx = active[0];
            return { sessionIndex: idx, sock: this.sessions.get(idx) };
        }

        // For admin commands, filter to sessions that are admin
        if (requiresAdmin && groupId) {
            const adminSessions = [];
            for (const idx of active) {
                const sock = this.sessions.get(idx);
                const isAdmin = await adminChecker.isBotAdminIn(sock, groupId);
                if (isAdmin) {
                    adminSessions.push(idx);
                }
            }

            if (adminSessions.length === 0) {
                // No session is admin — fall back to least-loaded
                log('warn', `No session is admin in group. Falling back to least-loaded.`);
            } else if (adminSessions.length === 1) {
                const idx = adminSessions[0];
                this._incrementTask(idx);
                return { sessionIndex: idx, sock: this.sessions.get(idx) };
            } else {
                // Multiple admin sessions — pick least-loaded among them
                const idx = this._leastLoaded(adminSessions);
                this._incrementTask(idx);
                return { sessionIndex: idx, sock: this.sessions.get(idx) };
            }
        }

        // Round-robin among all active sessions (prefer least-loaded)
        const idx = this._leastLoaded(active);
        this._incrementTask(idx);
        return { sessionIndex: idx, sock: this.sessions.get(idx) };
    }

    /**
     * Find the least-loaded session from a list.
     * @param {number[]} candidates
     * @returns {number} sessionIndex
     */
    _leastLoaded(candidates) {
        let minIdx = candidates[0];
        let minCount = this.taskCounts.get(minIdx) || 0;

        for (const idx of candidates) {
            const count = this.taskCounts.get(idx) || 0;
            if (count < minCount) {
                minCount = count;
                minIdx = idx;
            }
        }

        return minIdx;
    }

    /**
     * Increment task count for a session.
     */
    _incrementTask(sessionIndex) {
        const current = this.taskCounts.get(sessionIndex) || 0;
        this.taskCounts.set(sessionIndex, current + 1);
    }

    /**
     * Mark a task as completed (decrement).
     */
    completeTask(sessionIndex) {
        const current = this.taskCounts.get(sessionIndex) || 0;
        this.taskCounts.set(sessionIndex, Math.max(0, current - 1));
    }

    /**
     * Get load stats for all sessions.
     */
    getStats() {
        const stats = {};
        for (const [idx, count] of this.taskCounts) {
            stats[`S${idx}`] = {
                tasks: count,
                connected: this.sessions.has(idx),
            };
        }
        return stats;
    }

    /**
     * Reset task counters (e.g., periodically).
     */
    resetCounters() {
        for (const idx of this.taskCounts.keys()) {
            this.taskCounts.set(idx, 0);
        }
    }
}

// Singleton
export default new LoadBalancer();
