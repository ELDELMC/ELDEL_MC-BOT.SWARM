import axios from 'axios';

export default {
    command: 'exchange',
    aliases: ['cambio', 'moneda', 'currency'],
    category: 'info',
    description: 'Tipo de cambio de monedas',
    usage: '.exchange 100 USD EUR',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        
        if (args.length < 3) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Uso: .exchange [cantidad] [de] [a]*\n*Ej: .exchange 100 USD EUR*'
            }, { quoted: message });
        }

        const amount = parseFloat(args[0]);
        const from = args[1].toUpperCase();
        const to = args[2].toUpperCase();

        try {
            const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
            const rate = response.data.rates[to];
            const result = (amount * rate).toFixed(2);
            
            const text = `💱 *Conversión*\n\n${amount} ${from} = ${result} ${to}`;
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error en conversión`
            }, { quoted: message });
        }
    }
};
