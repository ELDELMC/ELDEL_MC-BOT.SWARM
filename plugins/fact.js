import axios from 'axios';

export default {
    command: 'fact',
    aliases: ['hecho', 'curiosidad', 'trivia'],
    category: 'fun',
    description: 'Dato/hecho curioso aleatorio',
    usage: '.fact',
    cooldown: 3000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;

        try {
            const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
            const fact = response.data.text;
            
            const text = `🔍 *DATO CURIOSO*\n\n${fact}`;
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error`
            }, { quoted: message });
        }
    }
};
