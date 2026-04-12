import axios from 'axios';

export default {
    command: 'university',
    aliases: ['universidad', 'university', 'uni'],
    category: 'info',
    description: 'Información de universidades',
    usage: '.university Madrid',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const query = args.join(' ');
        
        if (!query) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Uso: .university [ciudad/país]*'
            }, { quoted: message });
        }

        try {
            const response = await axios.get('http://universities.hipolabs.com/search', {
                params: { name: query, limit: 3 }
            });
            
            const unis = response.data;
            if (unis.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: `❌ No se encontraron universidades`
                }, { quoted: message });
            }
            
            let text = '🎓 *Universidades encontradas*\n\n';
            unis.forEach((uni, i) => {
                text += `${i + 1}. ${uni.name}\n`;
            });
            
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
