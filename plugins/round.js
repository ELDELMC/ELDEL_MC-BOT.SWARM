import sharp from 'sharp';

export default {
    command: 'round',
    aliases: ['redondo', 'circular', 'circle'],
    category: 'image',
    description: 'Hace que la imagen tenga esquinas redondeadas',
    usage: '.round (responder a imagen)',
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
            const size = Math.min(metadata.width, metadata.height);
            
            const processed = await sharp(media)
                .resize(size, size, { fit: 'cover' })
                .png()
                .toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Esquinas redondeadas aplicadas*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
