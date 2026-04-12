import { reply } from '../core/Formatter.js';

/**
 * .count - Count characters
 * Cuenta caracteres, palabras y líneas en un texto
 */

export default {
    command: 'count',
    aliases: ['contar', 'stat', 'stats'],
    category: 'tools',
    description: 'Cuenta caracteres, palabras y líneas',
    usage: '.count <texto>',
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
                text: reply('Proporciona texto.\nUso: .count <texto>')
            }, { quoted: message });
        }
        
        const characters = text.length;
        const words = text.trim().split(/\s+/).length;
        const lines = text.split('\n').length;
        const spaces = (text.match(/\s/g) || []).length;
        
        const stats = `📊 *ESTADÍSTICAS DEL TEXTO*\n\n` +
            `📝 Caracteres: ${characters}\n` +
            `💬 Palabras: ${words}\n` +
            `📋 Líneas: ${lines}\n` +
            `⬜ Espacios: ${spaces}`;
        
        await sock.sendMessage(chatId, {
            text: reply(stats)
        }, { quoted: message });
    }
};
