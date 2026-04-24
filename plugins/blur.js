import sharp from 'sharp';

export default {
    command: 'blur',
    aliases: ['borroso', 'emborronar'],
    category: 'image',
    description: 'Desenfoca una imagen',
    usage: '.blur (responder a imagen)',
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
            const processed = await sharp(media).blur(10).toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Imagen desenfocada*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
