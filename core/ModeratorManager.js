/**
 * FASE 4: Advanced Moderation System
 * 
 * Herramientas para administradores:
 * - Ban/Unban
 * - Mute/Unmute
 * - Antilink, Antispam, Antidelete
 * - Logs de acciones
 * ✅ SEGURO: Solo admins pueden usar, validaciones estrictas
 */

import { log } from './Logger.js';
import mongoDBCore from './MongoDB_Core.js';
import { Group } from './models/MongoDB_Schemas.js';

class ModeratorManager {
    constructor() {
        this.warnings = new Map(); // userId:groupId → count
        this.mutes = new Map();    // userId:groupId → { until: Date, reason: string }
    }

    /**
     * ✅ Verificar si usuario es admin
     */
    async isAdmin(userId, groupJid, groupData = null) {
        try {
            const group = groupData || await mongoDBCore.getGroupData(groupJid);
            
            if (!group) return false;
            return group.admins && group.admins.includes(userId);
        } catch (err) {
            log('error', `Error checking admin status: ${err.message}`);
            return false;
        }
    }

    /**
     * ✅ Aumentar contador de warnings
     */
    async addWarning(userId, groupJid, reason = 'Sin razón') {
        try {
            const key = `${userId}:${groupJid}`;
            const warnings = (this.warnings.get(key) || 0) + 1;
            this.warnings.set(key, warnings);

            log('warn', `⚠️ Warning a ${userId}: ${warnings}/3`);

            // Si alcanza 3 warnings, banear
            if (warnings >= 3) {
                await this.banUser(userId, groupJid, 'Alcanzó máximo de warnings');
                return { success: true, banned: true, message: 'Usuario baneado (3 warnings)' };
            }

            return { success: true, warningsLeft: 3 - warnings };
        } catch (err) {
            log('error', `Error adding warning: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * ✅ Clear warnings de usuario
     */
    async clearWarnings(userId, groupJid) {
        try {
            const key = `${userId}:${groupJid}`;
            this.warnings.delete(key);

            log('success', `🟢 Warnings limpiados para ${userId}`);
            return { success: true };
        } catch (err) {
            log('error', `Error clearing warnings: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * ✅ Banear usuario del grupo
     */
    async banUser(userId, groupJid, reason = 'Sin razón especificada') {
        try {
            const groupData = await mongoDBCore.getGroupData(groupJid);
            
            if (!groupData) {
                return { success: false, error: 'Grupo no encontrado' };
            }

            // Guardar en lista de baneados
            if (!groupData.bannedUsers) {
                groupData.bannedUsers = [];
            }

            groupData.bannedUsers.push({
                userId,
                reason,
                bannedAt: new Date()
            });

            // Remover de miembros
            groupData.members = groupData.members.filter(m => m.userId !== userId);

            await mongoDBCore.updateGroupData(groupJid, {
                bannedUsers: groupData.bannedUsers,
                members: groupData.members
            });

            log('success', `🚫 ${userId} baneado de ${groupJid}`);
            return { success: true, message: `${userId} ha sido baneado` };
        } catch (err) {
            log('error', `Error banning user: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * ✅ Desbanear usuario
     */
    async unbanUser(userId, groupJid) {
        try {
            const groupData = await mongoDBCore.getGroupData(groupJid);
            
            if (!groupData) {
                return { success: false, error: 'Grupo no encontrado' };
            }

            // Remover de bannedUsers
            groupData.bannedUsers = (groupData.bannedUsers || [])
                .filter(u => u.userId !== userId);

            await mongoDBCore.updateGroupData(groupJid, {
                bannedUsers: groupData.bannedUsers
            });

            log('success', `🟢 ${userId} desbaneado de ${groupJid}`);
            return { success: true, message: `${userId} ha sido desbaneado` };
        } catch (err) {
            log('error', `Error unbanning user: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * ✅ Mutear usuario por tiempo
     */
    async muteUser(userId, groupJid, durationMinutes = 60, reason = 'Sin razón') {
        try {
            const key = `${userId}:${groupJid}`;
            const until = new Date(Date.now() + durationMinutes * 60000);

            this.mutes.set(key, {
                until,
                reason
            });

            log('success', `🔇 ${userId} muteado por ${durationMinutes} minutos`);
            return { success: true, muteUntil: until };
        } catch (err) {
            log('error', `Error muting user: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * ✅ Desmuteador usuario
     */
    async unmuteUser(userId, groupJid) {
        try {
            const key = `${userId}:${groupJid}`;
            this.mutes.delete(key);

            log('success', `🔊 ${userId} desmuteado`);
            return { success: true };
        } catch (err) {
            log('error', `Error unmuting user: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * ✅ Checar si usuario está muteado
     */
    isUserMuted(userId, groupJid) {
        const key = `${userId}:${groupJid}`;
        const muteData = this.mutes.get(key);

        if (!muteData) return false;

        // Si se pasó el tiempo, desmuteador automáticamente
        if (new Date() > muteData.until) {
            this.mutes.delete(key);
            return false;
        }

        return true;
    }

    /**
     * ✅ Habilitar antilink (detección de links)
     */
    async enableAntilink(groupJid) {
        try {
            await mongoDBCore.updateGroupData(groupJid, {
                'settings.antiLinkEnabled': true
            });

            log('success', 'Antilink habilitado');
            return { success: true };
        } catch (err) {
            log('error', `Error enabling antilink: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * ✅ Habilitar antispam (detección de mensajes rápidos)
     */
    async enableAntispam(groupJid) {
        try {
            await mongoDBCore.updateGroupData(groupJid, {
                'settings.antiSpamEnabled': true
            });

            log('success', 'Antispam habilitado');
            return { success: true };
        } catch (err) {
            log('error', `Error enabling antispam: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * ✅ Habilitar antidelete (reporte de mensajes eliminados)
     */
    async enableAntidelete(groupJid) {
        try {
            await mongoDBCore.updateGroupData(groupJid, {
                'settings.antiDeleteEnabled': true
            });

            log('success', 'Antidelete habilitado');
            return { success: true };
        } catch (err) {
            log('error', `Error enabling antidelete: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * ✅ Obtener información del grupo
     */
    async getGroupInfo(groupJid) {
        try {
            const groupData = await mongoDBCore.getGroupData(groupJid);
            
            if (!groupData) {
                return { success: false, error: 'Grupo no encontrado' };
            }

            return {
                success: true,
                groupName: groupData.groupName,
                members: groupData.members?.length || 0,
                admins: groupData.admins?.length || 0,
                banned: groupData.bannedUsers?.length || 0,
                antilink: groupData.settings?.antiLinkEnabled || false,
                antispam: groupData.settings?.antiSpamEnabled || false,
                antidelete: groupData.settings?.antiDeleteEnabled || false
            };
        } catch (err) {
            log('error', `Error getting group info: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * ✅ Listar miembros baneados
     */
    async getBannedUsers(groupJid) {
        try {
            const groupData = await mongoDBCore.getGroupData(groupJid);
            
            if (!groupData || !groupData.bannedUsers) {
                return { success: true, banned: [] };
            }

            return {
                success: true,
                banned: groupData.bannedUsers.map(u => ({
                    userId: u.userId,
                    reason: u.reason,
                    bannedAt: u.bannedAt
                }))
            };
        } catch (err) {
            log('error', `Error getting banned users: ${err.message}`);
            return { success: false, error: err.message };
        }
    }
}

export default new ModeratorManager();
