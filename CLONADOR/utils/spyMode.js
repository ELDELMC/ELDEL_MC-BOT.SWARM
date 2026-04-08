/**
 * 🕵️ MODO ESPÍA AUTOMÁTICO (Global y Permanente)
 * 
 * Intercepta los "sender" reales de los mensajes que viajan en TODOS los grupos 
 * de forma silenciosa y los vuelca al disco duro cada 30 segundos usando un 
 * único hilo global para máximo rendimiento.
 * 
 * ✅ LOGS DETALLADOS EN CONSOLA para monitoreo en tiempo real.
 */

import { sanitizeGroupName, guardarGrupoClonado } from './clonador.js';

// Mapa global { groupJid: { name: "nombre_grupo", buffer: Set(), totalCaught: number } }
const groupBuffers = new Map();
let isLoopRunning = false;
let globalStats = { totalScanned: 0, totalNew: 0, totalDuplicates: 0, totalFlushed: 0 };

// Helpers
async function ensureGroup(sock, groupJid) {
  if (!groupBuffers.has(groupJid)) {
    groupBuffers.set(groupJid, { name: null, buffer: new Set(), totalCaught: 0, retries: 0 });
    try {
      const metadata = await sock.groupMetadata(groupJid);
      const groupName = sanitizeGroupName(metadata.subject);
      groupBuffers.get(groupJid).name = groupName;
      groupBuffers.get(groupJid).retries = 0; // Reset retries on success
      console.log(`🕵️ [SPY AUTO] ═══════════════════════════════════════`);
      console.log(`🕵️ [SPY AUTO] 📡 Radar ENCENDIDO en: ${groupName}`);
      console.log(`🕵️ [SPY AUTO] 🔗 JID: ${groupJid}`);
      console.log(`🕵️ [SPY AUTO] 📊 Grupos monitoreados: ${groupBuffers.size}`);
      console.log(`🕵️ [SPY AUTO] ═══════════════════════════════════════`);
    } catch (e) {
      // Don't delete - will retry on next message
      const data = groupBuffers.get(groupJid);
      if (data) {
        data.retries = (data.retries || 0) + 1;
        // Only log error after 3 retries to avoid spam
        if (data.retries === 3) {
          console.error(`⚠️  [SPY AUTO] Fallo al leer metadatos de ${groupJid} (intento 3): ${e.message}`);
          data.name = 'UNKNOWN'; // Set a placeholder name
        }
      }
    }
  }
}

function startGlobalSpyLoop() {
  if (isLoopRunning) return;
  isLoopRunning = true;
  console.log(`\n🕵️ ╔═══════════════════════════════════════════════════╗`);
  console.log(`🕵️ ║   MODO ESPÍA AUTOMÁTICO — MOTOR INICIADO          ║`);
  console.log(`🕵️ ║   Flush cada 30s | Recolección en tiempo real      ║`);
  console.log(`🕵️ ╚═══════════════════════════════════════════════════╝\n`);

  setInterval(async () => {
    let totalPending = 0;
    let groupsWithData = 0;

    for (const [groupJid, data] of groupBuffers.entries()) {
      totalPending += data.buffer.size;
      if (data.buffer.size > 0) groupsWithData++;
    }

    // Siempre mostrar el heartbeat para que se vea que está vivo
    const now = new Date().toLocaleTimeString('es-CO');
    console.log(`\n⏱️  [SPY HEARTBEAT] ${now} | Grupos: ${groupBuffers.size} | Pendientes: ${totalPending} | Escaneados: ${globalStats.totalScanned} | Nuevos: ${globalStats.totalNew} | Duplicados: ${globalStats.totalDuplicates} | Flushed total: ${globalStats.totalFlushed}`);

    if (groupsWithData === 0) {
      console.log(`💤 [SPY FLUSH] Nada pendiente por guardar. Esperando actividad...`);
      return;
    }

    console.log(`📡 [SPY FLUSH] ── Volcando ${totalPending} contactos de ${groupsWithData} grupo(s) al disco ──`);

    for (const [groupJid, data] of groupBuffers.entries()) {
      if (data.name && data.buffer.size > 0) {
        const jidsToSave = Array.from(data.buffer);
        const numbers = jidsToSave.map(j => j.split('@')[0]);
        
        console.log(`   💾 ${data.name}: ${jidsToSave.length} contactos → [${numbers.slice(0, 5).join(', ')}${numbers.length > 5 ? ` ...+${numbers.length - 5} más` : ''}]`);
        
        await guardarGrupoClonado(data.name, jidsToSave).catch(e => console.error(`   ❌ Error guardando ${data.name}:`, e.message));
        
        globalStats.totalFlushed += jidsToSave.length;
        data.buffer.clear();
      }
    }
    console.log(`✅ [SPY FLUSH] ── Volcado completado ──\n`);
  }, 30000);
}

/**
 * Función inyectada en el chorro principal (engine.js)
 */
async function processSpyMessage(sock, groupJid, senderJid) {
  // Asegurar que el hilo de guardado esté girando
  startGlobalSpyLoop();

  if (!senderJid) return;

  let realJid = senderJid;

  // ─── Convert @lid to @s.whatsapp.net ───
  if (senderJid.includes('@lid')) {
    try {
      const metadata = await sock.groupMetadata(groupJid);
      const participant = metadata.participants.find(p => p.id === senderJid);
      if (participant?.id.includes('@s.whatsapp.net')) {
        realJid = participant.id;
      } else {
        // Fallback: extract number and make valid JID
        const number = senderJid.split('@')[0];
        realJid = `${number}@s.whatsapp.net`;
      }
    } catch (err) {
      // Fallback if metadata fetch fails
      const number = senderJid.split('@')[0];
      realJid = `${number}@s.whatsapp.net`;
    }
  }

  // Ignorar si sigue siendo LID o formato inválido
  if (!realJid.includes('@s.whatsapp.net')) {
    // console.log(`🔒 [SPY SKIP] Invalid JID: ${realJid}`);
    return;
  }

  globalStats.totalScanned++;

  // Garantizar que sabemos quién es el grupo
  await ensureGroup(sock, groupJid);

  const groupData = groupBuffers.get(groupJid);
  if (!groupData) return;

  const rawNumber = realJid.split('@')[0];
  const previousSize = groupData.buffer.size;
  groupData.buffer.add(realJid);

  if (groupData.buffer.size > previousSize) {
    // ¡NUEVO número atrapado!
    groupData.totalCaught++;
    globalStats.totalNew++;
    const groupDisplay = groupData.name || 'LOADING...';
    console.log(`🕵️ [SPY CATCH] 🆕 ¡NUEVO! ${rawNumber} atrapado en "${groupDisplay}" (buffer: ${groupData.buffer.size} | total histórico: ${groupData.totalCaught})`);
  } else {
    // Duplicado (ya lo teníamos en el buffer actual)
    globalStats.totalDuplicates++;
    // Mostrar duplicados cada 50 para no saturar la consola
    if (globalStats.totalDuplicates % 50 === 0) {
      console.log(`🔄 [SPY DUP] ${rawNumber} ya estaba en buffer. (${globalStats.totalDuplicates} duplicados totales en esta sesión)`);
    }
  }
}

/**
 * Por si el usuario quiere forzar el guardado y ver estadísticas
 */
async function triggerForceFlush(groupJid) {
  const data = groupBuffers.get(groupJid);
  if (!data || !data.name) return { success: false, atrapados: 0, groupName: '' };
  
  const atrapados = data.buffer.size;
  if (atrapados > 0) {
    const jidsToSave = Array.from(data.buffer);
    console.log(`⚡ [SPY FORCE FLUSH] Guardando ${atrapados} contactos de "${data.name}" por petición manual.`);
    await guardarGrupoClonado(data.name, jidsToSave);
    globalStats.totalFlushed += atrapados;
    data.buffer.clear();
  }
  return { success: true, atrapados, groupName: data.name };
}

/**
 * Obtener estadísticas del spy para mostrar en chat
 */
function getSpyStats() {
  const grupos = [];
  for (const [jid, data] of groupBuffers.entries()) {
    grupos.push({ name: data.name || jid, pending: data.buffer.size, totalCaught: data.totalCaught });
  }
  return { ...globalStats, groups: grupos };
}

export {
  processSpyMessage,
  triggerForceFlush,
  getSpyStats,
  startGlobalSpyLoop as startFlushCycle
};
