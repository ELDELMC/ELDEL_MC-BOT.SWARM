import commandHandler from '../core/CommandHandler.js';
import { header, subheader, bullet, botTag, toMono, DECO } from '../core/Formatter.js';
import config from '../config.js';

export default {
    command: 'menu',
    aliases: ['help', 'ayuda', 'comandos'],
    category: 'general',
    description: 'Mostrar todos los comandos disponibles',
    usage: '.menu',
    cooldown: 5000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        const prefix = context.prefix || config.prefix;

        const byCategory = commandHandler.getByCategory();

        let msg = '';
        msg += header('MENU') + '\n';
        msg += `  ${toMono('Bot')}: ${botTag()}\n`;
        msg += `  ${toMono('Sesion')}: ${toMono('S' + context.sessionIndex)}\n`;
        msg += `  ${toMono('Prefijos')}: ${toMono(config.prefixes.join('  '))}\n`;
        msg += `  ${toMono('Comandos')}: ${toMono(String(commandHandler.commands.size))}\n\n`;

        // Category display order
        const categoryOrder = ['general', 'admin', 'moderation', 'owner', 'misc'];
        const categoryLabels = {
            general: 'General',
            admin: 'Administracion',
            moderation: 'Moderacion',
            owner: 'Owner',
            misc: 'Otros',
        };

        // Sort categories
        const sortedCats = [...byCategory.keys()].sort((a, b) => {
            const ia = categoryOrder.indexOf(a);
            const ib = categoryOrder.indexOf(b);
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });

        for (const cat of sortedCats) {
            const cmds = byCategory.get(cat);
            if (!cmds || cmds.length === 0) continue;

            const label = categoryLabels[cat] || cat;
            msg += subheader(label) + '\n';

            for (const cmd of cmds) {
                const aliasStr = cmd.aliases?.length
                    ? ` (${cmd.aliases.join(', ')})`
                    : '';
                msg += bullet(`${prefix}${cmd.command}${aliasStr} - ${cmd.description || ''}`) + '\n';
            }
            msg += '\n';
        }

        msg += `${DECO.line.repeat(3)} ${botTag()} ${DECO.line.repeat(3)}`;

        await sock.sendMessage(chatId, { text: msg }, { quoted: message });
    },
};
