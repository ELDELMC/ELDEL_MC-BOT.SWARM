import axios from 'axios';

export default {
    command: 'anime',
    aliases: ['anime', 'manga', 'waifu'],
    category: 'fun',
    description: 'Información de anime',
    usage: '.anime Naruto',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const query = args.join(' ');
        
        if (!query) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Uso: .anime [nombre]*'
            }, { quoted: message });
        }

        try {
            const response = await axios.get('https://api.jikan.moe/v4/anime', {
                params: { query: query, limit: 1 }
            });
            
            const anime = response.data.data[0];
            if (!anime) {
                return await sock.sendMessage(chatId, {
                    text: `❌ Anime no encontrado`
                }, { quoted: message });
            }
            
            const text = `🎎 *${anime.title}*\n\n` +
                        `Año: ${anime.year || 'N/A'}\n` +
                        `Episodios: ${anime.episodes || 'N/A'}\n` +
                        `Score: ${anime.score || 'N/A'}/10`;
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error buscando anime`
            }, { quoted: message });
        }
    }
};
