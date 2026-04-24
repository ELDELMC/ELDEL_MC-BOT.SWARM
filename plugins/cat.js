import axios from 'axios';

export default {
    command: 'cat',
    aliases: ['gato', 'cats', 'felino'],
    category: 'fun',
    description: 'Foto aleatoria de gato',
    usage: '.cat',
    cooldown: 3000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;

        try {
            const response = await axios.get('https://api.thecatapi.com/v1/images/search');
            const catUrl = response.data[0]?.url;
            
            if (!catUrl) {
                return await sock.sendMessage(chatId, {
                    text: `❌ Error obteniendo gato`
                }, { quoted: message });
            }
            
            await sock.sendMessage(chatId, {
                image: { url: catUrl },
                caption: '🐱 *Aquí está tu gato*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error`
            }, { quoted: message });
        }
    }
};
