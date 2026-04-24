import { reply } from '../core/Formatter.js';

/**
 * .hug - Send a virtual hug
 * Envía un abrazo virtual a alguien
 */

export default {
    command: 'hug',
    aliases: ['abrazo', 'abrazar'],
    category: 'fun',
    description: 'Envía un abrazo virtual',
    usage: '.hug [@usuario]',
    cooldown: 3000,

    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        
        let target = 'a todos';
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentions && mentions.length > 0) {
            target = `@${mentions[0].split('@')[0]}`;
        }
        
        const msg = `🤗 *ABRAZO VIRTUAL*\n\nLe doy un abrazo a ${target}...`;
        
        await sock.sendMessage(chatId, {
            text: reply(msg),
            mentions: mentions || []
        }, { quoted: message });
    }
};
