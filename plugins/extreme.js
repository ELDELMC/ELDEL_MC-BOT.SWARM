import sharp from 'sharp';

export default {
    command: 'extreme',
    aliases: ['extremo', 'vibrant'],
    category: 'image',
    description: 'Aplica filtro extremo/vibrant',
    usage: '.extreme (responder a imagen)',
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
                .modulate({ saturation: 2.5, lightness: 1.1 })
                .normalise()
                .toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Filtro extremo aplicado*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
