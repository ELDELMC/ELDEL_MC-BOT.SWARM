/**
 * ─── SPY EVENT · LEGACY FILE ───
 * 
 * ⚠️ DEPRECATED: Este archivo ha sido REEMPLAZADO por la integración directa
 * en MessageHandler.js
 * 
 * EL PROBLEMA RESUELTO:
 * Antes el bot recibía mensajes pero NO guardaba los números de usuarios.
 * Causa: spyMode nunca era llamado en el flujo de ejecución.
 * 
 * SOLUCIÓN IMPLEMENTADA:
 * MessageHandler.js ahora llama a processSpyMessage() después de cada mensaje
 * en grupos (fire-and-forget en background).
 * 
 * CAMBIOS:
 * ✓ Import de processSpyMessage en MessageHandler.js
 * ✓ Llamada directa en handleMessage() para todos los mensajes de grupo
 * ✓ Sistema SPY MODE ahora FUNCIONAL (backend globalmente activo)
 * ✓ Números se guardan cada 30 segundos en db/grupos_clonados/
 * 
 * MANTENER ESTE ARCHIVO: Para compatibilidad backward con SessionManager.js
 */

import { log } from './Logger.js';

/**
 * Función stub para compatibilidad backward.
 * SessionManager.js llama esto al conectar cada sesión.
 * 
 * El trabajo real ahora lo hace MessageHandler.js
 *
 * @param {object} sock - Socket de Baileys ya conectado
 * @param {number} sessionIndex - Índice de sesión (para logs)
 */
export function attachSpyListener(sock, sessionIndex) {
    log('info', `🕵️ Spy listener compatibility stub (REAL captura en MessageHandler.js con processSpyMessage)`, sessionIndex);
}
