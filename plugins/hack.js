import { reply } from '../core/Formatter.js';

/**
 * .hack - Fake "hacking" animation
 * Simula una interfaz de "hackeo" (solo visual, jocoso)
 */

export default {
    command: 'hack',
    aliases: ['hackear', 'hacker', 'crack'],
    category: 'fun',
    description: 'Simula una interfaz de hackeo jocosa',
    usage: '.hack [@usuario]',
    cooldown: 5000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        
        let target = 'el sistema';
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentions && mentions.length > 0) {
            target =  `@${mentions[0].split('@')[0]}`;
        }
        
        const lines = [
            '```',
            '▓▒░ Accediendo a datos...',
            '▓▒░ Burlando firewall...',
            '▓▒░ Descargando información...',
            '▓▒░ Interceptando conexión...',
            '```',
            `✅ ¡${target} ha sido "hackeado"!`
        ];
        
        await sock.sendMessage(chatId, {
            text: reply(lines.join('\n')),
            mentions: mentions || []
        }, { quoted: message });
    }
};
