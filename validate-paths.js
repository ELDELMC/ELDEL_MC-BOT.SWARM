#!/usr/bin/env node
/**
 * 🔍 Script de validación de rutas de datos
 * Verifica que la estructura de directorios sea correcta
 * y que SPY, ORDER, INVO estén usando la misma ruta
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 VALIDACIÓN DE RUTAS DE BASE DE DATOS\n');

// ─── RUTAS ESPERADAS ───
const expectedPaths = {
  'DB Root': path.join(process.cwd(), 'db'),
  'Grupos Clonados': path.join(process.cwd(), 'db', 'grupos_clonados'),
  'Current Cwd': process.cwd(),
};

console.log('📍 Rutas identificadas:\n');
for (const [name, route] of Object.entries(expectedPaths)) {
  console.log(`   ${name}:`);
  console.log(`   → ${route}`);
  
  if (fs.existsSync(route)) {
    console.log(`   ✅ EXISTE\n`);
  } else {
    console.log(`   ❌ NO EXISTE\n`);
  }
}

// ─── CREAR ESTRUCTURA SI NO EXISTE ───
const dbDir = path.join(process.cwd(), 'db', 'grupos_clonados');
if (!fs.existsSync(dbDir)) {
  console.log('🔧 Creando estructura de directorios...\n');
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`✅ Creado: ${dbDir}\n`);
}

// ─── VERIFICAR ARCHIVOS EXISTENTES ───
console.log('📋 Archivos en db/grupos_clonados/:\n');
const files = fs.readdirSync(dbDir);
if (files.length === 0) {
  console.log('   (vacío - esperando primeros datos de SPY/ORDER)\n');
} else {
  for (const file of files) {
    const filePath = path.join(dbDir, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    console.log(`   📄 ${file} (${size} bytes)`);
  }
  console.log();
}

// ─── VERIFICAR PERMISOS ───
console.log('🔐 Verificando permisos:\n');
try {
  const testFile = path.join(dbDir, '.write-test');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log(`   ✅ Permisos de escritura: OK\n`);
} catch (err) {
  console.log(`   ❌ Error de permisos: ${err.message}\n`);
}

// ─── VALIDAR RUTAS EN CÓDIGO ───
console.log('🔗 Validación de rutas en código:\n');

const routeChecks = [
  {
    name: 'CLONADOR/utils/clonador.js',
    path: path.join(process.cwd(), 'CLONADOR', 'utils', 'clonador.js'),
    expectRoute: path.join(process.cwd(), 'db', 'grupos_clonados'),
  },
  {
    name: 'plugins/invo.js',
    path: path.join(process.cwd(), 'plugins', 'invo.js'),
    expectRoute: path.join(process.cwd(), 'db', 'grupos_clonados'),
  },
  {
    name: 'plugins/order.js',
    path: path.join(process.cwd(), 'plugins', 'order.js'),
    expectRoute: 'db/grupos_clonados/recupera2.json',
  },
];

for (const check of routeChecks) {
  try {
    const content = fs.readFileSync(check.path, 'utf-8');
    let found = false;
    let routeInCode = 'NOT FOUND';
    
    if (check.name === 'CLONADOR/utils/clonador.js') {
      const match = content.match(/process\.cwd\(\),\s*'db',\s*'grupos_clonados'/);
      if (match) {
        found = true;
        routeInCode = `process.cwd() + '/db/grupos_clonados'`;
      }
    } else if (check.name === 'plugins/invo.js') {
      const match = content.match(/process\.cwd\(\),\s*'db',\s*'grupos_clonados'/);
      if (match) {
        found = true;
        routeInCode = `process.cwd() + '/db/grupos_clonados'`;
      }
    } else if (check.name === 'plugins/order.js') {
      const match = content.match(/'db\/grupos_clonados\/recupera2\.json'/);
      if (match) {
        found = true;
        routeInCode = "db/grupos_clonados/recupera2.json";
      }
    }
    
    console.log(`   ${check.name}:`);
    if (found) {
      console.log(`   ✅ Usando ruta unificada\n`);
    } else {
      console.log(`   ⚠️  Podría estar usando ruta diferente\n`);
    }
  } catch (err) {
    console.log(`   ❌ No se pudo leer: ${err.message}\n`);
  }
}

console.log('═════════════════════════════════════════');
console.log('✅ VALIDACIÓN COMPLETADA');
console.log('═════════════════════════════════════════\n');
console.log('💡 Si .invo aún no funciona:');
console.log('   1. Verifica que existan archivos en db/grupos_clonados/');
console.log('   2. Usa .order para capturar números primero');
console.log('   3. Luego usa .invo <número> para invitar');
