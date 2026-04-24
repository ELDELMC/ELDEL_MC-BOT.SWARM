import sharp from 'sharp';

export default {
    command: 'rotate',
    aliases: ['girar', 'turn'],
    category: 'image',
    description: 'Gira una imagen 90 grados',
    usage: '.rotate (responder a imagen)',
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
            const processed = await sharp(media).rotate(90).toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Imagen girada 90°*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
