import axios from 'axios';

export default {
    command: 'advice',
    aliases: ['consejo', 'sabiduria', 'advice'],
    category: 'fun',
    description: 'Consejo/sabiduría aleatoria',
    usage: '.advice',
    cooldown: 3000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;

        try {
            const response = await axios.get('https://api.adviceslip.com/advice');
            const advice = response.data.slip.advice;
            
            const text = `💡 *CONSEJO*\n\n${advice}`;
            
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
