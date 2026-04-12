/**
 * Configuración Global Segura
 * 
 * Define todos los límites y restricciones para evitar baneos de WhatsApp
 */

export const CONFIG = {
    /**
     * 🛡️ LÍMITES DE RATE (Anti-ban)
     */
    rateLimits: {
        // Descargas
        download: {
            perGroupPerHour: 10,      // Máx descargas por grupo por hora
            perUserPerHour: 20,       // Máx descargas por usuario por hora
            cooldownSeconds: 30       // Espera entre descargas
        },

        // Respuestas de IA
        ai: {
            perGroupPerHour: 50,      // Máx respuestas IA por grupo por hora
            perUserPerHour: 20,       // Máx respuestas IA por usuario por hora
            cooldownSeconds: 5        // Espera entre respuestas
        },

        // Comandos generales
        commands: {
            perGroupPerHour: 100,     // Máx comandos por grupo por hora
            perUserPerHour: 50,       // Máx comandos por usuario por hora
            cooldownSeconds: 1        // Espera entre comandos
        },

        // Mensajes de bot
        messages: {
            perGroupPerMinute: 10,    // Máx mensajes enviados por el bot por minuto
            floodThreshold: 5         // Si más de 5 mensajes en 10 seg = STOP
        },

        // Reacciones y stickers
        reactions: {
            perUserPerMinute: 3,      // Máx reacciones por usuario por minuto
            cooldownSeconds: 2
        }
    },

    /**
     * 🚫 CARACTERÍSTICAS PELIGROSAS (DESHABILITADAS)
     */
    dangerousFeatures: {
        massInvites: false,          // ❌ Invitaciones masivas a grupos
        codeExecution: false,        // ❌ .exec / .run (RCE)
        massDownloads: false,        // ❌ Downloader automático/sin límites
        autoReplyAll: false,         // ❌ Responder TODOS los mensajes
        spamMessaging: false,        // ❌ Envíar mensajes masivos
        autoGroupJoin: false         // ❌ Unirse automáticamente a grupos
    },

    /**
     * ✅ CARACTERÍSTICAS SEGURAS (HABILITADAS)
     */
    safeFeatures: {
        downloader: true,            // ✅ Descarga por comando + límites
        aiResponses: true,           // ✅ IA solo a @menciones
        stickers: true,              // ✅ Procesamiento de stickers
        reactions: true,             // ✅ Reacciones a comandos
        moderation: true,            // ✅ Admin tools estándar
        welcome: true,               // ✅ Bienvenida a nuevos miembros
        imageProcessing: true,       // ✅ Blur, crop, etc.
        webSearch: true              // ✅ Búsquedas en internet
    },

    /**
     * 🔌 APIs Y SERVICIOS EXTERNOS
     */
    apis: {
        openai: {
            enabled: !!process.env.OPENAI_API_KEY,
            model: 'gpt-4-turbo',
            maxTokens: 500,
            timeout: 15000            // 15 segundos
        },

        anthropic: {
            enabled: !!process.env.ANTHROPIC_API_KEY,
            model: 'claude-3-opus-20240229',
            maxTokens: 500,
            timeout: 15000
        },

        google: {
            enabled: !!process.env.GOOGLE_API_KEY,
            model: 'gemini-pro',
            maxTokens: 500,
            timeout: 15000
        },

        mongodb: {
            enabled: !!process.env.MONGO_URI,
            cacheTTL: {
                user: 300,            // 5 minutos
                group: 600,           // 10 minutos
                download: 2592000     // 30 días (auto-delete)
            }
        }
    },

    /**
     * 📊 MONITOREO Y LOGGING
     */
    monitoring: {
        enableDetailedLogs: true,
        logLevel: 'info',             // 'debug', 'info', 'warn', 'error'
        saveErrorLogs: true,
        alertThreshold: {
            rateLimitExceeds: 5,      // Alertar si se excede +5 veces
            apiErrors: 10,            // Alertar si +10 errores de API
            mongoErrors: 5            // Alertar si +5 errores MongoDB
        }
    },

    /**
     * 🌍 CONFIGURACIÓN POR GRUPO (PERSONALIZABLE)
     */
    groupDefaults: {
        language: 'es',
        timezone: 'America/Mexico_City',
        commandPrefix: '.',
        aiEnabled: true,
        downloaderEnabled: true,
        welcomeEnabled: true,
        antiSpamEnabled: true,
        antiLinkEnabled: false,       // Por defecto OFF (riesgo alto)
        antiDeleteEnabled: false,     // Por defecto OFF (riesgo alto)
        moderationLevel: 'medium'     // 'low', 'medium', 'strict'
    },

    /**
     * 🎯 ESTRATEGIA DE FALLBACK
     * Si una IA falla, intentar siguiente
     */
    aiStrategy: {
        primaryAI: 'openai',
        secondaryAI: 'anthropic',
        tertiaryAI: 'google',
        fallbackResponse: '❌ Las IAs no responden. Intenta en unos minutos.'
    },

    /**
     * ⏰ TIMEOUTS Y REINTENTOS
     */
    timeouts: {
        apiRequest: 15000,            // 15 segundos
        databaseQuery: 10000,         // 10 segundos
        fileDownload: 30000,          // 30 segundos
        messageProcessing: 5000       // 5 segundos
    },

    /**
     * 📁 DIRECTORIOS TEMPORALES
     */
    directories: {
        temp: './temp',
        logs: './logs',
        cache: './cache',
        stickers: './temp/stickers',
        downloads: './temp/downloads'
    },

    /**
     * 🔐 RESTRICCIONES DE SEGURIDAD ADICIONALES
     */
    security: {
        maxMessageLength: 4096,       // Máx caracteres por mensaje
        maxFileSizeDownload: 100,     // MB
        blockSuspiciousPatterns: true,
        validateUserPermissions: true,
        encryptSensitiveData: true
    },

    /**
     * 📋 WEBHOOKS Y NOTIFICACIONES
     */
    webhooks: {
        enabled: !!process.env.WEBHOOK_URL,
        url: process.env.WEBHOOK_URL,
        events: ['error', 'rateLimit', 'apiFailure']
    }
};

/**
 * Helper: Obtener límite de rate por grupo
 */
export function getRateLimit(type, groupId) {
    const limit = CONFIG.rateLimits[type];
    if (!limit) return null;

    return {
        perHour: limit.perGroupPerHour,
        cooldownSeconds: limit.cooldownSeconds,
        groupId
    };
}

/**
 * Helper: Checar si feature está habilitada
 */
export function isFeatureEnabled(featureName) {
    return CONFIG.safeFeatures[featureName] === true;
}

/**
 * Helper: Checar si feature peligrosa está deshabilitada
 */
export function isDangerousFeatureDisabled(featureName) {
    return CONFIG.dangerousFeatures[featureName] === false;
}

export default CONFIG;
