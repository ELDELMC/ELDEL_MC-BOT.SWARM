import { reply } from '../core/Formatter.js';

/**
 * .cipher - ROT13 cipher
 * Cifra/descifra texto usando ROT13
 */

export default {
    command: 'cipher',
    aliases: ['rot13', 'crypt', 'encrypt'],
    category: 'tools',
    description: 'Cifrado ROT13',
    usage: '.cipher <texto>',
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
                text: reply('Proporciona texto para cifrar.\nUso: .cipher <texto>')
            }, { quoted: message });
        }
        
        // ROT13 cipher
        const rot13 = (str) => {
            return str.replace(/[a-zA-Z]/g, (c) => {
                return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
            });
        };
        
        const encrypted = rot13(text);
        
        await sock.sendMessage(chatId, {
            text: reply(`🔐 Cifrado:\n\`\`\`\n${encrypted}\n\`\`\``)
        }, { quoted: message });
    }
};
