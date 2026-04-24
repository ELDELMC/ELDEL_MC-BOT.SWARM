import sharp from 'sharp';

export default {
    command: 'tint',
    aliases: ['tono', 'color', 'filter'],
    category: 'image',
    description: 'Aplica un tono de color a la imagen',
    usage: '.tint (responder a imagen)',
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
                .tint({ r: 255, g: 100, b: 100 })
                .toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Tono rojo aplicado*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
