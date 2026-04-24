import { reply } from '../core/Formatter.js';

/**
 * .dare - Dare challenge
 * Proporciona un atrevimiento aleatorio
 */

export default {
    command: 'dare',
    aliases: ['reto', 'atrevimiento'],
    category: 'games',
    description: 'Proporciona un reto/atrevimiento',
    usage: '.dare',
    cooldown: 3000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        
        const dares = [
            '💪 Desafío: ¡Haz 10 flexiones ahora!',
            '🎤 Reto: ¡Canta una canción en voz alta!',
            '🕺 Desafío: ¡Baila como nadie te ve por 30 segundos!',
            '📱 Reto: ¡Cámbia tu foto de perfil con algo gracioso!',
            '😜 Desafío: ¡Pon una cara graciosa y toma una foto!',
            '🎨 Reto: ¡Dibuja algo con los ojos cerrados!',
            '🏃 Desafío: ¡Corre alrededor de tu casa una vez!',
            '🤪 Reto: ¡Habla como robot por 1 minuto!',
            '📸 Desafío: ¡Toma una selfie rara!',
            '🎭 Reto: ¡Actúa como si fueras un gato por 30 segundos!',
            '🌶️ Desafío: ¡Come algo picante!',
            '💨 Reto: ¡Aguanta la respiración 30 segundos!',
            '🎵 Desafío: ¡Canta en la ducha!',
            '🤸 Reto: ¡Haz un pino contra la pared!',
            '😴 Desafío: ¡Intenta no reír durante 1 minuto!',
        ];
        
        const dare = dares[Math.floor(Math.random() * dares.length)];
        
        await sock.sendMessage(chatId, {
            text: reply(dare)
        }, { quoted: message });
    }
};
