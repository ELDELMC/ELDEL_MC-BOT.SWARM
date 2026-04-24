import axios from 'axios';

export default {
    command: 'ip',
    aliases: ['ipaddress', 'myip', 'ipinfo'],
    category: 'info',
    description: 'Información de una dirección IP',
    usage: '.ip 8.8.8.8',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const ipAddress = args[0] || 'YOUR_IP';

        try {
            const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
            const data = response.data;
            
            const text = `🌐 *IP: ${data.ip}*\n\n` +
                        `País: ${data.country_name}\n` +
                        `Ciudad: ${data.city}\n` +
                        `ISP: ${data.org}`;
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error obteniendo información`
            }, { quoted: message });
        }
    }
};
