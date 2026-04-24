import axios from 'axios';

export default {
    command: 'quote',
    aliases: ['frase', 'motivacion', 'quote'],
    category: 'fun',
    description: 'Obtiene una frase motivacional',
    usage: '.quote',
    cooldown: 3000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;

        try {
            const response = await axios.get('https://api.quotable.io/random');
            const data = response.data;
            
            const text = `💭 *"${data.content}"*\n\n— ${data.author}`;
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error obteniendo frase`
            }, { quoted: message });
        }
    }
};
