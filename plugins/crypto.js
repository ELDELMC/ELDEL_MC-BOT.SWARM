import axios from 'axios';

export default {
    command: 'crypto',
    aliases: ['bitcoin', 'ethereum', 'criptomoneda'],
    category: 'info',
    description: 'Precio de criptomonedas',
    usage: '.crypto bitcoin',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const coin = args[0]?.toLowerCase() || 'bitcoin';

        try {
            const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
                params: {
                    ids: coin,
                    vs_currencies: 'usd'
                }
            });
            
            const price = response.data[coin]?.usd || 'N/A';
            const text = `💰 *${coin.toUpperCase()}*\n\nPrecio: $${price} USD`;
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Criptomoneda no encontrada`
            }, { quoted: message });
        }
    }
};
