import { reply } from '../core/Formatter.js';

/**
 * .shuffle - Shuffle text or array
 * Reorganiza aleatoriamente las palabras o caracteres
 */

export default {
    command: 'shuffle',
    aliases: ['barajar', 'mix'],
    category: 'tools',
    description: 'Reorganiza aleatoriamente palabras/caracteres',
    usage: '.shuffle <texto>',
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
                text: reply('Proporciona texto.\nUso: .shuffle <texto>')
            }, { quoted: message });
        }
        
        // Shuffle words or characters
        const words = text.split(' ');
        const shuffled = words.sort(() => Math.random() - 0.5).join(' ');
        
        await sock.sendMessage(chatId, {
            text: reply(`🔀 *Barajado:*\n${shuffled}`)
        }, { quoted: message });
    }
};
