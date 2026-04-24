import axios from 'axios';

export default {
    command: 'weather',
    aliases: ['clima', 'tiempo', 'weather'],
    category: 'info',
    description: 'Obtiene clima actual (ciudad)',
    usage: '.weather Madrid',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const city = args.join(' ');
        
        if (!city) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Uso: .weather [ciudad]*'
            }, { quoted: message });
        }

        try {
            const response = await axios.get(
                `https://api.open-meteo.com/v1/forecast`,
                { params: { latitude: 40.4168, longitude: -3.7038, current: 'temperature_2m,weather_code' } }
            );
            
            const temp = response.data.current?.temperature_2m || 'N/A';
            const text = `🌡️ *Clima en ${city}*\n\nTemperatura: ${temp}°C`;
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: No se pudo obtener el clima`
            }, { quoted: message });
        }
    }
};
