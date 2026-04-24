import { reply } from '../core/Formatter.js';

export default {
    command: 'ping',
    aliases: ['p', 'pong'],
    category: 'general',
    description: 'Verificar latencia del bot',
    usage: '.ping',
    cooldown: 3000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        const start = Date.now();

        const sent = await sock.sendMessage(chatId, {
            text: reply('Calculando latencia...'),
        }, { quoted: message });

        const latency = Date.now() - start;

        await sock.sendMessage(chatId, {
            text: reply(`Pong!\nLatencia: ${latency}ms\nSesion: S${context.sessionIndex}`),
            edit: sent.key,
        });
    },
};
