import { reply } from '../core/Formatter.js';

/**
 * .simp - Tell someone they're a simp (in jest)
 * Envía un mensaje humorístico sobre ser "simp"
 */

export default {
    command: 'simp',
    aliases: ['simpcard'],
    category: 'fun',
    description: 'Genera una "tarjeta SIMP" humorística',
    usage: '.simp [@usuario]',
    cooldown: 3000,

    async handler(sock, message, args, context) {
        const chatId = context.chatId;
        let userName = args.join(' ') || 'Usuario';
        
        // Check for mentions
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentions && mentions.length > 0) {
            const participant = mentions[0];
            userName = `@${participant.split('@')[0]}`;
        }
        
        const messages = [
            `💳 TARJETA SIMP OFICIAL\n\nNombre: ${userName}\nNivel: NIVEL 999\nPerfil: SIMP MÁXIMO`,
            `🎖️ CERTIFICADO DE SIMP\n\nSe certifica que ${userName}\nes un simp de categoría A+`,
            `📜 DIPLOMA SIMP\n\n${userName} ha sido reconocido como\nSimp de las Naciones Unidas`,
            `💰 FONDO SIMP DETECTADO\n\nUsuario: ${userName}\nNivel de Simp: INFINITO ∞`,
        ];
        
        const message_ = messages[Math.floor(Math.random() * messages.length)];
        
        await sock.sendMessage(chatId, {
            text: reply(message_)
        }, { quoted: message });
    }
};
