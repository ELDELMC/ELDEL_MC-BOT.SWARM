import axios from 'axios';

export default {
    command: 'color',
    aliases: ['color', 'hex', 'rgb'],
    category: 'tool',
    description: 'Información sobre colores HEX',
    usage: '.color FF5733',
    cooldown: 3000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const hexColor = args[0] || 'FF5733';

        try {
            const response = await axios.get(`https://www.thecolorapi.com/id?hex=${hexColor}`);
            const color = response.data;
            
            const text = `🎨 *Color HEX: #${hexColor}*\n\n` +
                        `Nombre: ${color.name.value}\n` +
                        `RGB: rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Color no encontrado`
            }, { quoted: message });
        }
    }
};
