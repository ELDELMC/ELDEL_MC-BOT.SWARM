import { reply } from '../core/Formatter.js';

/**
 * .reverse - Reverse text
 * Invierte el texto proporcionado
 */

export default {
    command: 'reverse',
    aliases: ['rev', 'invertir'],
    category: 'tools',
    description: 'Invierte el texto',
    usage: '.reverse <texto>',
    cooldown: 2000,

    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        
        let text = args.join(' ').trim();
        
        // Support for quoted messages
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted && !text) {
            text = quoted.conversation || quoted.extendedTextMessage?.text || '';
        }
        
        if (!text) {
            return await sock.sendMessage(chatId, {
                text: reply('Proporciona texto para invertir.\nUso: .reverse <texto>')
            }, { quoted: message });
        }
        
        const reversed = text.split('').reverse().join('');
        
        await sock.sendMessage(chatId, {
            text: reply(`${reversed}`)
        }, { quoted: message });
    }
};
