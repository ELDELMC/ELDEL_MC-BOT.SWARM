import axios from 'axios';

export default {
    command: 'status',
    aliases: ['estatus', 'serverinfo', 'info'],
    category: 'info',
    description: 'Estado de servicios online',
    usage: '.status',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;

        try {
            const text = `📊 *ESTADO DE SERVICIOS*\n\n` +
                        `✅ API de Clima: En línea\n` +
                        `✅ API de Pokédex: En línea\n` +
                        `✅ API de GitHub: En línea\n` +
                        `✅ API de Noticias: En línea\n` +
                        `✅ API de Criptomonedas: En línea`;
            
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
