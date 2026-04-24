import { reply } from '../core/Formatter.js';

/**
 * .flip / fliptext - Flip text upside down
 * Voltea texto al revés usando caracteres Unicode
 */

export default {
    command: 'fliptext',
    aliases: ['flipear', 'voltear'],
    category: 'tools',
    description: 'Voltea texto de cabeza',
    usage: '.fliptext <texto>',
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
                text: reply('Proporciona texto.\nUso: .fliptext <texto>')
            }, { quoted: message });
        }
        
        const flipMap = {
            'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ',
            'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ',
            'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
            'A': '∀', 'B': 'ᗺ', 'C': 'Ɔ', 'D': 'p', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': 'פ', 'H': 'H', 'I': 'I', 'J': 'ſ',
            'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Ό', 'R': 'ᴚ', 'S': 'S', 'T': '⊥',
            'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
            '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
            '.': '˙', ',': '\'', '\'': ',', '"': '„', '!': '¡', '?': '¿', '(': ')', ')': '(', '[': ']', ']': '['
        };
        
        const flipped = text.split('').map(char => flipMap[char] || char).reverse().join('');
        
        await sock.sendMessage(chatId, {
            text: reply(`${flipped}`)
        }, { quoted: message });
    }
};
