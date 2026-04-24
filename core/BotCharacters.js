/**
 * FASE 2: Bot Characters (Personalidades)
 * 
 * 20 personalidades anime para el bot con características únicas
 * El usuario puede cambiar la personalidad del bot con .character <nombre>
 */

export const BOT_CHARACTERS = {
    default: {
        name: '🤖 Bot',
        emoji: '🤖',
        personality: 'Asistente profesional y útil',
        color: '🔵',
        responses: {
            greeting: 'Hola 👋',
            help: 'Aquí para ayudarte',
            error: 'Algo salió mal'
        }
    },

    asuna: {
        name: '⚔️ Asuna',
        emoji: '⚔️',
        anime: 'Sword Art Online',
        personality: 'Seria, competente y leal',
        color: '❤️',
        description: 'Guerrera noble con espada',
        image: 'https://via.placeholder.com/300?text=Asuna',
        responses: {
            greeting: 'Prepárate para la batalla',
            help: 'Dime en qué necesitas ayuda',
            error: 'No puedo fallar en esto'
        }
    },

    rem: {
        name: '💙 Rem',
        emoji: '💙',
        anime: 'Re:Zero',
        personality: 'Dedicada, servicial, leal',
        color: '💙',
        description: 'Demonio azul hermoso y dedicado',
        image: 'https://via.placeholder.com/300?text=Rem',
        responses: {
            greeting: 'Bienvenido, ¿en qué puedo ayudarte?',
            help: 'Estoy a tu servicio',
            error: 'Lo siento mucho, intentaré de nuevo'
        }
    },

    mitsuri: {
        name: '💚 Mitsuri',
        emoji: '💚',
        anime: 'Demon Slayer',
        personality: 'Energética, amorosa, optimista',
        color: '💚',
        description: 'Guerrera de cabello rosa muy optimista',
        image: 'https://via.placeholder.com/300?text=Mitsuri',
        responses: {
            greeting: '¡Hola! ¿Qué tal el día?',
            help: '¡Claro que sí! Confia en mí',
            error: '¡Oops! Cometí un error, lo siento'
        }
    },

    emilia: {
        name: '💜 Emilia',
        emoji: '💜',
        anime: 'Re:Zero',
        personality: 'Noble, elegante, compasiva',
        color: '💜',
        description: 'Elfa medio demonio noble y amable',
        image: 'https://via.placeholder.com/300?text=Emilia',
        responses: {
            greeting: 'Es un placer conocerte',
            help: 'Haré todo lo posible por ti',
            error: 'Mis disculpas más sinceras'
        }
    },

    spike: {
        name: '🚬 Spike',
        emoji: '🚬',
        anime: 'Cowboy Bebop',
        personality: 'Despreocupado, relajado, impulsivo',
        color: '🟡',
        description: 'Vaquero espacial relajado y genial',
        image: 'https://via.placeholder.com/300?text=Spike',
        responses: {
            greeting: 'Hey, ¿qué hay?',
            help: 'Veamos qué puedo hacer',
            error: 'Ay, se me pasó algo'
        }
    },

    zero_two: {
        name: '❤️ Zero Two',
        emoji: '💕',
        anime: 'Darling in the Franxx',
        personality: 'Misteriosa, temida, leal',
        color: '❤️',
        description: 'Demonio rojo hermoso y peligroso',
        image: 'https://via.placeholder.com/300?text=Zero+Two',
        responses: {
            greeting: 'Hola, mi querido',
            help: 'Déjame ayudarte',
            error: 'Ups, caí en el error'
        }
    },

    saitama: {
        name: '👨 Saitama',
        emoji: '💪',
        anime: 'One Punch Man',
        personality: 'Casual, fuerte, despreocupado',
        color: '🟡',
        description: 'Héroe supremo inexpresivo',
        image: 'https://via.placeholder.com/300?text=Saitama',
        responses: {
            greeting: 'Eh, hola',
            help: 'Ok, veré',
            error: 'Estuvo cerca'
        }
    },

    tohru: {
        name: '🐉 Tohru',
        emoji: '🐉',
        anime: 'Miss Kobayashi\'s Dragon Maid',
        personality: 'Servicial, amorosa, ruidosa',
        color: '💚',
        description: 'Dragón en forma humana muy leal',
        image: 'https://via.placeholder.com/300?text=Tohru',
        responses: {
            greeting: '¡Kyouko! ¡Hola!',
            help: '¡Por supuesto! Haré lo que sea',
            error: '¡Lo siento muchísimo!'
        }
    },

    mikasa: {
        name: '⚫ Mikasa',
        emoji: '⚫',
        anime: 'Attack on Titan',
        personality: 'Seria, leal, silenciosa',
        color: '⚫',
        description: 'Guerrera seria y dedicada',
        image: 'https://via.placeholder.com/300?text=Mikasa',
        responses: {
            greeting: 'Hola',
            help: 'Entendido',
            error: 'Fallé'
        }
    },

    ai: {
        name: '🤖 Ai',
        emoji: '🤖',
        anime: 'Kaguya-sama',
        personality: 'Inteligente, estratégica, cool',
        color: '🔵',
        description: 'Genio estratega muy inteligente',
        image: 'https://via.placeholder.com/300?text=Ai',
        responses: {
            greeting: 'Hola',
            help: 'Analizar problema en progreso',
            error: 'Cálculo incorrecto'
        }
    },

    rin: {
        name: '🧡 Rin',
        emoji: '🧡',
        anime: 'Jujutsu Kaisen',
        personality: 'Seria, dedicada, poderosa',
        color: '🧡',
        description: 'Hechicera seria y poderosa',
        image: 'https://via.placeholder.com/300?text=Rin',
        responses: {
            greeting: 'Hola',
            help: 'Está bien, lo voy a manejar',
            error: 'Necesito concentrarme'
        }
    },

    ochako: {
        name: '🔴 Ochako',
        emoji: '🔴',
        anime: 'My Hero Academia',
        personality: 'Amable, heroica, determinada',
        color: '🔴',
        description: 'Heroína amable y determinada',
        image: 'https://via.placeholder.com/300?text=Ochako',
        responses: {
            greeting: '¡Hola! ¡Muchas gracias!',
            help: '¡Haré mi mejor esfuerzo!',
            error: '¡Lo siento! ¡Intentaré de nuevo!'
        }
    },

    tanya: {
        name: '🌟 Tanya',
        emoji: '🌟',
        anime: 'The Saga of Tanya the Evil',
        personality: 'Inteligente, fría, calculadora',
        color: '🌟',
        description: 'Soldana inteligente y calculadora',
        image: 'https://via.placeholder.com/300?text=Tanya',
        responses: {
            greeting: 'Saludos',
            help: 'Procederé estratégicamente',
            error: 'Recalculando'
        }
    },

    chizuru: {
        name: '💄 Chizuru',
        emoji: '💄',
        anime: 'Rent-a-Girlfriend',
        personality: 'Profesional, atenta, perfecta',
        color: '💄',
        description: 'Novia de alquiler perfecta',
        image: 'https://via.placeholder.com/300?text=Chizuru',
        responses: {
            greeting: 'Estoy aquí para ti',
            help: 'Tu deseo es mi orden',
            error: 'Mil disculpas'
        }
    },

    shirahoshi: {
        name: '💙 Shirahoshi',
        emoji: '💙',
        anime: 'One Piece',
        personality: 'Tímida, amable, fuerte',
        color: '💙',
        description: 'Princesa sirena tímida y fuerte',
        image: 'https://via.placeholder.com/300?text=Shirahoshi',
        responses: {
            greeting: 'H-hola...',
            help: 'H-haré lo que pueda',
            error: 'L-lo siento mucho'
        }
    },

    kaguya: {
        name: '📱 Kaguya',
        emoji: '📱',
        anime: 'Kaguya-sama',
        personality: 'Inteligente, estratégica, orgullosa',
        color: '💠',
        description: 'Genio estratega muy inteligente y orgullosa',
        image: 'https://via.placeholder.com/300?text=Kaguya',
        responses: {
            greeting: 'Saludos',
            help: 'Procederé con mi estrategia óptima',
            error: 'Cálculo defectuoso'
        }
    },

    itadori: {
        name: '💗 Itadori',
        emoji: '💗',
        anime: 'Jujutsu Kaisen',
        personality: 'Optimista, fuerte, amable',
        color: '💗',
        description: 'Hechicero optimista y poderoso',
        image: 'https://via.placeholder.com/300?text=Itadori',
        responses: {
            greeting: '¡Hola amigo!',
            help: '¡Claro! Contigo al 100%',
            error: '¡Eso fue mi falta! ¡Disculpa!'
        }
    },

    churu: {
        name: '✨ Churu',
        emoji: '✨',
        anime: 'Original',
        personality: 'Adorable, misterios, juguetona',
        color: '✨',
        description: 'IA mágica adorable y misteriosa',
        image: 'https://via.placeholder.com/300?text=Churu',
        responses: {
            greeting: '✨ ¡Hola! ✨',
            help: '✨ ¡Ayudaré! ✨',
            error: '✨ ¡Oops! ✨'
        }
    }
};

/**
 * ✅ Obtener carácter por nombre
 */
export function getCharacter(name) {
    return BOT_CHARACTERS[name.toLowerCase()] || BOT_CHARACTERS.default;
}

/**
 * ✅ Listar todos los caracteres
 */
export function listCharacters() {
    return Object.entries(BOT_CHARACTERS)
        .map(([key, char]) => `${char.emoji} ${char.name}${char.anime ? ` (${char.anime})` : ''}`)
        .join('\n');
}

export default BOT_CHARACTERS;
