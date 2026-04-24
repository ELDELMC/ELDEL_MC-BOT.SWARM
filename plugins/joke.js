import axios from 'axios';
import { reply } from '../core/Formatter.js';

/**
 * .joke - Get a random joke from an API
 * Obtiene un chiste aleatorio de una API pública
 */

export default {
    command: 'joke',
    aliases: ['jokes', 'funny', 'chiste'],
    category: 'fun',
    description: 'Obtiene un chiste aleatorio',
    usage: '.joke',
    cooldown: 5000,

    async handler(sock, message, _args, context) {
        const chatId = context.chatId;
        
        try {
            const response = await axios.get('https://icanhazdadjoke.com/', {
                headers: { Accept: 'application/json' },
                timeout: 5000
            });
            
            const joke = response.data.joke;
            
            await sock.sendMessage(chatId, {
                text: reply(`😂 ${joke}`)
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: reply('❌ No pude obtener un chiste ahora. Intenta más tarde.')
            }, { quoted: message });
        }
    }
};
