import { reply } from '../core/Formatter.js';

/**
 * .uppercase / lowercase - Convert text case
 * Convierte texto a mayúsculas o minúsculas
 */

export default {
    command: 'uppercase',
    aliases: ['mayuscula', 'upper', 'caps'],
    category: 'tools',
    description: 'Convierte a MAYÚSCULAS',
    usage: '.uppercase <texto>',
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
                text: reply('Proporciona texto.\nUso: .uppercase <texto>')
            }, { quoted: message });
        }
        
        const converted = text.toUpperCase();
        
        await sock.sendMessage(chatId, {
            text: reply(converted)
        }, { quoted: message });
    }
};
