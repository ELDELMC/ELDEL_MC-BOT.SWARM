#!/usr/bin/env node
/**
 * Simple test runner: ejecuta todos los archivos root `test-*.js` secuencialmente
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const root = process.cwd();
const files = fs.readdirSync(root).filter(f => f.startsWith('test-') && f.endsWith('.js'));

if (files.length === 0) {
    console.log('No se encontraron archivos de prueba (test-*.js)');
    process.exit(0);
}

let failed = false;
for (const file of files) {
    console.log(`\n=== Ejecutando ${file} ===\n`);
    const res = spawnSync(process.execPath, [path.join(root, file)], {
        stdio: 'inherit',
        env: process.env,
    });

    if (res.status !== 0) {
        console.error(`Test ${file} fallo con código ${res.status}`);
        failed = true;
    } else {
        console.log(`Test ${file} OK`);
    }
}

process.exit(failed ? 1 : 0);
