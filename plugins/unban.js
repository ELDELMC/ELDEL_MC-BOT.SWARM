import sharedData from '../core/SharedData.js';
import { reply } from '../core/Formatter.js';

export default {
    command: 'unban',
    aliases: ['desbanear', 'unblock'],
    category: 'admin',
    description: 'Desbanear a un usuario del bot',
    usage: '.unban @usuario',
    adminOnly: true,
    groupOnly: true,
    cooldown: 3000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;

        let userToUnban =
            message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
            message.message?.extendedTextMessage?.contextInfo?.participant ||
            null;

        if (!userToUnban) {
            await sock.sendMessage(chatId, {
                text: reply('Menciona al usuario o responde a su mensaje.\nUso: .unban @usuario'),
            }, { quoted: message });
            return;
        }

        const banned = await sharedData.update('banned.json', [], (list) => {
            const idx = list.indexOf(userToUnban);
            if (idx !== -1) {
                list.splice(idx, 1);
            }
            return list;
        });

        const userTag = `@${userToUnban.split('@')[0]}`;

        await sock.sendMessage(chatId, {
            text: reply(`Usuario ${userTag} ha sido desbaneado.`),
            mentions: [userToUnban],
        }, { quoted: message });
    },
};
