import sharp from 'sharp';

export default {
    command: 'mirror',
    aliases: ['espejo', 'duplicate', 'simetria'],
    category: 'image',
    description: 'Crea efecto espejo/simetría',
    usage: '.mirror (responder a imagen)',
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
            const metadata = await sharp(media).metadata();
            const original = await sharp(media).toBuffer();
            const flipped = await sharp(media).flop().toBuffer();
            
            const processed = await sharp({
                create: {
                    width: metadata.width * 2,
                    height: metadata.height,
                    channels: 3,
                    background: { r: 255, g: 255, b: 255 }
                }
            }).composite([
                { input: original, left: 0, top: 0 },
                { input: flipped, left: metadata.width, top: 0 }
            ]).toBuffer();
            
            await sock.sendMessage(chatId, {
                image: processed,
                caption: '✅ *Efecto espejo aplicado*'
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
