import { header, toMono, botTag, DECO } from '../core/Formatter.js';
import sessionManager from '../core/SessionManager.js';
import loadBalancer from '../core/LoadBalancer.js';
import deduplicator from '../core/Deduplicator.js';
import config from '../config.js';

export default {
    command: 'info',
    aliases: ['estado', 'status', 'botinfo'],
    category: 'general',
    description: 'Informacion del bot y sesiones activas',
    usage: '.info',
    cooldown: 5000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;

        const uptimeSeconds = Math.floor(process.uptime());
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = uptimeSeconds % 60;
        const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

        const memMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
        const sessions = sessionManager.getStatus();
        const lbStats = loadBalancer.getStats();
        const dedupStats = deduplicator.stats();

        let msg = '';
        msg += header('INFO DEL BOT') + '\n\n';

        msg += `  ${DECO.diamond} ${toMono('Bot')}: ${botTag()}\n`;
        msg += `  ${DECO.diamond} ${toMono('Uptime')}: ${toMono(uptimeStr)}\n`;
        msg += `  ${DECO.diamond} ${toMono('RAM')}: ${toMono(memMB + ' MB')}\n`;
        msg += `  ${DECO.diamond} ${toMono('Sesion actual')}: ${toMono('S' + context.sessionIndex)}\n`;
        msg += `  ${DECO.diamond} ${toMono('Prefijos')}: ${toMono(config.prefixes.join('  '))}\n\n`;

        msg += `${DECO.star}${DECO.line.repeat(5)} ${toMono('SESIONES')} ${DECO.line.repeat(5)}${DECO.star}\n`;
        for (const s of sessions) {
            const status = s.connected ? toMono('ONLINE') : toMono('OFFLINE');
            const icon = s.connected ? '🟢' : '🔴';
            const tasks = lbStats[s.session]?.tasks || 0;
            msg += `  ${icon} ${toMono(s.session)}: ${status} | ${toMono('Tel')}: ${toMono(s.phone)} | ${toMono('Tareas')}: ${toMono(String(tasks))}\n`;
        }

        msg += `\n  ${DECO.diamond} ${toMono('Mensajes en cache')}: ${toMono(String(dedupStats.active))}\n`;
        msg += `  ${DECO.diamond} ${toMono('TTL dedup')}: ${toMono(dedupStats.ttlSeconds + 's')}\n`;

        msg += `\n${DECO.line.repeat(3)} ${botTag()} ${DECO.line.repeat(3)}`;

        await sock.sendMessage(chatId, { text: msg }, { quoted: message });
    },
};
