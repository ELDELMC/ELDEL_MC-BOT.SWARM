import axios from 'axios';

export default {
    command: 'translate',
    aliases: ['traducir', 'traductor', 'translate'],
    category: 'tool',
    description: 'Traduce texto',
    usage: '.translate Hello',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const text = args.join(' ');
        
        if (!text) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Uso: .translate [texto]*'
            }, { quoted: message });
        }

        try {
            // API de traducción gratuita
            const result = `📝 *Traducción*\n\nOriginal: ${text}\nTraducida: [Requiere API key]`;
            
            await sock.sendMessage(chatId, {
                text: result
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error`
            }, { quoted: message });
        }
    }
};
