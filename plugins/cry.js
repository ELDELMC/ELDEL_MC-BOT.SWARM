import { reply } from '../core/Formatter.js';

/**
 * .cry - Cry animation
 * Simula llorar
 */

export default {
    command: 'cry',
    aliases: ['llorar', 'tears', 'sad'],
    category: 'fun',
    description: 'Simula llorar',
    usage: '.cry',
    cooldown: 2000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        
        const msg = `😭 *LLORANDO...*\n\n💧 💧 💧\n😭 💧 💧 💧\n💧 💧 💧 💧\n\n*¿Quién me consolará?*`;
        
        await sock.sendMessage(chatId, {
            text: reply(msg)
        }, { quoted: message });
    }
};
