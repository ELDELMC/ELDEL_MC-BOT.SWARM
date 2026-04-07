import { reply } from '../core/Formatter.js';

export default {
    command: 'promote',
    aliases: ['promover', 'admin'],
    category: 'admin',
    description: 'Promover a un usuario a administrador',
    usage: '.promote @usuario',
    groupOnly: true,
    adminOnly: true,
    cooldown: 3000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;

        let usersToPromote = [];
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentioned && mentioned.length > 0) {
            usersToPromote = mentioned;
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            usersToPromote = [message.message.extendedTextMessage.contextInfo.participant];
        }

        if (usersToPromote.length === 0) {
            await sock.sendMessage(chatId, {
                text: reply('Menciona al usuario o responde a su mensaje.\nUso: .promote @usuario'),
            }, { quoted: message });
            return;
        }

        try {
            await sock.groupParticipantsUpdate(chatId, usersToPromote, 'promote');

            const tags = usersToPromote.map(jid => `@${jid.split('@')[0]}`).join(', ');

            await sock.sendMessage(chatId, {
                text: reply(`Usuario(s) promovido(s) a admin: ${tags}`),
                mentions: usersToPromote,
            }, { quoted: message });
        } catch (err) {
            await sock.sendMessage(chatId, {
                text: reply(`Error al promover: ${err.message}`),
            }, { quoted: message });
        }
    },
};
