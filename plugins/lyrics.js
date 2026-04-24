import axios from 'axios';

export default {
    command: 'lyrics',
    aliases: ['cancion', 'letra', 'song'],
    category: 'fun',
    description: 'Obtiene letras de canciones',
    usage: '.lyrics Shape of You',
    cooldown: 5000,
    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        const song = args.join(' ');
        
        if (!song) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ *Uso: .lyrics [canción]*'
            }, { quoted: message });
        }

        try {
            const response = await axios.get(
                `https://api.lyrics.ovh/v1/search/${song}`,
                { timeout: 5000 }
            );
            
            const tracks = response.data?.data || [];
            if (tracks.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: `❌ Canción no encontrada`
                }, { quoted: message });
            }
            
            const track = tracks[0];
            const text = `🎵 *${track.title}*\nArtista: ${track.artist.name}`;
            
            await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error buscando letra`
            }, { quoted: message });
        }
    }
};
