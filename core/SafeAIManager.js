/**
 * AI Manager Seguro
 * 
 * ✅ SEGURO: Solo responde a @menciones y comandos explícitos
 * ❌ Prohibido: Responder todos los mensajes, flood de respuestas
 * 
 * Soporta: ChatGPT, Claude 3, Gemini Pro (con fallback automático)
 */

import axios from 'axios';
import { log } from './Logger.js';
import MongoDBCore from './MongoDB_Core.js';
import { AIInteraction } from './models/MongoDB_Schemas.js';

class SafeAIManager {
    constructor() {
        // Rate limiting: groupJid → { count, lastReset }
        this.responseLimits = new Map();
        
        // API keys (desde env)
        this.apis = {
            openai: {
                key: process.env.OPENAI_API_KEY,
                baseURL: 'https://api.openai.com/v1',
                model: 'gpt-4-turbo'
            },
            anthropic: {
                key: process.env.ANTHROPIC_API_KEY,
                baseURL: 'https://api.anthropic.com/v1',
                model: 'claude-3-opus-20240229'
            },
            google: {
                key: process.env.GOOGLE_API_KEY,
                baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
                model: 'gemini-pro'
            }
        };

        // Rate limits
        this.limits = {
            responsesPerHourPerGroup: 50,
            responsesPerHourPerUser: 20,
            cooldownSeconds: 5
        };
    }

    /**
     * ✅ Checar rate limits
     * Máx 50 respuestas por grupo por hora
     */
    checkRateLimit(groupJid) {
        const now = Date.now();
        const hourAgo = now - 3600000;

        let limitData = this.responseLimits.get(groupJid);
        
        if (!limitData) {
            limitData = { count: 0, firstResponse: now };
            this.responseLimits.set(groupJid, limitData);
            return { allowed: true };
        }

        // Reset si pasó 1 hora
        if (now - limitData.firstResponse > 3600000) {
            limitData = { count: 0, firstResponse: now };
            this.responseLimits.set(groupJid, limitData);
            return { allowed: true };
        }

        // Checar límite
        if (limitData.count >= this.limits.responsesPerHourPerGroup) {
            const timeLeft = Math.ceil((limitData.firstResponse + 3600000 - now) / 60000);
            return {
                allowed: false,
                message: `⏳ Límite de IA por hora alcanzado. Intenta en ${timeLeft} minutos.`
            };
        }

        return { allowed: true };
    }

    /**
     * ✅ Llamar ChatGPT
     */
    async callChatGPT(message) {
        try {
            const response = await axios.post(
                `${this.apis.openai.baseURL}/chat/completions`,
                {
                    model: this.apis.openai.model,
                    messages: [
                        { role: 'system', content: 'Eres un asistente útil en WhatsApp. Responde en español, de forma concisa (máx 500 caracteres).' },
                        { role: 'user', content: message }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                },
                {
                    headers: { Authorization: `Bearer ${this.apis.openai.key}` },
                    timeout: 15000
                }
            );

            return {
                success: true,
                model: 'gpt-4',
                content: response.data.choices[0].message.content,
                tokens: response.data.usage.total_tokens
            };
        } catch (err) {
            log('error', `ChatGPT error: ${err.message}`);
            return { success: false, error: 'ChatGPT falló' };
        }
    }

    /**
     * ✅ Llamar Claude 3
     */
    async callClaude(message) {
        try {
            const response = await axios.post(
                `${this.apis.anthropic.baseURL}/messages`,
                {
                    model: this.apis.anthropic.model,
                    max_tokens: 500,
                    messages: [
                        { role: 'user', content: message }
                    ],
                    system: 'Eres un asistente útil en WhatsApp. Responde en español, de forma concisa (máx 500 caracteres).'
                },
                {
                    headers: { 
                        'anthropic-version': '2023-06-01',
                        'x-api-key': this.apis.anthropic.key
                    },
                    timeout: 15000
                }
            );

            return {
                success: true,
                model: 'claude-3',
                content: response.data.content[0].text,
                tokens: response.data.usage.input_tokens + response.data.usage.output_tokens
            };
        } catch (err) {
            log('error', `Claude error: ${err.message}`);
            return { success: false, error: 'Claude falló' };
        }
    }

    /**
     * ✅ Llamar Gemini Pro
     */
    async callGemini(message) {
        try {
            const response = await axios.post(
                `${this.apis.google.baseURL}/${this.apis.google.model}:generateContent`,
                {
                    contents: [{
                        parts: [{
                            text: message
                        }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 500,
                        temperature: 0.7
                    }
                },
                {
                    headers: { 'x-api-key': this.apis.google.key },
                    timeout: 15000,
                    params: { key: this.apis.google.key }
                }
            );

            return {
                success: true,
                model: 'gemini-pro',
                content: response.data.candidates[0].content.parts[0].text,
                tokens: 0 // Gemini no devuelve token count
            };
        } catch (err) {
            log('error', `Gemini error: ${err.message}`);
            return { success: false, error: 'Gemini falló' };
        }
    }

    /**
     * ✅ MAIN: Procesar mensaje con AI
     * Flujo:
     * 1. Checar si es @mención o comando explícito
     * 2. Checar rate limits
     * 3. Llamar IA (con fallback automático)
     * 4. Guardar en MongoDB
     */
    async processMessage(messageText, userId, groupJid, isMentioned = false) {
        // 1. Solo responder si es @mención o comando explícito (.ia, .ask, .gpt, etc)
        if (!isMentioned && !messageText.match(/^\.(?:ia|ask|gpt|claude|gemini|ai)/i)) {
            return null; // No responder
        }

        // 2. Checar rate limits
        const limitCheck = this.checkRateLimit(groupJid);
        if (!limitCheck.allowed) {
            return { error: limitCheck.message };
        }

        // 3. Limpiar mensaje
        const cleanMessage = messageText
            .replace(/^\.(?:ia|ask|gpt|claude|gemini|ai)\s+/i, '')
            .trim();

        if (cleanMessage.length < 3) {
            return { error: '❌ Pregunta muy corta' };
        }

        // 4. Intentar con múltiples AIs (fallback automático)
        let result = null;
        const apiOrder = ['ChatGPT', 'Claude', 'Gemini']; // Orden de preferencia
        
        for (const apiName of apiOrder) {
            try {
                log('info', `🤖 Intentando con ${apiName}...`);
                
                if (apiName === 'ChatGPT' && this.apis.openai.key) {
                    result = await this.callChatGPT(cleanMessage);
                } else if (apiName === 'Claude' && this.apis.anthropic.key) {
                    result = await this.callClaude(cleanMessage);
                } else if (apiName === 'Gemini' && this.apis.google.key) {
                    result = await this.callGemini(cleanMessage);
                }

                if (result.success) {
                    log('success', `✅ ${apiName} respondió`);
                    break; // Si fue exitoso, usar este resultado
                }
            } catch (err) {
                log('error', `${apiName} error: ${err.message}`);
                continue; // Intentar siguiente
            }
        }

        if (!result || !result.success) {
            return { error: '❌ Todas las IAs fallaron. Intenta más tarde.' };
        }

        // 5. Guardar en MongoDB
        try {
            await AIInteraction.create({
                userId,
                groupJid,
                messageContent: cleanMessage,
                responseContent: result.content,
                aiModel: result.model,
                responseTime: 0 // TODO: calcular tiempo real
            });

            // Actualizar límite
            const limitData = this.responseLimits.get(groupJid);
            if (limitData) limitData.count++;
        } catch (err) {
            log('error', `Error saving AI interaction: ${err.message}`);
        }

        return {
            success: true,
            model: result.model,
            content: result.content
        };
    }
}

export default new SafeAIManager();
