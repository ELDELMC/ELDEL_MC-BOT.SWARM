#!/usr/bin/env node
/**
 * 🧪 PRUEBA - Verificar funcionamiento de encod/decod de nombres
 */

console.log('\n🧪 PRUEBAS DE CODIFICACIÓN DE NOMBRES\n');
console.log('═══════════════════════════════════════════════\n');

// Casos de prueba
const testCases = [
  '✨sʜɪᴛ🌙',
  'Grupo Normal',
  '【soporte】',
  '«Amigos»',
  'Café ☕',
  '💀 Darkness 💀',
  'Greek: Ελληνικά',
  'Arabic: العربية',
  'Chinese: 中文',
  'Emoji _mix_: 🎉🎊🎈',
  '___Under_Scores___',
  'los_del_flow_pepe',
  'Mix: ñoño_español_🇪🇸',
];

console.log('📝 Probando URL encoding/decoding:\n');

for (const testName of testCases) {
  const encoded = encodeURIComponent(testName);
  const decoded = decodeURIComponent(encoded);
  const isCorrect = decoded === testName;
  const status = isCorrect ? '✅' : '❌';
  
  console.log(`${status} Original: ${testName}`);
  console.log(`   Codificado: ${encoded}`);
  console.log(`   Decodificado: ${decoded}`);
  console.log(`   OK: ${isCorrect}\n`);
}

console.log('═══════════════════════════════════════════════\n');
console.log('✅ Todas las pruebas completadas.\n');
console.log('💡 Los nombres con caracteres especiales se:\n');
console.log('   - GUARDAN como: archivo_%XX%XX%XX.json');
console.log('   - MUESTRAN como: nombre original en logs\n');
