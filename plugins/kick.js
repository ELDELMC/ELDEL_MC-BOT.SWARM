import { reply } from '../core/Formatter.js';
import adminChecker from '../core/AdminChecker.js';

export default {
    command: 'kick',
    aliases: ['remove', 'expulsar'],
    category: 'admin',
    description: 'Expulsar a un usuario del grupo',
    usage: '.kick @usuario',
    groupOnly: true,
    adminOnly: true,
    cooldown: 3000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;

        // Gather users to kick
        let usersToKick = [];
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentioned && mentioned.length > 0) {
            usersToKick = mentioned;
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            usersToKick = [message.message.extendedTextMessage.contextInfo.participant];
        }

        if (usersToKick.length === 0) {
            await sock.sendMessage(chatId, {
                text: reply('Menciona al usuario o responde a su mensaje.\nUso: .kick @usuario'),
            }, { quoted: message });
            return;
        }

        // Prevent kicking the bot
        const botNum = sock.user?.id?.split(':')[0] || '';
        const botJid = `${botNum}@s.whatsapp.net`;
        const isTryingToKickBot = usersToKick.some(jid => {
            const num = jid.split('@')[0].split(':')[0];
            return num === botNum || jid === botJid;
        });

        if (isTryingToKickBot) {
            await sock.sendMessage(chatId, {
                text: reply('No puedo expulsarme a mi mismo.'),
            }, { quoted: message });
            return;
        }

        try {
            await sock.groupParticipantsUpdate(chatId, usersToKick, 'remove');

            const tags = usersToKick.map(jid => `@${jid.split('@')[0]}`).join(', ');

            await sock.sendMessage(chatId, {
                text: reply(`Usuario(s) expulsado(s): ${tags}`),
                mentions: usersToKick,
            }, { quoted: message });
        } catch (err) {
            await sock.sendMessage(chatId, {
                text: reply(`Error al expulsar: ${err.message}`),
            }, { quoted: message });
        }
    },
};
