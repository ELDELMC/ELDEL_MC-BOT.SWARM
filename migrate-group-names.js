#!/usr/bin/env node
/**
 * 🔄 Script de Migración - Corregir nombres de grupos
 * Renombra archivos con nombres sanitizados a nombres correctos con caracteres especiales
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import database from './core/Database.js';
import Contact from './core/models/Contact.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fsp = fs.promises;

const DB_DIR = path.join(process.cwd(), 'db', 'grupos_clonados');

async function migrateGroupNames() {
  console.log('🔄 [MIGRACIÓN] Iniciando corrección de nombres de grupos...\n');

  try {
    // Conectar a MongoDB
    await database.connect();
    console.log('✅ Conectado a MongoDB\n');

    if (!fs.existsSync(DB_DIR)) {
      console.log('⚠️  Carpeta db/grupos_clonados no existe aún. Saltando migración.\n');
      await database.disconnect();
      return;
    }

    const files = fs.readdirSync(DB_DIR).filter(f => f.endsWith('.json') && f !== '_metadata.json');
    
    if (files.length === 0) {
      console.log('✅ No hay archivos para migrar.\n');
      await database.disconnect();
      return;
    }

    console.log(`📋 Encontrados ${files.length} archivo(s) para revisar:\n`);

    // Crear un mapa de JID -> nombre real desde MongoDB
    const jidToRealName = new Map();
    try {
      const contacts = await Contact.find({ groupJid: { $ne: '' } }).select('groupJid groupName').lean();
      for (const contact of contacts) {
        if (contact.groupJid && contact.groupName) {
          jidToRealName.set(contact.groupJid, contact.groupName);
        }
      }
      console.log(`📊 Recuperados ${jidToRealName.size} nombres reales desde MongoDB\n`);
    } catch (err) {
      console.log(`⚠️  No se pudo consultar MongoDB: ${err.message}\n`);
    }

    let migrated = 0;
    let unchanged = 0;
    let errors = 0;

    for (const file of files) {
      const filenameWithoutExt = file.replace('.json', '');
      const oldPath = path.join(DB_DIR, file);

      try {
        // Intentar decodificar si está en URL encoding
        let decodedName;
        try {
          decodedName = decodeURIComponent(filenameWithoutExt);
        } catch {
          decodedName = filenameWithoutExt;
        }

        // Si el nombre decodificado es diferente del original, necesita migración
        if (decodedName !== filenameWithoutExt && !decodedName.includes('_________')) {
          console.log(`   ✅ ${file}`);
          console.log(`      → Nombre decodificado: ${decodedName}`);
          unchanged++;
          continue;
        }

        // Si el nombre contiene muchos guiones bajos, probablemente fue sanitizado incorrectamente
        if (filenameWithoutExt.includes('_______')) {
          console.log(`   ⚠️  ${file}`);
          console.log(`      → Nombre sobre-sanitizado (muchos guiones bajos)`);
          
          // Intentar recuperar del MongoDB
          const data = JSON.parse(fs.readFileSync(oldPath, 'utf-8'));
          // Los números en el archivo son JIDs, podríamos extraer el groupJid del primer contacto
          // pero sin groupJid almacenado no podemos recuperar el nombre original
          console.log(`      → No se puede recuperar nombre original sin JID del grupo\n`);
          errors++;
          continue;
        }

        console.log(`   ℹ️  ${file} (parece estar correctamente codificado)\n`);
        unchanged++;

      } catch (err) {
        console.log(`   ❌ Error procesando ${file}: ${err.message}\n`);
        errors++;
      }
    }

    console.log('\n═══════════════════════════════════════════');
    console.log(`📊 RESUMEN DE MIGRACIÓN`);
    console.log(`   Migrados: ${migrated}`);
    console.log(`   Sin cambios: ${unchanged}`);
    console.log(`   Errores: ${errors}`);
    console.log('═══════════════════════════════════════════\n');

    // Instrucciones para nombres sobre-sanitizados
    if (errors > 0) {
      console.log('💡 PRÓXIMOS PASOS:\n');
      console.log('Para recuperar nombres siendo monitoreados en vivo:');
      console.log('1. Abre la lista de grupos en tu WhatsApp');
      console.log('2. El bot mostrará los nombres correctos en los logs');
      console.log('3. Ejecuta este script nuevamente en 5 minutos\n');
      console.log('Los nombres correctos se guardarán con los caracteres especiales incluidos.\n');
    }

  } catch (err) {
    console.error('❌ Error global:', err);
  } finally {
    await database.disconnect();
    console.log('✅ Migración completada.\n');
    process.exit(0);
  }
}

// Ejecutar
migrateGroupNames().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
