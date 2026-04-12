import { reply } from '../core/Formatter.js';

/**
 * .choose - Choose between options
 * Elige aleatoriamente entre opciones proporcionadas
 */

export default {
    command: 'choose',
    aliases: ['elegir', 'pick', 'seleccionar'],
    category: 'tools',
    description: 'Elige aleatoriamente entre opciones',
    usage: '.choose <opción1|opción2|opción3>',
    cooldown: 2000,

    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        
        if (args.length === 0) {
            return await sock.sendMessage(chatId, {
                text: reply('Proporciona opciones separadas por |.\nEjemplo: .choose Pizza|Hamburguesa|Tacos')
            }, { quoted: message });
        }
        
        const text = args.join(' ');
        const options = text.split('|').map(opt => opt.trim()).filter(opt => opt.length > 0);
        
        if (options.length < 2) {
            return await sock.sendMessage(chatId, {
                text: reply('Necesita al menos 2 opciones separadas por |')
            }, { quoted: message });
        }
        
        const chosen = options[Math.floor(Math.random() * options.length)];
        
        await sock.sendMessage(chatId, {
            text: reply(`🎯 Yo elijo: *${chosen}*`)
        }, { quoted: message });
    }
};
