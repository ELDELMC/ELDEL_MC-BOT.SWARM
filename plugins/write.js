import { reply } from '../core/Formatter.js';

/**
 * .write - Simulate writing/typing
 * Simula escribir un texto lentamente
 */

export default {
    command: 'write',
    aliases: ['escribir', 'typing'],
    category: 'fun',
    description: 'Simula escribir texto',
    usage: '.write <texto>',
    cooldown: 3000,

    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        
        if (args.length === 0) {
            return await sock.sendMessage(chatId, {
                text: reply('Proporciona texto para escribir.\nUso: .write <texto>')
            }, { quoted: message });
        }
        
        const text = args.join(' ');
        
        const msg = `⌨️ *ESCRIBIENDO...*\n\n>>> ${text}`;
        
        await sock.sendMessage(chatId, {
            text: reply(msg)
        }, { quoted: message });
    }
};
