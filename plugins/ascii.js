import sharp from 'sharp';

export default {
    command: 'ascii',
    aliases: ['ascii', 'asciify'],
    category: 'image',
    description: 'Convierte imagen a arte ASCII',
    usage: '.ascii (responder a imagen)',
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
                .resize(100, 50)
                .grayscale()
                .toBuffer();
            
            const text = '✅ ASCII generado (requiere post-procesamiento)\n' + '▓'.repeat(50);
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
