import { reply } from '../core/Formatter.js';

/**
 * .slap - Slap someone (joke)
 * Envía una "bofetada" virtual jocosa
 */

export default {
    command: 'slap',
    aliases: ['bofetada', 'golpear'],
    category: 'fun',
    description: 'Envía una bofetada jocosa',
    usage: '.slap [@usuario]',
    cooldown: 3000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        
        let target = 'al aire';
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentions && mentions.length > 0) {
            target = `@${mentions[0].split('@')[0]}`;
        }
        
        const msg = `👏 *BOFETADA*\n\n¡ZAS!\n\nMande una bofetada a ${target}`;
        
        await sock.sendMessage(chatId, {
            text: reply(msg),
            mentions: mentions || []
        }, { quoted: message });
    }
};
