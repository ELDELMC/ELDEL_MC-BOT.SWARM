import chalk from 'chalk';
import config from '../config.js';

/**
 * ─── LOGGER ───
 * Clean, color-coded console logging with session tags.
 * Each session is identified by [S1], [S2], etc.
 */

const COLORS = {
    info:       chalk.blue,
    success:    chalk.green,
    warn:       chalk.yellow,
    error:      chalk.red,
    cmd:        chalk.cyan,
    debug:      chalk.gray,
    session:    chalk.magenta,
    balancer:   chalk.hex('#FF8C00'),
};

const ICONS = {
    info:       '💡',
    success:    '✅',
    warn:       '⚠️',
    error:      '❌',
    cmd:        '⚡',
    debug:      '🔍',
    session:    '🔗',
    balancer:   '⚖️',
};

function getTimestamp() {
    return new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: config.timeZone || 'America/Bogota',
    });
}

/**
 * Print a log line to the console.
 * @param {'info'|'success'|'warn'|'error'|'cmd'|'debug'|'session'|'balancer'} type
 * @param {string} message
 * @param {number|null} sessionIndex - Optional session number (1-based)
 */
export function log(type, message, sessionIndex = null) {
    const color = COLORS[type] || chalk.white;
    const icon  = ICONS[type]  || '•';
    const time  = chalk.gray(`[${getTimestamp()}]`);
    const tag   = sessionIndex !== null
        ? chalk.magenta.bold(` [S${sessionIndex}]`)
        : '';
    console.log(`${time}${tag} ${icon} ${color(message)}`);
}

/**
 * Print a formatted incoming message to the console.
 */
export function logMessage({ sessionIndex, fromMe, senderName, senderPhone, groupName, messageType, messageText, isCommand }) {
    const time = chalk.gray(`[${getTimestamp()}]`);
    const tag  = chalk.magenta.bold(`[S${sessionIndex}]`);
    const typeLabel = chalk.hex('#00D9FF').bold(messageType.toUpperCase());

    console.log(chalk.hex('#00D9FF').bold('╭──────────────────────────────────'));
    console.log(`${chalk.hex('#00D9FF').bold('│')} ${tag} ${time} ${typeLabel}`);

    const senderDisplay = senderName && senderName !== senderPhone
        ? `${senderName} (${senderPhone})`
        : senderPhone;

    console.log(`${chalk.hex('#00D9FF').bold('│')} ${
        fromMe ? chalk.green.bold('📤 ME') : chalk.yellow.bold('📨 FROM')
    } ${chalk.white.bold(senderDisplay)}`);

    if (groupName) {
        console.log(`${chalk.hex('#00D9FF').bold('│')} ${chalk.blue.bold('👥 GROUP')} ${chalk.white.bold(groupName)}`);
    } else {
        console.log(`${chalk.hex('#00D9FF').bold('│')} ${chalk.magenta.bold('💬 PRIVATE')}`);
    }

    if (messageText) {
        const display = messageText.length > 120
            ? messageText.substring(0, 120) + '...'
            : messageText;
        console.log(`${chalk.hex('#00D9FF').bold('│')} ${chalk.hex('#FFD700').bold('💭')} ${
            isCommand ? chalk.greenBright.bold(display) : chalk.white(display)
        }`);
    }

    console.log(chalk.hex('#00D9FF').bold('╰──────────────────────────────────'));
}

/**
 * Print swarm startup banner.
 */
export function logBanner(sessionCount) {
    console.log();
    console.log(chalk.hex('#00D9FF').bold('  ╔══════════════════════════════════════╗'));
    console.log(chalk.hex('#00D9FF').bold('  ║') + chalk.white.bold('   ⸙ 𝙹𝚄𝙰𝙽𝙲𝙷𝙾𝚃𝙴-𝚂𝚆𝙰𝚁𝙼 ⸙              ') + chalk.hex('#00D9FF').bold('║'));
    console.log(chalk.hex('#00D9FF').bold('  ║') + chalk.gray(`   Multi-Session WhatsApp Bot          `) + chalk.hex('#00D9FF').bold('║'));
    console.log(chalk.hex('#00D9FF').bold('  ║') + chalk.gray(`   Sessions: ${sessionCount} | Bot: ⸙𝙴𝙻𝙳𝙴𝙻_𝙼𝙲-𝙱𝙾𝚃⸙  `) + chalk.hex('#00D9FF').bold('║'));
    console.log(chalk.hex('#00D9FF').bold('  ╚══════════════════════════════════════╝'));
    console.log();
}
