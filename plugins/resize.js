import sharp from 'sharp';

export default {
    command: 'resize',
    aliases: ['resize', 'redimensionar', 'size'],
    category: 'image',
    description: 'Redimensiona una imagen al 50%',
    usage: '.resize (responder a imagen)',
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
            const metadata = await sharp(media).metadata();
            const processed = await sharp(media)
                .resize(Math.floor(metadata.width * 0.5), Math.floor(metadata.height * 0.5))
                .toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Imagen redimensionada al 50%*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
