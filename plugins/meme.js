import axios from 'axios';

export default {
    command: 'meme',
    aliases: ['meme', 'subreddit'],
    category: 'fun',
    description: 'Obtiene un meme aleatorio',
    usage: '.meme',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;

        try {
            const response = await axios.get('https://meme-api.com/gimme');
            const data = response.data;
            
            const text = `😂 *${data.title}*\n\n👍 ${data.ups} | 💬 ${data.downs}`;
            
            await sock.sendMessage(chatId, {
                image: { url: data.url },
                caption: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error obteniendo meme`
            }, { quoted: message });
        }
    }
};
