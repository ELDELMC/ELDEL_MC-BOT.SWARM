import { reply } from '../core/Formatter.js';

/**
 * .insult - Random insult
 * Envía un insulto "amistoso" aleatorio
 */

export default {
    command: 'insult',
    aliases: ['burla', 'insulto', 'mofar'],
    category: 'fun',
    description: 'Envía una burla "amistosa"',
    usage: '.insult',
    cooldown: 3000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        
        const insults = [
            '😂 ¡Eres más raro que zapato de tres pies!',
            '🤪 ¡Tu chiste fue tan malo que hasta los árboles lloraron!',
            '😜 ¡Tienes el sentido del humor de una piedra!',
            '🙃 ¡Eres tan confuso que hasta te piensas dos veces!',
            '😅 ¡Tu cocina es para darle un premio... de caridad!',
            '😆 ¡Si fueras un videojuego, serías en modo difícil!',
            '🤣 ¡Tu idea de gastar dinero es comprarte sentido común!',
            '😂 ¡Eres más lento que conexión de internet en campo!',
            '😝 ¡Tu vida es un reality show... de horror!',
            '🙈 ¡Eres tan dramático que hasta las telenovelas te envidian!',
            '😏 ¡Tu suerte es tan mala que hasta la basura te rechaza!',
            '😒 ¡Eres tan olvidadizo que ya olvidaste con quién hablas!',
            '🤐 ¡Tu silencio es mejor argumento que tu palabra!',
            '😐 ¡Tienes toda la elegancia de un elefante en una tienda!',
            '😑 ¡Eres tan único que hasta la naturaleza te copió mala!',
        ];
        
        const insult = insults[Math.floor(Math.random() * insults.length)];
        
        await sock.sendMessage(chatId, {
            text: reply(insult)
        }, { quoted: message });
    }
};
