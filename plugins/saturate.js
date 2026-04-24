import sharp from 'sharp';

export default {
    command: 'saturate',
    aliases: ['saturado', 'saturation'],
    category: 'image',
    description: 'Aumenta saturación de colores',
    usage: '.saturate (responder a imagen)',
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
            const processed = await sharp(media).modulate({ saturation: 1.8 }).toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Saturación aumentada*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
