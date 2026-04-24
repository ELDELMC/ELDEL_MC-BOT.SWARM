import { reply } from '../core/Formatter.js';

export default {
    command: 'hidetag',
    aliases: ['tagall', 'todos', 'everyone'],
    category: 'admin',
    description: 'Mencionar a todos los miembros del grupo',
    usage: '.hidetag mensaje',
    groupOnly: true,
    adminOnly: true,
    cooldown: 10000,

    async handler(sock, message, args, context) {
        const chatId = context.chatId;

        const text = args.join(' ') || 'Atencion a todos!';

        try {
            const metadata = await sock.groupMetadata(chatId);
            const participants = metadata.participants || [];
            const mentions = participants.map(p => p.id);

            await sock.sendMessage(chatId, {
                text: reply(text),
                mentions,
            }, { quoted: message });
        } catch (err) {
            await sock.sendMessage(chatId, {
                text: reply(`Error: ${err.message}`),
            }, { quoted: message });
        }
    },
};
