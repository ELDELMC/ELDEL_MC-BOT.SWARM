import sharp from 'sharp';

export default {
    command: 'border',
    aliases: ['marco', 'frame', 'borde'],
    category: 'image',
    description: 'Añade un borde negro a una imagen',
    usage: '.border (responder a imagen)',
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
                .extend({
                    top: 20,
                    bottom: 20,
                    left: 20,
                    right: 20,
                    background: { r: 0, g: 0, b: 0 }
                })
                .toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Borde añadido*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
