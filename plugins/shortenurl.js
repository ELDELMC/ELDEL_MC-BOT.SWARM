import axios from 'axios';

export default {
    command: 'shortenurl',
    aliases: ['shorten', 'acortar', 'short'],
    category: 'tool',
    description: 'Acorta URLs',
    usage: '.shortenurl https://example.com/very/long/url',
    cooldown: 3000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const longUrl = args.join(' ');
        
        if (!longUrl) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Uso: .shortenurl [URL]*'
            }, { quoted: message });
        }

        try {
            const response = await axios.get('https://tinyurl.com/api-create.php', {
                params: { url: longUrl }
            });
            
            const shortUrl = response.data;
            const text = `🔗 *URL Acortada*\n\nOriginal: ${longUrl.substring(0, 30)}...\nCorta: ${shortUrl}`;
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error acortando URL`
            }, { quoted: message });
        }
    }
};
