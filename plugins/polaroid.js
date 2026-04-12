import sharp from 'sharp';

export default {
    command: 'polaroid',
    aliases: ['foto', 'polaroid', 'instant'],
    category: 'image',
    description: 'Efecto Polaroid (marco vintage)',
    usage: '.polaroid (responder a imagen)',
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
                .resize(300, 300, { fit: 'cover' })
                .extend({
                    top: 20,
                    bottom: 80,
                    left: 20,
                    right: 20,
                    background: { r: 230, g: 230, b: 220 }
                })
                .toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Efecto Polaroid aplicado*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
