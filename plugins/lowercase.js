import { reply } from '../core/Formatter.js';

/**
 * .lowercase - Convert text to lowercase
 * Convierte texto a minúsculas
 */

export default {
    command: 'lowercase',
    aliases: ['minusculas', 'lower'],
    category: 'tools',
    description: 'Convierte a minúsculas',
    usage: '.lowercase <texto>',
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
                text: reply('Proporciona texto.\nUso: .lowercase <texto>')
            }, { quoted: message });
        }
        
        const converted = text.toLowerCase();
        
        await sock.sendMessage(chatId, {
            text: reply(converted)
        }, { quoted: message });
    }
};
