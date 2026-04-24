import axios from 'axios';

export default {
    command: 'github',
    aliases: ['git', 'repo', 'github'],
    category: 'info',
    description: 'Información de usuario GitHub',
    usage: '.github torvalds',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const user = args[0];
        
        if (!user) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Uso: .github [usuario]*'
            }, { quoted: message });
        }

        try {
            const response = await axios.get(`https://api.github.com/users/${user}`);
            const data = response.data;
            
            const text = `👨‍💻 *${data.name || data.login}*\n\n` +
                        `Repos: ${data.public_repos}\n` +
                        `Followers: ${data.followers}\n` +
                        `Following: ${data.following}`;
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Usuario no encontrado`
            }, { quoted: message });
        }
    }
};
