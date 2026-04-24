import sharp from 'sharp';

export default {
    command: 'glitch',
    aliases: ['glitch', 'error', 'corrupto'],
    category: 'image',
    description: 'Efecto glitch/corrupto (distorsión)',
    usage: '.glitch (responder a imagen)',
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
                .modulate({ saturation: Math.random() * 2 })
                .rotate(Math.random() * 5)
                .blur(Math.random() * 3)
                .toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Efecto glitch aplicado*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
