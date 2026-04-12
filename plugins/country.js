import axios from 'axios';

export default {
    command: 'country',
    aliases: ['pais', 'nacion', 'world'],
    category: 'info',
    description: 'Información de países',
    usage: '.country Spain',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const countryName = args.join(' ');
        
        if (!countryName) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Uso: .country [país]*'
            }, { quoted: message });
        }

        try {
            const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}`);
            const country = response.data[0];
            
            const text = `🌍 *${country.name.common}*\n\n` +
                        `Capital: ${country.capital?.[0] || 'N/A'}\n` +
                        `Región: ${country.region}\n` +
                        `Población: ${country.population?.toLocaleString() || 'N/A'}`;
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ País no encontrado`
            }, { quoted: message });
        }
    }
};
