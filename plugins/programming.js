import axios from 'axios';

export default {
    command: 'programming',
    aliases: ['code', 'developer', 'programming'],
    category: 'info',
    description: 'Chiste de programación',
    usage: '.programming',
    cooldown: 3000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;

        try {
            const response = await axios.get('https://official-joke-api.appspot.com/jokes/programming/random');
            const joke = Array.isArray(response.data) ? response.data[0] : response.data;
            
            const text = `💻 *CHISTE*\n\n${joke.setup}\n\n${joke.punchline}`;
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error obteniendo chiste`
            }, { quoted: message });
        }
    }
};
