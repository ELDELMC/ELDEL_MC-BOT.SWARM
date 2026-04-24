#!/usr/bin/env node

/**
 * Diagnostic tool for Error 428 (Connection Terminated)
 * Run: node diagnose-428.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n╔═══════════════════════════════════════════════════╗');
console.log('║  ERROR 428 - DIAGNOSTIC TOOL                      ║');
console.log('║  Connection Terminated Issues                     ║');
console.log('╚═══════════════════════════════════════════════════╝\n');

let issues = [];

// 1. Check .env configuration
console.log('📋 Checking .env configuration...');
try {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
        issues.push('❌ .env file not found');
        console.log('  ❌ .env file not found');
    } else {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const ownerMatch = envContent.match(/OWNER_NUMBER=(\d+)/);
        const botRotoMatch = envContent.match(/BOT_ROTO=(\d+)/);
        const personalMatch = envContent.match(/PERSONAL=(\d+)/);
        
        console.log('  ✅ .env exists');
        
        if (ownerMatch) {
            console.log(`     OWNER_NUMBER: ${ownerMatch[1]}`);
            if (ownerMatch[1].length < 10) {
                issues.push(`⚠️ OWNER_NUMBER muy corto: ${ownerMatch[1]} (debe ser ≥10 dígitos)`);
                console.log(`     ⚠️ Demasiado corto (${ownerMatch[1].length} dígitos)`);
            }
        }
        if (botRotoMatch) {
            console.log(`     BOT_ROTO: ${botRotoMatch[1]}`);
            if (botRotoMatch[1].length < 10) {
                issues.push(`⚠️ BOT_ROTO muy corto: ${botRotoMatch[1]}`);
                console.log(`     ⚠️ Demasiado corto (${botRotoMatch[1].length} dígitos)`);
            }
        }
        if (personalMatch) {
            console.log(`     PERSONAL: ${personalMatch[1]}`);
        }
    }
} catch (err) {
    issues.push(`❌ Error reading .env: ${err.message}`);
    console.log(`  ❌ Error: ${err.message}`);
}

// 2. Check sessions directory
console.log('\n📁 Checking sessions directory...');
try {
    const sessionsPath = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sessionsPath)) {
        console.log('  ℹ️  sessions/ does not exist (will be created on first start)');
    } else {
        const folders = fs.readdirSync(sessionsPath);
        console.log(`  ✅ sessions/ exists with ${folders.length} subfolder(s)`);
        
        for (const folder of folders) {
            if (!folder.startsWith('session-')) continue;
            
            const folderPath = path.join(sessionsPath, folder);
            const credsPath = path.join(folderPath, 'creds.json');
            const lockPath = path.join(folderPath, '.session.lock');
            
            console.log(`     📦 ${folder}:`);
            
            if (fs.existsSync(credsPath)) {
                try {
                    const stats = fs.statSync(credsPath);
                    const creds = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
                    console.log(`        ✅ creds.json (${(stats.size/1024).toFixed(1)}KB, registered: ${creds.registered === true})`);
                } catch (_) {
                    issues.push(`⚠️ ${folder}/creds.json is corrupted`);
                    console.log(`        ❌ creds.json is CORRUPTED`);
                }
            } else {
                console.log(`        ℹ️  creds.json not found (first pairing)`);
            }
            
            if (fs.existsSync(lockPath)) {
                try {
                    const lockData = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
                    const age = (Date.now() - lockData.timestamp) / 1000 / 60;
                    
                    if (age > 10) {
                        issues.push(`⚠️ ${folder} has stale lock (${age.toFixed(0)}min old)`);
                        console.log(`        ⚠️ STALE LOCK (${age.toFixed(0)}min old) - will be cleaned on next start`);
                    } else {
                        console.log(`        🔒 Lock (${age.toFixed(0)}min old)`);
                    }
                } catch (_) {
                    issues.push(`⚠️ ${folder}/.session.lock is corrupted`);
                    console.log(`        ❌ Lock file is corrupted`);
                }
            }
        }
    }
} catch (err) {
    issues.push(`❌ Error checking sessions: ${err.message}`);
    console.log(`  ❌ Error: ${err.message}`);
}

// 3. Check Node.js and dependencies
console.log('\n🔧 Checking dependencies...');
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
    const baileysDep = packageJson.dependencies['@whiskeysockets/baileys'];
    
    console.log(`  ✅ Node.js: ${process.version}`);
    console.log(`  Baileys version: ${baileysDep}`);
    
    if (baileysDep.includes('rc')) {
        issues.push('⚠️ Using RC version of Baileys (may be unstable)');
        console.log(`     ⚠️ RC version detected - consider updating to stable`);
    } else {
        console.log(`     ✅ Stable version`);
    }
} catch (err) {
    issues.push(`❌ Error checking dependencies: ${err.message}`);
    console.log(`  ❌ Error: ${err.message}`);
}

// 4. Check MongoDB config
console.log('\n🍃 Checking MongoDB configuration...');
try {
    const configPath = path.join(__dirname, 'config.js');
    if (fs.existsSync(configPath)) {
        console.log('  ✅ config.js exists');
        // We can't easily parse config.js as an import here
    } else {
        issues.push('❌ config.js not found');
        console.log('  ❌ config.js not found');
    }
} catch (err) {
    console.log(`  ℹ️  Cannot check config: ${err.message}`);
}

// Summary
console.log('\n╔═══════════════════════════════════════════════════╗');
console.log('║  DIAGNOSTIC SUMMARY                               ║');
console.log('╚═══════════════════════════════════════════════════╝\n');

if (issues.length === 0) {
    console.log('✅ All checks passed! Bot configuration looks good.\n');
    console.log('💡 If you\'re still seeing Error 428:');
    console.log('   1. Verify the WhatsApp numbers are ACTIVE in WhatsApp');
    console.log('   2. Run: rm -rf sessions/');
    console.log('   3. Run: npm start');
    console.log('   4. Wait 10+ minutes for pairing to succeed\n');
} else {
    console.log(`⚠️  Found ${issues.length} issue(s):\n`);
    issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
    });
    console.log('\n🔧 Recommended fixes:');
    console.log('   1. Clean up sessions: rm -rf sessions/');
    console.log('   2. Update Baileys: npm install @whiskeysockets/baileys@latest');
    console.log('   3. Verify phone numbers are valid and WhatsApp-active');
    console.log('   4. Restart: npm start\n');
}

console.log('📖 Full diagnostic: See DIAGNOSTICO_ERROR_428.md\n');
