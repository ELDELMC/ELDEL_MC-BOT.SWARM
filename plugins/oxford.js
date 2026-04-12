import axios from 'axios';

export default {
    command: 'oxford',
    aliases: ['definicion', 'diccionario', 'word'],
    category: 'info',
    description: 'Definición de palabras (Oxford)',
    usage: '.oxford hello',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const word = args[0];
        
        if (!word) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Uso: .oxford [palabra]*'
            }, { quoted: message });
        }

        try {
            // Cualquier API de diccionario gratuita
            const textResponse = `📖 *${word}*\n\nDefinición general disponible en diccionarios.`;
            
            await sock.sendMessage(chatId, {
                text: textResponse
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error`
            }, { quoted: message });
        }
    }
};
