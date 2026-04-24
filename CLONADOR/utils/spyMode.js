/**
 * 🕵️ MODO ESPÍA AUTOMÁTICO (Global y Permanente)
 * 
 * Intercepta los "sender" reales de los mensajes que viajan en TODOS los grupos 
 * de forma silenciosa y los vuelca:
 * 1. Al disco duro (JSON local)
 * 2. A MongoDB Atlas (nube) cada 30 segundos usando un único hilo global
 * 
 * ✅ LOGS DETALLADOS EN CONSOLA para monitoreo en tiempo real.
 * ✅ DE-DUPLICACIÓN automática en nube mediante índice único en phoneNumber
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sanitizeGroupName, guardarGrupoClonado } from './clonador.js';
import Contact from '../../core/models/Contact.js';
import database from '../../core/Database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fsp = fs.promises;
const DB_DIR = path.join(process.cwd(), 'db', 'grupos_clonados');

// Mapa global { groupJid: { name: "nombre_grupo", realName: "nombre_sin_sanitizar", buffer: Set(), totalCaught: number } }
const groupBuffers = new Map();
let isLoopRunning = false;
let globalStats = { totalScanned: 0, totalNew: 0, totalDuplicates: 0, totalFlushed: 0, mongoFlushed: 0, mongoErrors: 0 };

/**
 * Guarda metadatos del grupo (nombre original) para recuperación futura
 */
async function saveGroupMetadata(sanitizedName, realName, groupJid) {
  try {
    const metadataPath = path.join(DB_DIR, '_groupMetadata.json');
    let metadata = {};
    
    // Leer metadata existente
    if (fs.existsSync(metadataPath)) {
      try {
        const data = await fsp.readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(data);
      } catch (e) {
        console.error(`⚠️  Error leyendo _groupMetadata.json: ${e.message}`);
      }
    }
    
    // Actualizar con nuevo mapeo
    metadata[sanitizedName] = {
      realName,
      groupJid,
      savedAt: new Date().toISOString()
    };
    
    // Guardar
    await fsp.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
  } catch (e) {
    console.error(`⚠️  Error guardando metadatos: ${e.message}`);
  }
}

/**
 * Flush a MongoDB Atlas usando bulkWrite (upsert automático)
 * De-duplicación garantizada por índice único en phoneNumber
 */
async function flushToMongoDB(groupJid, groupName, jidsArray) {
  if (!database.isConnected) {
    globalStats.mongoErrors++;
    console.log(`⚠️  [MONGO SKIP] MongoDB no conectado, datos guardados solo en disco`);
    return { success: false, inserted: 0, updated: 0 };
  }

  if (!jidsArray || jidsArray.length === 0) {
    return { success: true, inserted: 0, updated: 0 };
  }

  try {
    // Construir operaciones bulkWrite (upsert automático)
    const operations = jidsArray.map(jid => {
      const phoneNumber = jid.split('@')[0];
      return {
        updateOne: {
          filter: { phoneNumber }, // Filtro por número único
          update: {
            $set: {
              phoneNumber,
              groupName,
              groupJid,
              extractedAt: new Date(),
              status: 'active',
              sourceSession: process.env.SESSION_ID || 1
            }
          },
          upsert: true // Inserta si no existe, actualiza si existe (de-duplicación)
        }
      };
    });

    // Ejecutar bulk
    const result = await Contact.bulkWrite(operations);
    const totalOps = result.upsertedCount + result.modifiedCount;
    globalStats.mongoFlushed += totalOps;

    console.log(`☁️  [MONGO FLUSH] ${groupName}: ✅ ${result.upsertedCount} nuevos + ${result.modifiedCount} actualizados = ${totalOps} total`);
    
    return { 
      success: true, 
      inserted: result.upsertedCount, 
      updated: result.modifiedCount 
    };
  } catch (err) {
    globalStats.mongoErrors++;
    console.error(`❌ [MONGO ERROR] Fallo en bulkWrite para "${groupName}": ${err.message}`);
    return { success: false, inserted: 0, updated: 0 };
  }
}

// Helpers
async function ensureGroup(sock, groupJid) {
  if (!groupBuffers.has(groupJid)) {
    groupBuffers.set(groupJid, { name: null, realName: null, buffer: new Set(), totalCaught: 0, retries: 0 });
    try {
      const metadata = await sock.groupMetadata(groupJid);
      const groupName = sanitizeGroupName(metadata.subject); // Nombre sanitizado para archivo
      const realName = metadata.subject; // Nombre original
      
      groupBuffers.get(groupJid).name = groupName;
      groupBuffers.get(groupJid).realName = realName;
      groupBuffers.get(groupJid).retries = 0; // Reset retries on success
      
      // Guardar metadatos con nombre real
      await saveGroupMetadata(groupName, realName, groupJid);
      
      console.log(`🕵️ [SPY AUTO] ═══════════════════════════════════════`);
      console.log(`🕵️ [SPY AUTO] 📡 Radar ENCENDIDO en: ${realName}`);
      console.log(`🕵️ [SPY AUTO] 💾 Archivo: ${groupName}.json`);
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
  console.log(`🕵️ ║   Flush cada 30s | Disco + MongoDB ☁️             ║`);
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
    const mongoStatus = database.isConnected ? '☁️ ON' : '⚠️ OFF';
    console.log(`\n⏱️  [SPY HEARTBEAT] ${now} | Grupos: ${groupBuffers.size} | Pendientes: ${totalPending} | Escaneados: ${globalStats.totalScanned} | Nuevos: ${globalStats.totalNew} | Duplicados: ${globalStats.totalDuplicates} | Disco: ${globalStats.totalFlushed} | Mongo: ${globalStats.mongoFlushed} | Errores Mongo: ${globalStats.mongoErrors} | ${mongoStatus}`);

    if (groupsWithData === 0) {
      console.log(`💤 [SPY FLUSH] Nada pendiente por guardar. Esperando actividad...`);
      return;
    }

    console.log(`📡 [SPY FLUSH] ── Volcando ${totalPending} contactos de ${groupsWithData} grupo(s) (disco + nube) ──`);

    for (const [groupJid, data] of groupBuffers.entries()) {
      if (data.name && data.buffer.size > 0) {
        const jidsToSave = Array.from(data.buffer);
        const numbers = jidsToSave.map(j => j.split('@')[0]);
        const displayName = data.realName || data.name; // Mostrar nombre real si está disponible
        
        console.log(`   💾 ${displayName}: ${jidsToSave.length} contactos → [${numbers.slice(0, 5).join(', ')}${numbers.length > 5 ? ` ...+${numbers.length - 5} más` : ''}]`);
        
        // Guardar a disco (método original)
        await guardarGrupoClonado(data.name, jidsToSave).catch(e => console.error(`   ❌ Error guardando en disco "${displayName}":`, e.message));
        
        // Guardar a MongoDB (NUEVO - integración CAMBIO #9)
        if (database.isConnected) {
          await flushToMongoDB(groupJid, data.name, jidsToSave);
        }
        
        globalStats.totalFlushed += jidsToSave.length;
        data.buffer.clear();
      }
    }
    console.log(`✅ [SPY FLUSH] ── Volcado completado (disco + nube) ──\n`);
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
  if (!data || !data.name) return { success: false, atrapados: 0, groupName: '', mongoStatus: 'N/A' };
  
  const atrapados = data.buffer.size;
  if (atrapados > 0) {
    const jidsToSave = Array.from(data.buffer);
    console.log(`⚡ [SPY FORCE FLUSH] Guardando ${atrapados} contactos de "${data.name}" por petición manual.`);
    
    // Guardar a disco
    await guardarGrupoClonado(data.name, jidsToSave);
    globalStats.totalFlushed += atrapados;
    
    // Guardar a MongoDB
    let mongoResult = { success: false };
    if (database.isConnected) {
      mongoResult = await flushToMongoDB(groupJid, data.name, jidsToSave);
    }
    
    data.buffer.clear();
    
    return { 
      success: true, 
      atrapados, 
      groupName: data.name,
      mongoStatus: mongoResult.success ? `${mongoResult.inserted}↑ ${mongoResult.updated}→` : '❌'
    };
  }
  return { success: true, atrapados: 0, groupName: data.name, mongoStatus: 'N/A' };
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
