#!/usr/bin/env node
/**
 * 🔄 HERRAMIENTA DE RECUPERACIÓN - Renombrar grupos con nombres incorrectos
 * Lee metadatos y renombra archivos con URL encoding correcto
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fsp = fs.promises;

const DB_DIR = path.join(process.cwd(), 'db', 'grupos_clonados');

async function recoverGroupNames() {
  console.log('\n🔍 [RECUPERACIÓN] Buscando nombres de grupos incorrectamente sanitizados...\n');

  try {
    if (!fs.existsSync(DB_DIR)) {
      console.log('⚠️  Carpeta db/grupos_clonados no existe aún.\n');
      return;
    }

    // Leer metadatos
    const metadataPath = path.join(DB_DIR, '_groupMetadata.json');
    let metadata = {};
    
    if (fs.existsSync(metadataPath)) {
      try {
        const data = await fsp.readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(data);
        console.log(`✅ Metadatos cargados: ${Object.keys(metadata).length} grupos\n`);
      } catch (e) {
        console.log(`⚠️  No se pudo leer _groupMetadata.json: ${e.message}\n`);
      }
    } else {
      console.log(`⚠️  Archivo _groupMetadata.json no encontrado.\n`);
      console.log(`💡 Ejecuta el bot y deja que genere automáticamente los metadatos.\n`);
      return;
    }

    const files = fs.readdirSync(DB_DIR)
      .filter(f => f.endsWith('.json') && f !== '_groupMetadata.json' && f !== '_metadata.json');

    console.log(`📋 Archivos encontrados: ${files.length}\n`);

    let recovered = 0;
    let alreadyCorrect = 0;
    let orphaned = 0;

    for (const file of files) {
      const filenameWithoutExt = file.replace('.json', '');
      
      // Verificar si está en los metadatos
      if (metadata[filenameWithoutExt]) {
        const info = metadata[filenameWithoutExt];
        const realName = info.realName;
        const newEncodedName = encodeURIComponent(realName);
        
        if (newEncodedName === filenameWithoutExt) {
          console.log(`✅ ${file}`);
          console.log(`   → Ya está correctamente codificado\n`);
          alreadyCorrect++;
          continue;
        }

        // Necesita renombrarse
        const oldPath = path.join(DB_DIR, file);
        const newName = `${newEncodedName}.json`;
        const newPath = path.join(DB_DIR, newName);

        try {
          await fsp.rename(oldPath, newPath);
          console.log(`🔄 RENOMBRADO`);
          console.log(`   📝 Nombre real: ${realName}`);
          console.log(`   ❌ Viejo: ${file}`);
          console.log(`   ✅ Nuevo: ${newName}\n`);
          recovered++;
        } catch (err) {
          console.log(`❌ Error renombrando ${file}: ${err.message}\n`);
        }
      } else {
        // Archivo sin metadatos (probablemente viejo/sobre-sanitizado)
        if (filenameWithoutExt.includes('_______')) {
          console.log(`⚠️  ${file}`);
          console.log(`   → Sin metadatos (nombre anterior perdido)\n`);
          orphaned++;
        }
      }
    }

    console.log('\n═══════════════════════════════════════════');
    console.log(`📊 RESUMEN DE RECUPERACIÓN`);
    console.log(`   Recuperados: ${recovered}`);
    console.log(`   Correctos: ${alreadyCorrect}`);
    console.log(`   Huérfanos: ${orphaned}`);
    console.log('═══════════════════════════════════════════\n');

    if (orphaned > 0) {
      console.log('💡 PARA RECUPERAR NOMBRES HUÉRFANOS:\n');
      console.log('1. Abre WhatsApp y ve a cada grupo abandonado');
      console.log('2. Escribe un mensaje para activar el bot');
      console.log('3. El bot guardará el nombre real en metadatos');
      console.log('4. Ejecuta este script nuevamente\n');
      console.log('Las próximas conexiones preservarán los caracteres especiales\n');
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  recoverGroupNames().catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });
}

export { recoverGroupNames };
