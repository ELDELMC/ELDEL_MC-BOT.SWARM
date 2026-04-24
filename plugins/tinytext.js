import { reply } from '../core/Formatter.js';

/**
 * .tinytext - Make text tiny using Unicode
 * Convierte texto a caracteres Unicode pequeños
 */

export default {
    command: 'tinytext',
    aliases: ['tiny', 'pequeño', 'small'],
    category: 'tools',
    description: 'Convierte texto a caracteres Unicode pequeños',
    usage: '.tinytext <texto>',
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
                text: reply('Proporciona texto.\nUso: .tinytext <texto>')
            }, { quoted: message });
        }
        
        const tinyMap = {
            'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
            'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
            'q': 'ᴏ', 'r': 'ʀ', 's': 'ꜱ', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'ᴢ', 'y': 'ʏ', 'z': 'ᴢ'
        };
        
        const tiny = text.toLowerCase().split('').map(char => tinyMap[char] || char).join('');
        
        await sock.sendMessage(chatId, {
            text: reply(tiny)
        }, { quoted: message });
    }
};
