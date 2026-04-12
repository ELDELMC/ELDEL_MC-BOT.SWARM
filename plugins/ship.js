import { reply } from '../core/Formatter.js';

/**
 * .ship - Ship two people (compatibility rating)
 * Calcula una "compatibilidad" cómica entre dos usuarios
 */

export default {
    command: 'ship',
    aliases: ['shipear', 'couple', 'love'],
    category: 'fun',
    description: 'Calcula compatibilidad cómica entre dos usuarios',
    usage: '.ship @user1 @user2',
    groupOnly: true,
    cooldown: 3000,

    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentions || mentions.length < 2) {
            return await sock.sendMessage(chatId, {
                text: reply('Menciona a 2 usuarios para ver compatibilidad.\nUso: .ship @user1 @user2')
            }, { quoted: message });
        }
        
        const user1 = mentions[0].split('@')[0];
        const user2 = mentions[1].split('@')[0];
        
        // Generate "compatibility" percentage
        const compatibility = Math.floor(Math.random() * 101);
        
        let emoji = '❌';
        if (compatibility > 70) emoji = '💚';
        if (compatibility > 80) emoji = '❤️';
        if (compatibility > 90) emoji = '💕';
        
        const ship = `${user1.substring(0, 3)}❤️${user2.substring(0, 3)}`;
        
        await sock.sendMessage(chatId, {
            text: reply(`💑 *COMPATIBILIDAD CÓMICA*\n\n${ship}\n\n${emoji} *Nivel: ${compatibility}%*`),
            mentions: [mentions[0], mentions[1]]
        }, { quoted: message });
    }
};
