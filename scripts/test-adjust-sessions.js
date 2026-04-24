#!/usr/bin/env node
/**
 * Test script para verificar `adjustSessionCount` y el watcher `.env`.
 * - Mockea `_startSession` para no abrir conexiones reales.
 * - Prueba aumentar/disminuir sesiones y la reacción del watcher.
 */

import sessionManager from '../core/SessionManager.js';
import { log } from '../core/Logger.js';
import { initEnvWatcher } from '../watchers/envWatcher.js';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('\n=== TEST: adjustSessionCount + envWatcher ===\n');

    // Mock _startSession para no usar Baileys ni sockets reales
    sessionManager._startSession = async function(sessionIndex) {
        log('info', `Mock start S${sessionIndex}`, sessionIndex);
        // Simular socket mínimo
        this.sockets.set(sessionIndex, { user: { id: `${sessionIndex}:mock` } });
        this.connected.set(sessionIndex, true);
        this.everConnected.set(sessionIndex, true);
        return this.sockets.get(sessionIndex);
    };

    // Estado inicial
    console.log('Estado inicial:', sessionManager.getStatus());

    // Aumentar a 3
    console.log('\n-> Ajustando a 3 sesiones (increase)');
    await sessionManager.adjustSessionCount(3);
    console.log('Estado tras increase:', sessionManager.getStatus());

    // Disminuir a 1
    console.log('\n-> Ajustando a 1 sesión (decrease)');
    await sessionManager.adjustSessionCount(1);
    console.log('Estado tras decrease:', sessionManager.getStatus());

    // Preparar watcher: crear .env inicial
    const envPath = path.join(process.cwd(), '.env');
    fs.writeFileSync(envPath, 'SESSION_COUNT=2\n', 'utf-8');
    console.log('\nWrote initial .env with SESSION_COUNT=2');

    // Iniciar watcher
    initEnvWatcher(sessionManager);

    // Cambiar .env a 4 para provocar el watcher
    await new Promise(r => setTimeout(r, 1000));
    fs.writeFileSync(envPath, 'SESSION_COUNT=4\n', 'utf-8');
    console.log('Updated .env to SESSION_COUNT=4');

    // Esperar que el watcher procese el cambio
    await new Promise(r => setTimeout(r, 3500));
    console.log('Estado tras cambio por watcher:', sessionManager.getStatus());

    // Limpieza
    try { fs.unlinkSync(envPath); console.log('Removed temporary .env'); } catch (_) {}

    console.log('\n=== TEST COMPLETE ===\n');
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
