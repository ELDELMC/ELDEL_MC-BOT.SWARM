/**
 * .order - Modo de recolección de números real-time
 * 
 * Activa un modo donde el bot espera textos con números de WhatsApp,
 * los extrae, valida y guarda en db/grupos_clonados/recupera2.json
 * 
 * Después de 5 minutos sin actividad, vuelve a normalidad.
 * Compatible con grupos y mensajes privados.
 */

import { log } from '../core/Logger.js';
import sharedData from '../core/SharedData.js';

// Global state: Map<senderId → { active: bool, lastActivity: timestamp, count: number }>
const orderModeUsers = new Map();
const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos
const INACTIVITY_CHECK_INTERVAL = 30 * 1000; // Check every 30s

/**
 * Extract WhatsApp numbers from messy text
 * Handles formats like: +506 7101 3229, +51 907 749 476, +54 9 3525 61-6630, etc
 */
function extractPhoneNumbers(text) {
  if (!text || typeof text !== 'string') return [];

  // Remove line breaks for cleaner extraction
  const cleanText = text.replace(/\n/g, ' ');

  // Improved Regex:
  // - Matches + followed by digits and typical separators
  // - Also matches sequences of 10-15 digits that look like international numbers
  const phoneRegex = /\+?(\d[\s\-\(\)\.]{0,2}){9,15}\d/g;
  
  const matches = cleanText.match(phoneRegex) || [];
  const numbers = [];

  for (const raw of matches) {
    // Clean all non-digit characters
    const digits = raw.replace(/\D/g, '');
    
    // Validate length for WhatsApp (usually 10-15 digits including country code)
    if (digits.length >= 9 && digits.length <= 15) {
      numbers.push(`${digits}@s.whatsapp.net`);
    }
  }

  return [...new Set(numbers)]; // Unique in this message
}

/**
 * Clean up inactive users from orderModeUsers map
 */
function cleanupInactiveUsers() {
  const now = Date.now();
  for (const [userId, data] of orderModeUsers.entries()) {
    if (data.active && (now - data.lastActivity) > TIMEOUT_MS) {
      orderModeUsers.delete(userId); // Completely remove to save memory
      log('info', `⏰ [ORDER MODE] Timeout para ${userId}: ${data.count} números procesados`);
    }
  }
}

// Start cleanup interval on first activation
let cleanupIntervalStarted = false;

export default {
  command: 'order',
  aliases: [],
  description: 'Activa modo de recolección de números. Envía textos con números y se guardarán en recupera2',
  ownerOnly: false,
  cooldown: 2000,

  async execute(sock, message, args, sessionIndex) {
    const senderId = message.key.participant || message.key.remoteJid;
    const chatId = message.key.remoteJid;
    const isGroup = chatId?.endsWith('@g.us') || false;

    // Start cleanup interval if not already running
    if (!cleanupIntervalStarted) {
      cleanupIntervalStarted = true;
      setInterval(cleanupInactiveUsers, INACTIVITY_CHECK_INTERVAL);
    }

    // Check if user is activating .order for first time
    const userData = orderModeUsers.get(senderId);
    
    if (userData?.active) {
        // Deactivate if already active (toggle behavior)
        orderModeUsers.delete(senderId);
        await sock.sendMessage(chatId, { text: '📴 Modo ORDER desactivado.' }, { quoted: message });
        return;
    }

    // Activate order mode
    orderModeUsers.set(senderId, {
      active: true,
      lastActivity: Date.now(),
      count: 0,
    });

    const responseText = '📡 Modo ORDER activado ✓\nEsperando textos con números 📲\n(5 min de timeout o envía .order para apagar)';

    await sock.sendMessage(chatId, { text: responseText }, { quoted: message });
    log('info', `📡 [ORDER] Activado para ${senderId.split('@')[0]} en ${isGroup ? 'grupo' : 'privado'}`, sessionIndex);
  },

  async handler(sock, message, args, context) {
    const { chatId, sessionIndex } = context;

    // ─── REPLY SUPPORT ───
    // If the user replies to a message with .order, we analyze that message
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quotedMsg) {
        const quotedText = quotedMsg.conversation || 
                           quotedMsg.extendedTextMessage?.text || 
                           quotedMsg.imageMessage?.caption || 
                           quotedMsg.videoMessage?.caption || 
                           '';
        
        if (quotedText) {
            log('info', `📡 [ORDER] Analizando mensaje citado por @${context.senderId.split('@')[0]}`, sessionIndex);
            
            // Ensure user has an entry in orderModeUsers to track stats in this session
            const senderId = context.senderId;
            if (!orderModeUsers.has(senderId)) {
                orderModeUsers.set(senderId, {
                    active: true,
                    lastActivity: Date.now(),
                    count: 0,
                });
            } else {
                orderModeUsers.get(senderId).active = true;
                orderModeUsers.get(senderId).lastActivity = Date.now();
            }

            const result = await processOrderModeMessage(sock, chatId, senderId, quotedText, sessionIndex);
            
            if (!result.processed && result.count === 0) {
                await sock.sendMessage(chatId, { 
                    text: '❌ No se encontraron números nuevos en el mensaje citado.' 
                }, { quoted: message });
            }
            return;
        }
    }

    return this.execute(sock, message, args, sessionIndex);
  }
};

/**
 * Hook: Called from MessageHandler for every message while user is in ORDER mode
 * Returns { processed: bool, count: number, active: bool }
 */
export async function processOrderModeMessage(sock, chatId, senderId, messageText, sessionIndex) {
  const userData = orderModeUsers.get(senderId);

  // Not in order mode
  if (!userData?.active) return { processed: false, count: 0, active: false };

  // Update last activity
  userData.lastActivity = Date.now();

  // Extract phone numbers from message
  const numbers = extractPhoneNumbers(messageText);
  if (numbers.length === 0) {
    return { processed: false, count: 0, active: true }; 
  }

  // Load existing recupera2 database (synchronous call)
  let existingNumbers = new Set();
  try {
    const fileData = sharedData.read('db/grupos_clonados/recupera2.json', []);
    if (Array.isArray(fileData)) {
      existingNumbers = new Set(fileData);
    }
  } catch (err) {
    log('error', `Error reading recupera2: ${err.message}`);
  }

  // Add new numbers (avoid duplicates)
  const newNumbers = [];
  for (const num of numbers) {
    if (!existingNumbers.has(num)) {
      existingNumbers.add(num);
      newNumbers.push(num);
    }
  }

  // Save updated list
  if (newNumbers.length > 0) {
    const numbersArray = Array.from(existingNumbers);
    try {
      await sharedData.write('db/grupos_clonados/recupera2.json', numbersArray);
      userData.count += newNumbers.length;

      // Feedback to user
      const uniqueMsg = newNumbers.length === numbers.length
        ? `${newNumbers.length} nuevos`
        : `${newNumbers.length} nuevos, ${numbers.length - newNumbers.length} duplicados`;

      await sock.sendMessage(chatId, {
        text: `✅ [ORDER] ${uniqueMsg}\nTotal recupera2: ${existingNumbers.size} | Sesión: ${userData.count}`,
      }, { quoted: { key: { remoteJid: chatId }, message: { conversation: messageText } } }); // Subtle quote

      log('info', `✅ [ORDER] ${uniqueMsg} | Total acumulado: ${existingNumbers.size}`, sessionIndex);
      return { processed: true, count: newNumbers.length, active: true };
    } catch (err) {
      log('error', `❌ [ORDER] Error al guardar: ${err.message}`, sessionIndex);
      return { processed: false, count: 0, active: true };
    }
  }

  return { processed: false, count: 0, active: true }; // Numbers were duplicates
}
