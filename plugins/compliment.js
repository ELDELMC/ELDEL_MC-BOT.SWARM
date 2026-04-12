import { reply } from '../core/Formatter.js';

/**
 * .compliment - Random compliment
 * Envía un piropo aleatorio
 */

export default {
    command: 'compliment',
    aliases: ['piropo', 'halagos', 'cumplido'],
    category: 'fun',
    description: 'Envía un piropo aleatorio',
    usage: '.compliment',
    cooldown: 3000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        
        const compliments = [
            '✨ ¡Tienes una sonrisa hermosa!',
            '🌟 ¡Tu energía es contagiosa!',
            '💫 ¡Eres muy creativo!',
            '🎨 ¡Tienes excelente gusto!',
            '💪 ¡Eres muy fuerte y resiliente!',
            '🧠 ¡Eres inteligente y genial!',
            '❤️ ¡Tu amabilidad es inspiradora!',
            '🌈 ¡Eres una persona especial!',
            '✨ ¡Tu presencia ilumina el lugar!',
            '🎭 ¡Tienes carisma natural!',
            '👑 ¡Mereces lo mejor!',
            '🎯 ¡Tienes metas claras y admirable!',
            '🌺 ¡Tu carácter es ejemplar!',
            '💎 ¡Eres único y valioso!',
            '🚀 ¡Vas a lograr grandes cosas!'
        ];
        
        const compliment = compliments[Math.floor(Math.random() * compliments.length)];
        
        await sock.sendMessage(chatId, {
            text: reply(compliment)
        }, { quoted: message });
    }
};
