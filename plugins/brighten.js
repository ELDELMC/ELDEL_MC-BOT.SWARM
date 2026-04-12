import sharp from 'sharp';

export default {
    command: 'brighten',
    aliases: ['brillo', 'bright'],
    category: 'image',
    description: 'Aumenta el brillo de una imagen',
    usage: '.brighten (responder a imagen)',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted?.imageMessage) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Debes responder a una imagen*'
            }, { quoted: message });
        }

        try {
            const media = await sock.downloadMediaMessage(quoted);
            const processed = await sharp(media).modulate({ lightness: 1.3 }).toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Brillo aumentado*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
