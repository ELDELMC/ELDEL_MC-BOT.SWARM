import sharp from 'sharp';

export default {
    command: 'edge',
    aliases: ['bordes', 'edges', 'contorno'],
    category: 'image',
    description: 'Detecta bordes en una imagen',
    usage: '.edge (responder a imagen)',
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
                .convolve({
                    kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
                    scale: 1
                })
                .toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Detección de bordes aplicada*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
