import { reply } from '../core/Formatter.js';

/**
 * .eightball / .bola8 - Magic 8 Ball
 * Responde preguntas con respuestas aleatorias estilo "bola 8 mágica"
 */

export default {
    command: 'eightball',
    aliases: ['bola8', '8ball', 'magicball'],
    category: 'games',
    description: 'Bola 8 mágica - Responde preguntas',
    usage: '.eightball <pregunta>',
    cooldown: 2000,

    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        
        const responses = [
            // Afirmativas
            'Sí, definitivamente',
            'Es muy probable',
            'Absolutamente sí',
            'Claro que sí',
            'Sin duda alguna',
            'Muy pronto, sí',
            'Puede confiar en ello',
            
            // Dudosas
            'Pregunta en otro momento',
            'Mejor no opinar ahora',
            'Concentra y pregunta de nuevo',
            'No puedo predecir ahora',
            'Pideme que no responda ahora',
            
            // Negativas
            'No, definitivamente no',
            'Mis fuentes dicen que no',
            'El pronóstico no es bueno',
            'Muy dudoso',
            'No cuentes con ello',
            'Casi seguro que no'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        await sock.sendMessage(chatId, {
            text: reply(`🎱 *La bola 8 dice:*\n\n${randomResponse}`)
        }, { quoted: message });
    }
};
