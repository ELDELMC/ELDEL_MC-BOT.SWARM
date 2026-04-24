import axios from 'axios';

export default {
    command: 'nasa',
    aliases: ['espacio', 'space', 'astro'],
    category: 'info',
    description: 'Foto astronómica del día NASA',
    usage: '.nasa',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;

        try {
            const response = await axios.get('https://api.nasa.gov/planetary/apod', {
                params: { api_key: 'DEMO_KEY' }
            });
            
            const data = response.data;
            const text = `🚀 *${data.title}*\n\n${data.explanation.substring(0, 200)}...`;
            
            await sock.sendMessage(chatId, {
                image: { url: data.url },
                caption: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error`
            }, { quoted: message });
        }
    }
};
