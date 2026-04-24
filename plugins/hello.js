import { reply } from '../core/Formatter.js';

/**
 * .hello / .hi - Say hello
 * Envía un saludo
 */

export default {
    command: 'hello',
    aliases: ['hola', 'hi', 'saludo'],
    category: 'fun',
    description: 'Envía un saludo',
    usage: '.hello',
    cooldown: 2000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        
        const greetings = [
            '👋 ¡Hola! ¿Cómo estás?',
            '😊 ¡Hey! ¿Qué tal?',
            '🎉 ¡Holaaaa! ¡Bienvenido!',
            '✨ ¡Hola, hermoso día!',
            '🌟 ¡Saludos! ¿Qué hay de nuevo?',
            '💫 ¡Ey! ¿Cómo va todo?',
            '🎊 ¡Hola! Me alegra verte.',
            '👋 ¡Qué onda! ¿Cómo te va?'
        ];
        
        const hello = greetings[Math.floor(Math.random() * greetings.length)];
        
        await sock.sendMessage(chatId, {
            text: reply(hello)
        }, { quoted: message });
    }
};
