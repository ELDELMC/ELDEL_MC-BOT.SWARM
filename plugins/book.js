import axios from 'axios';

export default {
    command: 'book',
    aliases: ['libro', 'novela', 'reading'],
    category: 'info',
    description: 'Busca información de libros',
    usage: '.book 1984',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const query = args.join(' ');
        
        if (!query) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Uso: .book [título]*'
            }, { quoted: message });
        }

        try {
            const response = await axios.get('https://openlibrary.org/search.json', {
                params: { title: query, limit: 1 }
            });
            
            const book = response.data.docs[0];
            if (!book) {
                return await sock.sendMessage(chatId, {
                    text: `❌ Libro no encontrado`
                }, { quoted: message });
            }
            
            const text = `📚 *${book.title}*\n\n` +
                        `Autor: ${book.author_name?.[0] || 'N/A'}\n` +
                        `Año: ${book.first_publish_year || 'N/A'}`;
            
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
