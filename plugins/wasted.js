import { reply } from '../core/Formatter.js';

/**
 * .wasted - GTA "WASTED" screen generator
 * Genera estilo GTA "WASTED"
 */

export default {
    command: 'wasted',
    aliases: ['gta', 'muerto', 'dead'],
    category: 'fun',
    description: 'Genera estilo GTA "WASTED"',
    usage: '.wasted [@usuario]',
    cooldown: 3000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        
        let target = 'TÚ';
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentions && mentions.length > 0) {
            target = mentions[0].split('@')[0].toUpperCase();
        }
        
        const msg = `
╔══════════════════════════════════╗
║                                  ║
║          🔴 W A S T E D 🔴       ║
║                                  ║
║           ${target.padStart(18)}║
║                                  ║
╚══════════════════════════════════╝
`;
        
        await sock.sendMessage(chatId, {
            text: reply(msg),
            mentions: mentions || []
        }, { quoted: message });
    }
};
