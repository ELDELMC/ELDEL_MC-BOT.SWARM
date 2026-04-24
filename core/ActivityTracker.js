/**
 * ─── ACTIVITY TRACKER ───
 * Tracks message counts per user in groups.
 * Provides a mini-database for group activity rankings.
 */

import sharedData from './SharedData.js';
import { log } from './Logger.js';

const DATABASE_FILE = 'activity.json';

class ActivityTracker {
    /**
     * Increment message count for a user in a group.
     * @param {string} chatId - Group JID
     * @param {string} senderId - User JID
     * @param {string} senderName - User display name
     */
    async recordMessage(chatId, senderId, senderName) {
        if (!chatId || !senderId) return;

        // Only track activity in groups
        if (!chatId.endsWith('@g.us')) return;

        // Skip status broadcast
        if (chatId === 'status@broadcast') return;

        try {
            await sharedData.update(DATABASE_FILE, {}, (data) => {
                if (!data[chatId]) data[chatId] = {};
                
                if (!data[chatId][senderId]) {
                    data[chatId][senderId] = {
                        count: 0,
                        name: senderName || senderId.split('@')[0]
                    };
                }

                data[chatId][senderId].count += 1;
                
                // Update name if present and not generic
                if (senderName && senderName !== senderId.split('@')[0]) {
                    data[chatId][senderId].name = senderName;
                }

                return data;
            });
        } catch (err) {
            log('error', `ActivityTracker failed to record message: ${err.message}`);
        }
    }

    /**
     * Get top users in a group.
     * @param {string} chatId 
     * @param {number} limit 
     * @returns {Array} List of {id, count, name}
     */
    getTop(chatId, limit = 10) {
        const data = sharedData.read(DATABASE_FILE, {});
        const groupData = data[chatId] || {};

        return Object.entries(groupData)
            .map(([id, stats]) => ({
                id,
                count: stats.count || 0,
                name: stats.name || id.split('@')[0]
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
}

export default new ActivityTracker();
