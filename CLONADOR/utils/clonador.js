/**
 * 🧬 SISTEMA DE CLONACIÓN DE GRUPOS
 * Base de datos liviana por grupo en ./db/grupos_clonados/
 * Cada grupo = un archivo JSON con array de JIDs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fsp = fs.promises;

// ✅ UNIFIED DATABASE PATH - Used by SPY, ORDER, INVO
// En Docker: /home/container/db/
// En local: ./db/
const DB_DIR = path.join(process.cwd(), 'db', 'grupos_clonados');

/**
 * Codifica el nombre del grupo con URL encoding para usarlo como nombre de archivo
 * Preserva todos los caracteres especiales (emojis, caracteres acentuados, etc.)
 */
function sanitizeGroupName(subject) {
  // Usar URL encoding para preservar caracteres especiales
  const encoded = encodeURIComponent(subject);
  return encoded;
}

/**
 * Decodifica el nombre del grupo desde el archivo
 */
function desanitizeGroupName(encoded) {
  try {
    return decodeURIComponent(encoded);
  } catch (e) {
    return encoded; // Si falla, retornar como está
  }
}

/**
 * Asegura que la carpeta ./db/grupos_clonados/ exista
 */
async function ensureDbDir() {
  await fsp.mkdir(DB_DIR, { recursive: true });
}

/**
 * Lee el archivo JSON de un grupo clonado.
 * Retorna array de JIDs o array vacío si no existe.
 */
async function leerGrupoClonado(nombreSanitizado) {
  await ensureDbDir();
  const filePath = path.join(DB_DIR, `${nombreSanitizado}.json`);
  try {
    const data = await fsp.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return []; // No existe aún
  }
}

/**
 * Guarda/actualiza el archivo JSON de un grupo clonado.
 * Hace merge sin duplicados con los JIDs existentes.
 * @param {string} nombreSanitizado - Nombre del archivo (sin .json)
 * @param {string[]} nuevosJids - Array de JIDs nuevos a agregar
 * @returns {number} Total de JIDs guardados
 */
async function guardarGrupoClonado(nombreSanitizado, nuevosJids) {
  await ensureDbDir();
  const filePath = path.join(DB_DIR, `${nombreSanitizado}.json`);
  
  // Leer existentes
  const existentes = await leerGrupoClonado(nombreSanitizado);
  
  // Merge sin duplicados usando Set
  const merged = [...new Set([...existentes, ...nuevosJids])];
  
  await fsp.writeFile(filePath, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`💾 [CLONADOR] Guardados ${merged.length} JIDs en ${nombreSanitizado}.json (${nuevosJids.length - (merged.length - existentes.length)} duplicados filtrados)`);
  
  return merged.length;
}

/**
 * Lista todos los archivos de grupos clonados disponibles.
 * @returns {string[]} Array de nombres originales (decodificados)
 */
async function listarGruposClonados() {
  await ensureDbDir();
  try {
    const files = await fsp.readdir(DB_DIR);
    return files
      .filter(f => f.endsWith('.json') && f !== '_metadata.json')
      .map(f => desanitizeGroupName(f.replace('.json', '')));
  } catch (e) {
    return [];
  }
}

/**
 * Versión SÍNCRONA de listarGruposClonados (para uso en engine.js)
 */
function listarGruposClonadosSync() {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    return fs.readdirSync(DB_DIR)
      .filter(f => f.endsWith('.json') && f !== '_metadata.json')
      .map(f => desanitizeGroupName(f.replace('.json', '')));
  } catch (e) {
    return [];
  }
}

export {
  sanitizeGroupName,
  desanitizeGroupName,
  leerGrupoClonado,
  guardarGrupoClonado,
  listarGruposClonados,
  listarGruposClonadosSync,
  DB_DIR
};
