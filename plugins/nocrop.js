import sharp from 'sharp';

export default {
    command: 'nocrop',
    aliases: ['redoblado', 'cuadrado'],
    category: 'image',
    description: 'Convierte imagen a formato cuadrado sin recortar',
    usage: '.nocrop (responder a imagen)',
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
            const size = Math.max(metadata.width, metadata.height);
            
            const processed = await sharp(media)
                .extend({
                    left: Math.floor((size - metadata.width) / 2),
                    right: Math.floor((size - metadata.width) / 2),
                    top: Math.floor((size - metadata.height) / 2),
                    bottom: Math.floor((size - metadata.height) / 2),
                    background: { r: 255, g: 255, b: 255 }
                })
                .toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Imagen redimensionada a cuadrado*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
