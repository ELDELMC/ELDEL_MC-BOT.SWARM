import sharp from 'sharp';

export default {
    command: 'hue',
    aliases: ['matiz', 'tono'],
    category: 'image',
    description: 'Ajusta el matiz de la imagen',
    usage: '.hue (responder a imagen)',
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
            const processed = await sharp(media).modulate({ hue: 150 }).toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Matiz ajustado*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
