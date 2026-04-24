import sharp from 'sharp';

export default {
    command: 'desaturate',
    aliases: ['desaturado', 'reducesaturation'],
    category: 'image',
    description: 'Reduce saturación de colores',
    usage: '.desaturate (responder a imagen)',
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
            const processed = await sharp(media).modulate({ saturation: 0.3 }).toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Saturación reducida*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
