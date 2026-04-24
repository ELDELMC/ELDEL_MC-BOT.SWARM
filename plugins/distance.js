import { reply } from '../core/Formatter.js';

/**
 * .distance - Calculate distance between two numbers
 * Calcula la distancia entre dos números
 */

export default {
    command: 'distance',
    aliases: ['distancia', 'diff'],
    category: 'tools',
    description: 'Calcula distancia entre dos números',
    usage: '.distance <número1> <número2>',
    cooldown: 2000,

    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        
        if (args.length < 2) {
            return await sock.sendMessage(chatId, {
                text: reply('Proporciona dos números.\nUso: .distance 10 20')
            }, { quoted: message });
        }
        
        const num1 = parseFloat(args[0]);
        const num2 = parseFloat(args[1]);
        
        if (isNaN(num1) || isNaN(num2)) {
            return await sock.sendMessage(chatId, {
                text: reply('❌ Proporciona números válidos')
            }, { quoted: message });
        }
        
        const distance = Math.abs(num1 - num2);
        
        await sock.sendMessage(chatId, {
            text: reply(`📏 Distancia entre ${num1} y ${num2}:\n\n*${distance}*`)
        }, { quoted: message });
    }
};
