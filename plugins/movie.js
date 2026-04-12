import axios from 'axios';

export default {
    command: 'movie',
    aliases: ['película', 'film', 'cine'],
    category: 'fun',
    description: 'Información de películas',
    usage: '.movie Inception',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const title = args.join(' ');
        
        if (!title) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Uso: .movie [título]*'
            }, { quoted: message });
        }

        try {
            const response = await axios.get('https://www.omdbapi.com/', {
                params: {
                    t: title,
                    apikey: 'demo'
                }
            });
            
            const movie = response.data;
            if (movie.Response === 'False') {
                return await sock.sendMessage(chatId, {
                    text: `❌ Película no encontrada`
                }, { quoted: message });
            }
            
            const text = `🎬 *${movie.Title}*\n\n` +
                        `Año: ${movie.Year}\n` +
                        `Rating: ${movie.imdbRating}/10\n` +
                        `Director: ${movie.Director}`;
            
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
