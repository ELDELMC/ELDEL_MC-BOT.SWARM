/**
 * ─── ADMIN CHECKER ───
 * Checks admin status for EACH session individually in a group.
 * Caches group metadata to avoid hammering WhatsApp API.
 * Handles LID vs JID comparisons robustly.
 */

import NodeCache from 'node-cache';
import { log } from './Logger.js';
import config from '../config.js';

class AdminChecker {
    constructor() {
        // Cache group metadata: key = groupId, value = metadata
        this.metadataCache = new NodeCache({
            stdTTL: config.adminCacheTTL || 300,
            checkperiod: 60,
            useClones: false,
        });
    }

    /**
     * Normalize a JID for comparison: extract the numeric part.
     * Handles formats like: 573001234567@s.whatsapp.net, 123:45@lid, etc.
     * @param {string} jid
     * @returns {string}
     */
    _normalize(jid) {
        if (!jid) return '';
        return jid
            .replace('@s.whatsapp.net', '')
            .replace('@lid', '')
            .replace('@g.us', '')
            .split(':')[0];
    }

    /**
     * Check if participantJid matches targetJid (handles LID/JID mismatches).
     */
    _jidMatch(participant, targetJid, targetLid) {
        const pId = participant.id || '';
        const pLid = participant.lid || '';
        const pPhone = participant.phoneNumber || '';

        const pNorm = this._normalize(pId);
        const pLidNorm = this._normalize(pLid);
        const pPhoneNorm = this._normalize(pPhone);

        const targetNorm = this._normalize(targetJid);
        const targetLidNorm = this._normalize(targetLid || '');

        return (
            pNorm === targetNorm ||
            pLidNorm === targetNorm ||
            pPhoneNorm === targetNorm ||
            pNorm === targetLidNorm ||
            pLidNorm === targetLidNorm ||
            (targetLidNorm && pLidNorm && pLidNorm === targetLidNorm)
        );
    }

    /**
     * Get group metadata (cached).
     * @param {object} sock - Baileys socket for this session
     * @param {string} groupId
     */
    async _getMetadata(sock, groupId) {
        const cached = this.metadataCache.get(groupId);
        if (cached) return cached;

        try {
            const metadata = await sock.groupMetadata(groupId);
            this.metadataCache.set(groupId, metadata);
            return metadata;
        } catch (err) {
            log('error', `AdminChecker: failed to get metadata for ${groupId}: ${err.message}`);
            return null;
        }
    }

    /**
     * Check admin status for a specific session and sender in a group.
     * @param {object} sock - The Baileys socket for the session
     * @param {string} groupId
     * @param {string} senderId - The user who sent the command
     * @returns {{ isBotAdmin: boolean, isSenderAdmin: boolean }}
     */
    async check(sock, groupId, senderId) {
        const metadata = await this._getMetadata(sock, groupId);
        if (!metadata) {
            return { isBotAdmin: false, isSenderAdmin: false };
        }

        const participants = metadata.participants || [];
        const botJid = sock.user?.id || '';
        const botLid = sock.user?.lid || '';

        let isBotAdmin = false;
        let isSenderAdmin = false;

        for (const p of participants) {
            const isAdmin = p.admin === 'admin' || p.admin === 'superadmin';
            if (!isAdmin) continue;

            if (this._jidMatch(p, botJid, botLid)) {
                isBotAdmin = true;
            }
            if (this._jidMatch(p, senderId, null)) {
                isSenderAdmin = true;
            }
        }

        return { isBotAdmin, isSenderAdmin };
    }

    /**
     * Check if a specific session's bot is admin in a group.
     * Lighter version — only checks bot.
     */
    async isBotAdminIn(sock, groupId) {
        const { isBotAdmin } = await this.check(sock, groupId, '');
        return isBotAdmin;
    }

    /**
     * Invalidate cached metadata for a group (e.g., on participant update).
     */
    invalidate(groupId) {
        this.metadataCache.del(groupId);
    }

    /**
     * Invalidate all cached metadata.
     */
    invalidateAll() {
        this.metadataCache.flushAll();
    }
}

// Singleton
export default new AdminChecker();
