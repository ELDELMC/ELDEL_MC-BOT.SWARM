import axios from 'axios';

export default {
    command: 'pokedex',
    aliases: ['pokemon', 'poke', 'dex'],
    category: 'fun',
    description: 'Información de Pokémon',
    usage: '.pokedex pikachu',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const pokemon = args.join(' ').toLowerCase();
        
        if (!pokemon) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Uso: .pokedex [pokemon]*'
            }, { quoted: message });
        }

        try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
            const data = response.data;
            
            const text = `🔴 *${data.name.toUpperCase()}*\n\n` +
                        `Altura: ${data.height / 10}m\n` +
                        `Peso: ${data.weight / 10}kg\n` +
                        `Tipo: ${data.types.map(t => t.type.name).join(', ')}`;
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Pokémon no encontrado`
            }, { quoted: message });
        }
    }
};
