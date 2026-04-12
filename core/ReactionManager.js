/**
 * FASE 2: Reaction Manager
 * 
 * 26 reacciones anime con Tenor API + imágenes locales
 * ✅ SEGURO: Comandos normales, sin límites técnicos necesarios
 */

import axios from 'axios';
import { log } from './Logger.js';

class ReactionManager {
    constructor() {
        this.tenorKey = process.env.TENOR_API_KEY;
        
        // 26 reacciones anime
        this.reactions = {
            hug: { emoji: '🤗', search: 'anime hug', desc: 'Abrazar' },
            kiss: { emoji: '💋', search: 'anime kiss', desc: 'Besar' },
            slap: { emoji: '👊', search: 'anime slap', desc: 'Golpear' },
            punch: { emoji: '✊', search: 'anime punch', desc: 'Puñetazo' },
            kick: { emoji: '🦵', search: 'anime kick', desc: 'Patada' },
            blush: { emoji: '😳', search: 'anime blush', desc: 'Sonrojarse' },
            cry: { emoji: '😭', search: 'anime cry', desc: 'Llorar' },
            laugh: { emoji: '😂', search: 'anime laugh', desc: 'Reír' },
            dance: { emoji: '💃', search: 'anime dance', desc: 'Bailar' },
            headpat: { emoji: '🤚', search: 'anime head pat', desc: 'Acariciar cabeza' },
            smile: { emoji: '😊', search: 'anime smile', desc: 'Sonreír' },
            wink: { emoji: '😉', search: 'anime wink', desc: 'Guiño' },
            angry: { emoji: '😠', search: 'anime angry', desc: 'Enojado' },
            sad: { emoji: '😢', search: 'anime sad', desc: 'Triste' },
            love: { emoji: '❤️', search: 'anime love', desc: 'Amor' },
            nervous: { emoji: '😰', search: 'anime nervous', desc: 'Nervioso' },
            think: { emoji: '🤔', search: 'anime thinking', desc: 'Pensar' },
            sweat: { emoji: '😅', search: 'anime sweat', desc: 'Sudor frío' },
            facepalm: { emoji: '🤦', search: 'anime facepalm', desc: 'Palmada en cara' },
            flex: { emoji: '💪', search: 'anime flex', desc: 'Flexionar' },
            confused: { emoji: '😕', search: 'anime confused', desc: 'Confundido' },
            shocked: { emoji: '😲', search: 'anime shocked', desc: 'Sorprendido' },
            bored: { emoji: '😐', search: 'anime bored', desc: 'Aburrido' },
            evil: { emoji: '😈', search: 'anime evil smile', desc: 'Sonrisa malvada' },
            shy: { emoji: '🙈', search: 'anime shy', desc: 'Tímido' },
            wave: { emoji: '👋', search: 'anime wave goodbye', desc: 'Adiós' }
        };
    }

    /**
     * ✅ Obtener GIF de Tenor API
     */
    async getTenorGif(searchTerm) {
        if (!this.tenorKey) {
            log('warn', 'TENOR_API_KEY not set, using fallback image');
            return null;
        }

        try {
            const response = await axios.get('https://api.tenor.com/v1/search', {
                params: {
                    q: searchTerm,
                    key: this.tenorKey,
                    limit: 1,
                    contentfilter: 'high' // Content-safe
                },
                timeout: 5000
            });

            if (response.data.results && response.data.results.length > 0) {
                return response.data.results[0].media_formats.gif.url;
            }
        } catch (err) {
            log('warn', `Tenor API error: ${err.message}`);
        }

        return null;
    }

    /**
     * ✅ Verificar si reacción existe
     */
    isValidReaction(reactionName) {
        return this.reactions.hasOwnProperty(reactionName.toLowerCase());
    }

    /**
     * ✅ Obtener lista de reacciones disponibles
     */
    listReactions() {
        const list = Object.entries(this.reactions)
            .map(([name, data]) => `${data.emoji} .${name} - ${data.desc}`)
            .join('\n');

        return `🎬 REACCIONES DISPONIBLES (26):\n\n${list}`;
    }

    /**
     * ✅ Ejecutar reacción
     */
    async executeReaction(reactionName, targetUser = null) {
        const reaction = this.reactions[reactionName.toLowerCase()];
        
        if (!reaction) {
            return {
                success: false,
                error: '❌ Reacción no válida. Usa .reacciones para ver lista.'
            };
        }

        // Intentar obtener GIF de Tenor
        const gifUrl = await this.getTenorGif(reaction.search);

        // Crear mensaje
        let message = `${reaction.emoji} *${reaction.desc}*`;
        if (targetUser) {
            message += ` @${targetUser}`;
        }

        return {
            success: true,
            emoji: reaction.emoji,
            desc: reaction.desc,
            message: message,
            gifUrl: gifUrl // Puede ser null
        };
    }
}

export default new ReactionManager();
