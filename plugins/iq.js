import { reply } from '../core/Formatter.js';

/**
 * .iq - Generate fake IQ score
 * Generador de "puntuación de IQ" jocosa
 */

export default {
    command: 'iq',
    aliases: ['qi', 'inteligencia', 'brain'],
    category: 'fun',
    description: 'Calcula un "IQ" jocoso',
    usage: '.iq [@usuario]',
    cooldown: 3000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        
        let target = 'tú';
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentions && mentions.length > 0) {
            target = `@${mentions[0].split('@')[0]}`;
        }
        
        // Fake IQ between 40 and 200
        const iq = Math.floor(Math.random() * 160) + 40;
        
        let comment = '';
        if (iq < 50) comment = '🤔 Necesitas descansar...';
        if (iq >= 50 && iq < 80) comment = 'Promedio, nada especial';
        if (iq >= 80 && iq < 120) comment = '✨ Bastante inteligente';
        if (iq >= 120 && iq < 150) comment = '🧠 Muy inteligente!';
        if (iq >= 150) comment = '👑 GENIO ABSOLUTO!';
        
        const msg = `🧠 *PUNTUACIÓN IQ*\n\n${target}\n\nIQ: ${iq}\n${comment}`;
        
        await sock.sendMessage(chatId, {
            text: reply(msg),
            mentions: mentions || []
        }, { quoted: message });
    }
};
