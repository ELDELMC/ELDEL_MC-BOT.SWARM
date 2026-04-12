import { reply } from '../core/Formatter.js';

/**
 * .random - Generate random number
 * Genera un número aleatorio entre dos límites
 */

export default {
    command: 'random',
    aliases: ['rand', 'aleatorio'],
    category: 'tools',
    description: 'Genera un número aleatorio',
    usage: '.random <min> <max>',
    cooldown: 2000,

    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        
        let min = 1;
        let max = 100;
        
        if (args.length >= 2) {
            min = parseInt(args[0]);
            max = parseInt(args[1]);
        } else if (args.length === 1) {
            max = parseInt(args[0]);
        }
        
        if (isNaN(min) || isNaN(max)) {
            return await sock.sendMessage(chatId, {
                text: reply('❌ Proporciona números válidos')
            }, { quoted: message });
        }
        
        const random = Math.floor(Math.random() * (max - min + 1)) + min;
        
        await sock.sendMessage(chatId, {
            text: reply(`🎲 Número aleatorio entre ${min} y ${max}:\n\n*${random}*`)
        }, { quoted: message });
    }
};
