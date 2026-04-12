import { reply } from '../core/Formatter.js';

/**
 * .rate - Rate someone or something
 * Califica a una persona o cosa del 1-10
 */

export default {
    command: 'rate',
    aliases: ['calificar', 'rating', '⭐'],
    category: 'fun',
    description: 'Califica a un usuario o cosa del 1-10',
    usage: '.rate [@usuario] o .rate <cosa>',
    cooldown: 3000,

    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        
        let subject = 'eso';
        let rating = Math.floor(Math.random() * 10) + 1;
        
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentions && mentions.length > 0) {
            subject = `@${mentions[0].split('@')[0]}`;
        } else if (args.length > 0) {
            subject = args.join(' ');
        }
        
        const stars = '⭐'.repeat(rating);
        
        const msg = `📊 *CALIFICACIÓN*\n\n${subject}\n\n${stars} ${rating}/10`;
        
        await sock.sendMessage(chatId, {
            text: reply(msg),
            mentions: mentions || []
        }, { quoted: message });
    }
};
