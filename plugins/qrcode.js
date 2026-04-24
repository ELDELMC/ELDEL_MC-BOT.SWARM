import axios from 'axios';

export default {
    command: 'qrcode',
    aliases: ['qr', 'codigo', 'barcode'],
    category: 'tool',
    description: 'Genera código QR',
    usage: '.qrcode https://example.com',
    cooldown: 3000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const url = args.join(' ');
        
        if (!url) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Uso: .qrcode [URL o texto]*'
            }, { quoted: message });
        }

        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
            
            await sock.sendMessage(chatId, {
                image: { url: qrUrl },
                caption: `📱 *Código QR generado*\n\n${url}`
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error generando QR`
            }, { quoted: message });
        }
    }
};
