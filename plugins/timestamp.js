import { reply } from '../core/Formatter.js';

/**
 * .timestamp - Get current timestamp
 * Muestra la hora y fecha actuales en varios formatos
 */

export default {
    command: 'timestamp',
    aliases: ['hora', 'time', 'date', 'fecha'],
    category: 'general',
    description: 'Muestra la hora y fecha actual',
    usage: '.timestamp',
    cooldown: 2000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        
        const now = new Date();
        const unix = Math.floor(now.getTime() / 1000);
        const iso = now.toISOString();
        const locale = now.toLocaleString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const msg = `⏰ *HORA ACTUAL*\n\n` +
            `📅 ${locale}\n` +
            `🔢 Unix: \`${unix}\`\n` +
            `📋 ISO: \`${iso}\``;
        
        await sock.sendMessage(chatId, {
            text: reply(msg)
        }, { quoted: message });
    }
};
