import axios from 'axios';

export default {
    command: 'wikipedia',
    aliases: ['wiki', 'search'],
    category: 'info',
    description: 'Busca en Wikipedia',
    usage: '.wikipedia Python',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const query = args.join(' ');
        
        if (!query) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Uso: .wikipedia [término]*'
            }, { quoted: message });
        }

        try {
            const response = await axios.get('https://en.wikipedia.org/w/api.php', {
                params: {
                    action: 'query',
                    list: 'search',
                    srsearch: query,
                    format: 'json'
                }
            });
            
            const results = response.data.query.search;
            if (results.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: `❌ No se encontraron resultados para "${query}"`
                }, { quoted: message });
            }
            
            const result = results[0];
            const text = `📖 *${result.title}*\n\n${result.snippet.replace(/<\/?[^>]+(>|$)/g, '')}...`;
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error en búsqueda`
            }, { quoted: message });
        }
    }
};
