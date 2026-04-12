import { reply } from '../core/Formatter.js';

/**
 * .dice / .dado - Roll a random dice
 * Lanza un dado aleatorio (1-6) y muestra el resultado
 */

export default {
    command: 'dice',
    aliases: ['dado', 'roll'],
    category: 'games',
    description: 'Lanza un dado (1-6)',
    usage: '.dice',
    cooldown: 2000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        const roll = Math.floor(Math.random() * 6) + 1;
        
        const emojis = ['🎲', '⚀', '⚁', '⚂', '⚃', '⚄'];
        const emoji = emojis[roll - 1] || '🎲';
        
        await sock.sendMessage(chatId, {
            text: reply(`${emoji} ¡Sacaste un ${roll}!`)
        }, { quoted: message });
    }
};
