import { reply } from '../core/Formatter.js';

/**
 * .bye / .goodbye - Say goodbye
 * Envía un mensaje de despedida
 */

export default {
    command: 'bye',
    aliases: ['adiós', 'despedida', 'chao'],
    category: 'fun',
    description: 'Envía un mensaje de despedida',
    usage: '.bye',
    cooldown: 3000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        
        const goodbyes = [
            '👋 ¡Adiós! Que vuelvas pronto.',
            '😬 ¡Hasta luego, alligator!',
            '🚀 ¡Nos vemos en el espacio!',
            '💫 ¡Que tengas un excelente día!',
            '🌙 ¡Duerme bien, amigo!',
            '⭐ ¡Vuelve cuando quieras!',
            '🎉 ¡Que disfrutes el resto del día!',
            '✨ ¡Que la suerte te acompañe!'
        ];
        
        const bye = goodbyes[Math.floor(Math.random() * goodbyes.length)];
        
        await sock.sendMessage(chatId, {
            text: reply(bye)
        }, { quoted: message });
    }
};
