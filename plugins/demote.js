import { reply } from '../core/Formatter.js';

export default {
    command: 'demote',
    aliases: ['degradar', 'unadmin'],
    category: 'admin',
    description: 'Degradar a un administrador a miembro',
    usage: '.demote @usuario',
    groupOnly: true,
    adminOnly: true,
    cooldown: 3000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;

        let usersToDemote = [];
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentioned && mentioned.length > 0) {
            usersToDemote = mentioned;
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            usersToDemote = [message.message.extendedTextMessage.contextInfo.participant];
        }

        if (usersToDemote.length === 0) {
            await sock.sendMessage(chatId, {
                text: reply('Menciona al usuario o responde a su mensaje.\nUso: .demote @usuario'),
            }, { quoted: message });
            return;
        }

        try {
            await sock.groupParticipantsUpdate(chatId, usersToDemote, 'demote');

            const tags = usersToDemote.map(jid => `@${jid.split('@')[0]}`).join(', ');

            await sock.sendMessage(chatId, {
                text: reply(`Usuario(s) degradado(s): ${tags}`),
                mentions: usersToDemote,
            }, { quoted: message });
        } catch (err) {
            await sock.sendMessage(chatId, {
                text: reply(`Error al degradar: ${err.message}`),
            }, { quoted: message });
        }
    },
};
