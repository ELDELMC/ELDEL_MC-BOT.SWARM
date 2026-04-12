import axios from 'axios';

export default {
    command: 'dog',
    aliases: ['perro', 'dogs', 'canino'],
    category: 'fun',
    description: 'Foto aleatoria de perro',
    usage: '.dog',
    cooldown: 3000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;

        try {
            const response = await axios.get('https://dog.ceo/api/breeds/image/random');
            const dogUrl = response.data.message;
            
            await sock.sendMessage(chatId, {
                image: { url: dogUrl },
                caption: '🐕 *Aquí está tu perro*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error`
            }, { quoted: message });
        }
    }
};
