import axios from 'axios';

export default {
    command: 'random-user',
    aliases: ['randomuser', 'user', 'usuario'],
    category: 'fun',
    description: 'Usuario aleatorio generado',
    usage: '.random-user',
    cooldown: 3000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;

        try {
            const response = await axios.get('https://randomuser.me/api/');
            const user = response.data.results[0];
            
            const text = `👤 *${user.name.first} ${user.name.last}*\n\n` +
                        `Email: ${user.email}\n` +
                        `País: ${user.location.country}\n` +
                        `Teléfono: ${user.phone}`;
            
            await sock.sendMessage(chatId, {
                image: { url: user.picture.large },
                caption: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error`
            }, { quoted: message });
        }
    }
};
