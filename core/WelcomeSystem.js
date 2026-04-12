/**
 * FASE 3: Welcome & Goodbye System
 * 
 * Bienvenida automática a nuevos miembros
 * Despedida automática a miembros que se van
 * ✅ SEGURO: Solo mensajes normales, sin spam
 */

import { log } from './Logger.js';
import mongoDBCore from './MongoDB_Core.js';
import { Group } from './models/MongoDB_Schemas.js';

class WelcomeSystem {
    constructor() {
        this.defaultWelcomeMsg = (member, group) => 
            `¡Bienvenido @${member} a ${group}! 👋\n\n` +
            `No olvides leer las reglas del grupo y ¡diviértete! 😊`;
        
        this.defaultGoodbyeMsg = (member, group) => 
            `@${member} se ha ido del grupo. ¡Que vuelva pronto! 👋`;
    }

    /**
     * ✅ Procesar cuando alguien entra al grupo
     */
    async handleGroupMemberAdd(members, groupJid, botSocket) {
        try {
            const groupData = await mongoDBCore.getGroupData(groupJid);
            
            if (!groupData || !groupData.settings || !groupData.settings.welcomeEnabled) {
                return; // Welcome deshabilitado
            }

            for (const member of members) {
                try {
                    // Crear mensaje personalizado
                    const customMsg = groupData.customWelcomeMsg || 
                        this.defaultWelcomeMsg(member.split('@')[0], groupData.groupName);

                    // Enviar mensaje con pequeño delay (anti-spam)
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    await botSocket.sendMessage(groupJid, {
                        text: customMsg
                    });

                    // Guardar en MongoDB
                    await mongoDBCore.updateGroupData(groupJid, {
                        $inc: { 'stats.totalInteractions': 1 }
                    });

                    log('info', `👋 Welcome enviado a ${member} en ${groupData.groupName}`);

                } catch (err) {
                    log('error', `Error sending welcome to ${member}: ${err.message}`);
                }
            }
        } catch (err) {
            log('error', `Welcome system error: ${err.message}`);
        }
    }

    /**
     * ✅ Procesar cuando alguien sale del grupo
     */
    async handleGroupMemberRemove(members, groupJid, botSocket) {
        try {
            const groupData = await mongoDBCore.getGroupData(groupJid);
            
            if (!groupData || !groupData.settings) {
                return;
            }

            // Solo enviar goodbye si está habilitado
            if (groupData.settings.goodbyeEnabled !== true) {
                return;
            }

            for (const member of members) {
                try {
                    const customMsg = groupData.customGoodbyeMsg ||
                        this.defaultGoodbyeMsg(member.split('@')[0], groupData.groupName);

                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    await botSocket.sendMessage(groupJid, {
                        text: customMsg
                    });

                    log('info', `👋 Goodbye enviado a ${member} en ${groupData.groupName}`);

                } catch (err) {
                    log('error', `Error sending goodbye to ${member}: ${err.message}`);
                }
            }
        } catch (err) {
            log('error', `Goodbye system error: ${err.message}`);
        }
    }

    /**
     * ✅ Establecer mensaje de bienvenida personalizado
     */
    async setWelcomeMessage(groupJid, message) {
        try {
            await mongoDBCore.updateGroupData(groupJid, {
                customWelcomeMsg: message,
                'settings.welcomeEnabled': true
            });

            log('success', `Welcome message actualizado para ${groupJid}`);
            return { success: true };
        } catch (err) {
            log('error', `Error setting welcome message: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * ✅ Establecer mensaje de despedida personalizado
     */
    async setGoodbyeMessage(groupJid, message) {
        try {
            await mongoDBCore.updateGroupData(groupJid, {
                customGoodbyeMsg: message,
                'settings.goodbyeEnabled': true
            });

            log('success', `Goodbye message actualizado para ${groupJid}`);
            return { success: true };
        } catch (err) {
            log('error', `Error setting goodbye message: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * ✅ Habilitar/deshabilitar welcome
     */
    async toggleWelcome(groupJid, enabled) {
        try {
            await mongoDBCore.updateGroupData(groupJid, {
                'settings.welcomeEnabled': enabled
            });

            log('success', `Welcome ${enabled ? 'enabled' : 'disabled'} para ${groupJid}`);
            return { success: true };
        } catch (err) {
            log('error', `Error toggling welcome: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * ✅ Habilitar/deshabilitar goodbye
     */
    async toggleGoodbye(groupJid, enabled) {
        try {
            await mongoDBCore.updateGroupData(groupJid, {
                'settings.goodbyeEnabled': enabled
            });

            log('success', `Goodbye ${enabled ? 'enabled' : 'disabled'} para ${groupJid}`);
            return { success: true };
        } catch (err) {
            log('error', `Error toggling goodbye: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * ✅ Ver configuración actual
     */
    async getWelcomeSettings(groupJid) {
        try {
            const groupData = await mongoDBCore.getGroupData(groupJid);
            
            if (!groupData) {
                return { success: false, error: 'Grupo no encontrado' };
            }

            return {
                success: true,
                welcomeEnabled: groupData.settings?.welcomeEnabled || false,
                goodbyeEnabled: groupData.settings?.goodbyeEnabled || false,
                customWelcomeMsg: groupData.customWelcomeMsg || 'Default',
                customGoodbyeMsg: groupData.customGoodbyeMsg || 'Default'
            };
        } catch (err) {
            log('error', `Error getting welcome settings: ${err.message}`);
            return { success: false, error: err.message };
        }
    }
}

export default new WelcomeSystem();
