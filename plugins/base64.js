import { reply } from '../core/Formatter.js';

/**
 * .base64 - Base64 encode/decode
 * Codifica o decodifica texto en base64
 */

export default {
    command: 'base64',
    aliases: ['b64', 'encode'],
    category: 'tools',
    description: 'Codifica/decodifica base64',
    usage: '.base64 <encode|decode> <texto>',
    cooldown: 2000,

    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        
        if (args.length < 2) {
            return await sock.sendMessage(chatId, {
                text: reply('Uso: .base64 <encode|decode> <texto>\nEjemplo: .base64 encode Hola')
            }, { quoted: message });
        }
        
        const mode = args[0].toLowerCase();
        const text = args.slice(1).join(' ');
        
        try {
            let result = '';
            
            if (mode === 'encode') {
                result = Buffer.from(text).toString('base64');
            } else if (mode === 'decode') {
                result = Buffer.from(text, 'base64').toString('utf8');
            } else {
                return await sock.sendMessage(chatId, {
                    text: reply('Usa "encode" o "decode"')
                }, { quoted: message });
            }
            
            await sock.sendMessage(chatId, {
                text: reply(`\`\`\`\n${result}\n\`\`\``)
            }, { quoted: message });
        } catch (err) {
            await sock.sendMessage(chatId, {
                text: reply('❌ Error: Verifica que el texto sea válido')
            }, { quoted: message });
        }
    }
};
