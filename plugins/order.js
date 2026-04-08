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

  // Remove line breaks and extra spaces for cleaner extraction
  const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');

  // Regex pattern: + followed by (2-3 digits) then (spaces/dashes/digits)
  // Captures sequences like: +506 7101 3229, +51907749476, +54-9-3525-61-6630, etc
  const phoneRegex = /\+(\d{1,3}[\s\-]?)(\d{1,4}[\s\-]?)(\d{1,4}[\s\-]?)(\d{1,4}[\s\-]?)(\d{1,4})?/g;
  
  const matches = [...cleanText.matchAll(phoneRegex)];
  const numbers = [];

  for (const match of matches) {
    // Join all captured groups and remove spaces/dashes
    const extracted = (match[1] + match[2] + match[3] + match[4] + (match[5] || ''))
      .replace(/[\s\-]/g, '');
    
    // Validate: country code (2-3 digits) + phone (7-12 digits) = 9-15 total
    if (extracted.length >= 9 && extracted.length <= 15) {
      numbers.push(`${extracted}@s.whatsapp.net`);
    }
  }

  return numbers;
}

/**
 * Clean up inactive users from orderModeUsers map
 */
function cleanupInactiveUsers() {
  const now = Date.now();
  for (const [userId, data] of orderModeUsers.entries()) {
    if (data.active && (now - data.lastActivity) > TIMEOUT_MS) {
      orderModeUsers.set(userId, { active: false, count: data.count });
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
    const wasActive = userData?.active;

    // Activate order mode
    orderModeUsers.set(senderId, {
      active: true,
      lastActivity: Date.now(),
      count: userData?.count || 0,
    });

    const responseText = wasActive
      ? '🔄 Modo ORDER activo | Continuando recolección...'
      : '📡 Modo ORDER activado ✓\nEsperando textos con números 📲\n(5 min de timeout)';

    await sock.sendMessage(chatId, { text: responseText }, { quoted: message });
    log('info', `📡 [ORDER] Activado para ${senderId.split('@')[0]} en ${isGroup ? 'grupo' : 'privado'}`, sessionIndex);
  },
};

/**
 * Hook: Called from MessageHandler for every message while user is in ORDER mode
 * Returns { processed: bool, count: number } if in active order mode
 */
export async function processOrderModeMessage(sock, chatId, senderId, messageText, sessionIndex) {
  const userData = orderModeUsers.get(senderId);

  // Not in order mode or timeout reached
  if (!userData?.active) return { processed: false, count: 0 };

  // Update last activity
  userData.lastActivity = Date.now();

  // Extract phone numbers from message
  const numbers = extractPhoneNumbers(messageText);
  if (numbers.length === 0) {
    return { processed: false, count: 0 }; // No numbers found, but still in active mode
  }

  // Load existing recupera2 database
  let existingNumbers = new Set();
  try {
    const fileData = await sharedData.read('db/grupos_clonados/recupera2.json');
    if (Array.isArray(fileData)) {
      existingNumbers = new Set(fileData);
    }
  } catch (err) {
    // File doesn't exist yet, that's ok
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
      });

      log('info', `✅ [ORDER] ${uniqueMsg} | Total acumulado: ${existingNumbers.size}`, sessionIndex);
      return { processed: true, count: newNumbers.length };
    } catch (err) {
      log('error', `❌ [ORDER] Error al guardar: ${err.message}`, sessionIndex);
      return { processed: false, count: 0 };
    }
  }

  return { processed: false, count: 0 }; // Numbers were duplicates
}
