import sharedData from '../core/SharedData.js';
import { reply } from '../core/Formatter.js';

export default {
    command: 'ban',
    aliases: ['banear', 'block'],
    category: 'admin',
    description: 'Banear a un usuario del bot',
    usage: '.ban @usuario',
    adminOnly: true,
    groupOnly: true,
    cooldown: 3000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;

        // Get user to ban
        let userToBan =
            message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
            message.message?.extendedTextMessage?.contextInfo?.participant ||
            null;

        if (!userToBan) {
            await sock.sendMessage(chatId, {
                text: reply('Menciona al usuario o responde a su mensaje.\nUso: .ban @usuario'),
            }, { quoted: message });
            return;
        }

        // Don't ban the bot itself
        const botId = `${sock.user.id.split(':')[0]}@s.whatsapp.net`;
        if (userToBan === botId) {
            await sock.sendMessage(chatId, {
                text: reply('No puedo banearme a mi mismo.'),
            }, { quoted: message });
            return;
        }

        // Update banned list
        const banned = await sharedData.update('banned.json', [], (list) => {
            if (!list.includes(userToBan)) {
                list.push(userToBan);
            }
            return list;
        });

        const wasBanned = banned.includes(userToBan);
        const userTag = `@${userToBan.split('@')[0]}`;

        await sock.sendMessage(chatId, {
            text: reply(`Usuario ${userTag} ha sido baneado del bot.`),
            mentions: [userToBan],
        }, { quoted: message });
    },
};
