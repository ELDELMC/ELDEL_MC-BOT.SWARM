import { reply } from '../core/Formatter.js';

/**
 * .kiss - Send a virtual kiss
 * Envía un beso virtual a alguien
 */

export default {
    command: 'kiss',
    aliases: ['beso', 'besito'],
    category: 'fun',
    description: 'Envía un beso virtual',
    usage: '.kiss [@usuario]',
    cooldown: 3000,

    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        
        let target = 'a todos';
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentions && mentions.length > 0) {
            target = `@${mentions[0].split('@')[0]}`;
        }
        
        const msg = `💋 *BESO VIRTUAL*\n\nEnvío un beso a ${target}... 😘`;
        
        await sock.sendMessage(chatId, {
            text: reply(msg),
            mentions: mentions || []
        }, { quoted: message });
    }
};
