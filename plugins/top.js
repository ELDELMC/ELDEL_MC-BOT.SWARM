import { reply } from '../core/Formatter.js';
import activityTracker from '../core/ActivityTracker.js';

/**
 * ─── TOP COMMAND ───
 * Shows rankings for group members, specifically message activity.
 */

export default {
    command: 'top',
    aliases: ['ranking'],
    category: 'stats',
    description: 'Muestra los miembros más activos del grupo',
    usage: '.top activos',
    groupOnly: true,
    cooldown: 5000,

    async handler(sock, message, args, context) {
        const { chatId } = context;

        // Default to 'activos' if no sub-command is provided
        const subCommand = (args[0] || 'activos').toLowerCase();

        if (subCommand === 'activos') {
            const topMembers = activityTracker.getTop(chatId, 10);

            if (topMembers.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: reply('❌ Aún no hay suficiente actividad registrada en este grupo para mostrar un top.'),
                }, { quoted: message });
            }

            let responseText = `📊 *RANKING DE ACTIVIDAD EN EL GRUPO* 📊\n`;
            responseText += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            topMembers.forEach((user, index) => {
                const rank = index + 1;
                let badge = '';
                
                if (rank === 1) badge = '🥇';
                else if (rank === 2) badge = '🥈';
                else if (rank === 3) badge = '🥉';
                else badge = ` ${rank}.`;

                const name = user.name.length > 20 ? user.name.substring(0, 17) + '...' : user.name;
                responseText += `${badge} *${name}*\n    ╰─> 💬 Mensajes: _${user.count}_\n`;
            });

            responseText += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
            responseText += `_Usa .top activos para actualizar el ranking_`;

            await sock.sendMessage(chatId, {
                text: reply(responseText),
            }, { quoted: message });
            
        } else {
            // Future-proofing for other top metrics (e.g. .top bans, .top stickers)
            await sock.sendMessage(chatId, {
                text: reply('❌ Subcomando no reconocido.\n💡 Prueba con: *.top activos*'),
            }, { quoted: message });
        }
    },
};
