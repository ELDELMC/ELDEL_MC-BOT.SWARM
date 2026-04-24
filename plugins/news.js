import axios from 'axios';

export default {
    command: 'news',
    aliases: ['noticias', 'news', 'trending'],
    category: 'info',
    description: 'Noticias de tecnología',
    usage: '.news',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;

        try {
            const response = await axios.get(
                'https://newsapi.org/v2/top-headlines',
                {
                    params: {
                        category: 'technology',
                        language: 'es',
                        apiKey: 'demo' // API pública limitada
                    }
                }
            );
            
            const articles = response.data.articles.slice(0, 3);
            let text = '📰 *NOTICIAS*\n\n';
            
            articles.forEach((article, i) => {
                text += `${i + 1}. ${article.title}\n`;
            });
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error obteniendo noticias`
            }, { quoted: message });
        }
    }
};
