import { reply } from '../core/Formatter.js';

/**
 * .coinflip / .moneda - Flip a coin
 * Lanza una moneda y muestra si es cara o cruz
 */

export default {
    command: 'coinflip',
    aliases: ['moneda', 'flip_coin'],
    category: 'games',
    description: 'Lanza una moneda',
    usage: '.coinflip',
    cooldown: 2000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        const isHeads = Math.random() > 0.5;
        const result = isHeads ? 'Cara 🪙' : 'Cruz 🪙';
        
        await sock.sendMessage(chatId, {
            text: reply(`¡Resultado: ${result}!`)
        }, { quoted: message });
    }
};
