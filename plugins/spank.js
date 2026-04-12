import { reply } from '../core/Formatter.js';

/**
 * .spanktext / spanks - Generate "spank" text
 * Genera un texto que simula una secuencia de "cachetadas"
 */

export default {
    command: 'spank',
    aliases: ['spanks', 'cachetada', 'golpe'],
    category: 'fun',
    description: 'Genera un texto jocoso de cachetada',
    usage: '.spank [@usuario]',
    cooldown: 3000,

    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        
        let target = 'alguien';
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentions && mentions.length > 0) {
            target = `@${mentions[0].split('@')[0]}`;
        }
        
        const emojis = ['👋', '✋', '🖐️'];
        const spanking = emojis.join(' ');
        
        await sock.sendMessage(chatId, {
            text: reply(`${spanking}\n\n¡${target} ha sido cachetado!`),
            mentions: mentions || []
        }, { quoted: message });
    }
};
