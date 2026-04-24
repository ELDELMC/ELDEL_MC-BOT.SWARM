import sharp from 'sharp';

export default {
    command: 'sepia',
    aliases: ['vintage', 'antiguo'],
    category: 'image',
    description: 'Aplica efecto sepia a una imagen',
    usage: '.sepia (responder a imagen)',
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
                .modulate({ saturation: 0.5, lightness: 0.1 })
                .tint({ r: 80, g: 60, b: 40 })
                .toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Efecto sepia aplicado*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
