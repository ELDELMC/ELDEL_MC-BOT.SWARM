import { reply } from '../core/Formatter.js';

/**
 * .howgay - Joke "how gay are you" meter
 * Generador de porcentaje jocoso
 */

export default {
    command: 'howgay',
    aliases: ['gaymeter', 'LGBT'],
    category: 'fun',
    description: 'Medidor jocoso (para memes)',
    usage: '.howgay',
    cooldown: 3000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        const percentage = Math.floor(Math.random() * 101);
        
        let comment = '';
        if (percentage > 80) comment = ' 🏳️‍🌈';
        
        await sock.sendMessage(chatId, {
            text: reply(`📊 Lecturas detectadas: ${percentage}%${comment}`)
        }, { quoted: message });
    }
};
