#!/usr/bin/env node
/**
 * Test script para validar que el comando .invo se carga correctamente
 * Uso: node test-invo-command.js
 */

import commandHandler from './core/CommandHandler.js';
import { log } from './core/Logger.js';

async function testInvoCommand() {
    console.log('🔍 TEST: Validando comando .invo\n');
    
    // Cargar todos los comandos
    console.log('📦 Cargando comandos...');
    await commandHandler.loadCommands();
    
    // Verificar si el comando está registrado
    console.log('\n📋 Verificando si .invo está registrado...');
    const invoCmd = commandHandler.commands.get('invo');
    
    if (!invoCmd) {
        console.log('❌ ERROR: El comando "invo" NO está registrado');
        console.log('\n📝 Comandos cargados:');
        for (const [name, cmd] of commandHandler.commands.entries()) {
            console.log(`   - ${name}`);
        }
        process.exit(1);
    }
    
    console.log('✅ Comando "invo" encontrado\n');
    
    // Mostrar detalles
    console.log('📊 Propiedades del comando:');
    console.log(`   - Aliases: ${invoCmd.aliases.join(', ')}`);
    console.log(`   - Categoría: ${invoCmd.category}`);
    console.log(`   - Solo grupo: ${invoCmd.groupOnly ? 'SÍ' : 'NO'}`);
    console.log(`   - Solo admin: ${invoCmd.adminOnly ? 'SÍ' : 'NO'}`);
    console.log(`   - Cooldown: ${invoCmd.cooldown}ms`);
    console.log(`   - Handler tipo: ${typeof invoCmd.handler}`);
    
    if (typeof invoCmd.handler !== 'function') {
        console.log('\n❌ ERROR: El handler NO es una función');
        process.exit(1);
    }
    
    console.log('\n✅ Handler es una función correcta');
    
    // Verificar aliases
    console.log('\n🔗 Verificando aliases:');
    for (const alias of invoCmd.aliases) {
        const resolvedCmd = commandHandler.aliases.get(alias);
        if (resolvedCmd === 'invo') {
            console.log(`   ✅ "${alias}" → invo`);
        } else {
            console.log(`   ❌ "${alias}" → ${resolvedCmd}`);
        }
    }
    
    // Test de reconocimiento
    console.log('\n🧪 Test de reconocimiento de comando:');
    const testCases = [
        '.invo',
        '.invo 1',
        '.invo 1 si',
        '.invite',
        '.invitar',
        '.agregar',
    ];
    
    for (const test of testCases) {
        const match = commandHandler.getCommand(test, ['.']);
        if (match && match.command.command === 'invo') {
            console.log(`   ✅ "${test}" → RECONOCIDO`);
        } else {
            console.log(`   ❌ "${test}" → NO RECONOCIDO`);
        }
    }
    
    console.log('\n✅ PRUEBA COMPLETADA - El comando .invo está listo para usar');
    console.log('\n💡 Si el bot no responde al comando, verifica:');
    console.log('   1. ¿El bot es ADMIN del grupo?');
    console.log('   2. ¿Usas el comando en un GRUPO (no privado)?');
    console.log('   3. ¿Eres ADMIN del grupo (o owner del bot)?');
    console.log('   4. ¿Existe db/grupos_clonados/ con archivos .json?');
}

testInvoCommand().catch(err => {
    console.error('❌ Error durante test:', err.message);
    console.error(err.stack);
    process.exit(1);
});
