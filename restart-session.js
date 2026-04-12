#!/usr/bin/env node
/**
 * 🔄 RESTART SESSION - Reiniciar una sesión específica
 * Uso: node restart-session.js 1     (reinicia Session 1)
 *      node restart-session.js 2     (reinicia Session 2)
 *      node restart-session.js clean (limpia todas las sesiones)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SESSIONS_DIR = path.join(process.cwd(), 'sessions');

/**
 * Crear interfaz interactiva
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Preguntar confirmación
 */
function askConfirmation(question) {
  return new Promise((resolve) => {
    const rl = createInterface();
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 's');
    });
  });
}

/**
 * Eliminar sesión
 */
function deleteSession(sessionIndex) {
  const sessionPath = path.join(SESSIONS_DIR, `session-${sessionIndex}`);
  
  if (!fs.existsSync(sessionPath)) {
    console.log(`ℹ️  Session ${sessionIndex} no existe aún (nueva sesión).\n`);
    return false;
  }

  try {
    fs.rmSync(sessionPath, { recursive: true, force: true });
    console.log(`✅ Session ${sessionIndex} eliminada correctamente.\n`);
    console.log(`💡 La próxima vez que el bot inicie, te pedirá escanear el QR\n`);
    return true;
  } catch (err) {
    console.log(`❌ Error al eliminar Session ${sessionIndex}: ${err.message}\n`);
    return false;
  }
}

/**
 * Limpiar todas las sesiones
 */
function cleanAllSessions() {
  try {
    if (fs.existsSync(SESSIONS_DIR)) {
      fs.rmSync(SESSIONS_DIR, { recursive: true, force: true });
      console.log(`✅ Todas las sesiones eliminadas.\n`);
      return true;
    } else {
      console.log(`ℹ️  Directorio de sesiones no existe.\n`);
      return false;
    }
  } catch (err) {
    console.log(`❌ Error al limpiar sesiones: ${err.message}\n`);
    return false;
  }
}

/**
 * Mostrar estado de sesiones
 */
function showSessionStatus() {
  console.log('\n📊 ESTADO DE SESIONES:\n');
  
  if (!fs.existsSync(SESSIONS_DIR)) {
    console.log('ℹ️  Directorio de sesiones no existe aún.\n');
    return;
  }

  const entries = fs.readdirSync(SESSIONS_DIR);
  
  if (entries.length === 0) {
    console.log('ℹ️  No hay sesiones guardadas.\n');
    return;
  }

  for (const entry of entries) {
    if (entry.startsWith('session-')) {
      const sessionIndex = entry.replace('session-', '');
      const credsPath = path.join(SESSIONS_DIR, entry, 'creds.json');
      const credsExists = fs.existsSync(credsPath);
      
      if (credsExists) {
        try {
          const stats = fs.statSync(credsPath);
          console.log(`✅ Session ${sessionIndex}: ${stats.size} bytes (válida)`);
        } catch (_) {
          console.log(`❌ Session ${sessionIndex}: Error al leer creds.json`);
        }
      } else {
        console.log(`⚠️  Session ${sessionIndex}: Sin creds.json (sin autenticar)`);
      }
    }
  }
  
  console.log();
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  
  console.log('\n🔄 ╔═══════════════════════════════════════════╗');
  console.log('🔄 ║   RESTART SESSION - Gestor de Sesiones     ║');
  console.log('🔄 ╚═══════════════════════════════════════════╝\n');

  if (args.length === 0) {
    console.log('📋 OPCIONES:\n');
    console.log('  node restart-session.js 1       → Reiniciar Session 1');
    console.log('  node restart-session.js 2       → Reiniciar Session 2');
    console.log('  node restart-session.js status  → Ver estado de sesiones');
    console.log('  node restart-session.js clean   → Limpiar todas las sesiones\n');
    
    showSessionStatus();
    return;
  }

  const command = args[0].toLowerCase();

  if (command === 'status' || command === 'estado') {
    showSessionStatus();
    return;
  }

  if (command === 'clean' || command === 'limpiar') {
    console.log('⚠️  ADVERTENCIA: Esto eliminará TODAS las sesiones.\n');
    console.log('El bot pedirá autenticación nuevamente (escanear QR).\n');
    
    const confirmed = await askConfirmation('¿Estás seguro? (s/n): ');
    if (confirmed) {
      cleanAllSessions();
    } else {
      console.log('Cancelado.\n');
    }
    return;
  }

  // Reiniciar sesión específica
  const sessionIndex = parseInt(command);
  if (isNaN(sessionIndex) || sessionIndex < 1 || sessionIndex > 4) {
    console.log(`❌ Session inválida: ${command}\n`);
    console.log('Debe ser un número entre 1 y 4\n');
    return;
  }

  console.log(`🔄 REINICIAR SESSION ${sessionIndex}\n`);
  console.log('Esto eliminará los archivos de autenticación.');
  console.log('El bot pedirá escanear QR nuevamente.\n');
  
  const confirmed = await askConfirmation(`¿Reiniciar Session ${sessionIndex}? (s/n): `);
  if (confirmed) {
    deleteSession(sessionIndex);
    console.log('✅ Reinicia el bot para completar el proceso:');
    console.log('   npm start\n');
  } else {
    console.log('Cancelado.\n');
  }
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
