import sharp from 'sharp';

export default {
    command: 'pixelate',
    aliases: ['pixel', 'pixeles', 'blur8bit'],
    category: 'image',
    description: 'Pixela una imagen (crea efecto retro)',
    usage: '.pixelate (responder a imagen)',
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
            const processed = await sharp(media)
                .resize(50, 50, { fit: 'cover' })
                .resize(400, 400, { kernel: 'nearest' })
                .toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Imagen pixelada*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
