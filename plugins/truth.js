import { reply } from '../core/Formatter.js';

/**
 * .truth - Truth question
 * Proporciona una pregunta de verdad para juegos
 */

export default {
    command: 'truth',
    aliases: ['verdad', 'interrogante'],
    category: 'games',
    description: 'Proporciona una pregunta de verdad',
    usage: '.truth',
    cooldown: 3000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        
        const truths = [
            '🤔 ¿Cuál es tu mayor miedo?',
            '💭 ¿Qué es lo que más te arrepientes?',
            '😳 ¿Alguna vez has dicho una mentira para impresionar?',
            '❤️ ¿A quién amas más en el mundo?',
            '🎭 ¿Cuál es tu peor hábito?',
            '🌙 ¿Qué haces cuando nadie te ve?',
            '😅 ¿Cuál es tu secreto más embarazoso?',
            '🎪 ¿Qué es lo más aterrador que has hecho?',
            '💔 ¿Alguna vez has fue infiel a un amigo?',
            '🎯 ¿Cuál es tu sueño más grande?',
            '😤 ¿Quién es la persona que más te molesta?',
            '🧐 ¿Qué cosa no confesarías nunca?',
            '👁️ ¿A quién has espiado en tu vida?',
            '🤐 ¿Cuál es tu verdad más oscura?',
            '📖 ¿Qué le dirías al tú del pasado?',
        ];
        
        const truth = truths[Math.floor(Math.random() * truths.length)];
        
        await sock.sendMessage(chatId, {
            text: reply(truth)
        }, { quoted: message });
    }
};
