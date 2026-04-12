import { reply } from '../core/Formatter.js';

/**
 * .percentage - Calculate percentage
 * Calcula un porcentaje de un número
 */

export default {
    command: 'percentage',
    aliases: ['porciento', 'percent', '%'],
    category: 'tools',
    description: 'Calcula un porcentaje',
    usage: '.percentage <número> <porcentaje>',
    cooldown: 2000,

    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        
        if (args.length < 2) {
            return await sock.sendMessage(chatId, {
                text: reply('Uso: .percentage 100 25\n(Calcula el 25% de 100)')
            }, { quoted: message });
        }
        
        const num = parseFloat(args[0]);
        const percent = parseFloat(args[1]);
        
        if (isNaN(num) || isNaN(percent)) {
            return await sock.sendMessage(chatId, {
                text: reply('❌ Proporciona números válidos')
            }, { quoted: message });
        }
        
        const result = (num * percent) / 100;
        
        await sock.sendMessage(chatId, {
            text: reply(`📊 El ${percent}% de ${num} es:\n\n*${result}*`)
        }, { quoted: message });
    }
};
