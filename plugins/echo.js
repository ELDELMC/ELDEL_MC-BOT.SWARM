import { reply } from '../core/Formatter.js';

/**
 * .echo - Echo text
 * Repite el texto que proporcionas
 */

export default {
    command: 'echo',
    aliases: ['repeat', 'rep'],
    category: 'tools',
    description: 'Repite el texto',
    usage: '.echo <texto>',
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
                text: reply('Proporciona texto para repetir.\nUso: .echo <texto>')
            }, { quoted: message });
        }
        
        await sock.sendMessage(chatId, {
            text: reply(text)
        }, { quoted: message });
    }
};
