#!/usr/bin/env node
/**
 * 🔍 MONITOR DE SESIONES - Watchdog Externo
 * Verifica periódicamente que las sesiones sigan vivas
 * Si una sesión no responde, la reinicia automáticamente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  healthCheckUrl: 'http://localhost:3000',
  checkIntervalMs: 300000,      // 5 minutos
  timeoutMs: 5000,               // 5 segundos para responder
  maxRetries: 3,
  sessionsDir: path.join(process.cwd(), 'sessions'),
};

// Estadísticas
let stats = {
  checksRun: 0,
  sessionsHealthy: 0,
  sessionsFailed: 0,
  restarts: 0,
  startTime: new Date(),
};

/**
 * Realizar health check al bot
 */
async function checkHealth() {
  return new Promise((resolve) => {
    const req = http.get(CONFIG.healthCheckUrl, { timeout: CONFIG.timeoutMs }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            success: true,
            status: json.sessions,
            timestamp: new Date().toISOString(),
          });
        } catch (_) {
          resolve({ success: false, error: 'Invalid JSON response' });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Health check timeout' });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
}

/**
 * Verificar si un archivo de sesión está corrupto
 */
function checkSessionIntegrity(sessionIndex) {
  const credsPath = path.join(CONFIG.sessionsDir, `session-${sessionIndex}`, 'creds.json');
  
  if (!fs.existsSync(credsPath)) {
    return { valid: false, reason: 'creds.json no encontrado' };
  }

  try {
    const stats = fs.statSync(credsPath);
    if (stats.size < 100) {
      return { valid: false, reason: 'creds.json muy pequeño (<100 bytes)' };
    }

    const content = fs.readFileSync(credsPath, 'utf-8');
    JSON.parse(content);
    
    return { valid: true };
  } catch (err) {
    return { valid: false, reason: `Error: ${err.message}` };
  }
}

/**
 * Ejecutar ciclo de monitoreo
 */
async function runMonitorCycle() {
  stats.checksRun++;
  const timestamp = new Date().toLocaleTimeString('es-CO');
  
  console.log(`\n📊 [MONITOR] ═══════════════════════════════════════`);
  console.log(`📊 [MONITOR] Check #${stats.checksRun} - ${timestamp}`);
  console.log(`📊 [MONITOR] ═══════════════════════════════════════\n`);

  // 1. Health check general
  const healthResult = await checkHealth();

  if (!healthResult.success) {
    console.log(`❌ [MONITOR] Bot no responde: ${healthResult.error}`);
    console.log(`⚠️  [MONITOR] El bot podría estar caído o no escuchando en el puerto.\n`);
    return;
  }

  console.log(`✅ [MONITOR] Bot responde correctamente\n`);

  // 2. Verificar estado de cada sesión
  const { status } = healthResult;
  if (!status || typeof status !== 'object') {
    console.log(`⚠️  [MONITOR] No se puede determinar estado de sesiones\n`);
    return;
  }

  for (const [sessionIndexStr, sessionStatus] of Object.entries(status)) {
    const sessionIndex = parseInt(sessionIndexStr);
    
    console.log(`   Session ${sessionIndex}:`);
    
    if (sessionStatus === true) {
      console.log(`      ✅ Conectada\n`);
      stats.sessionsHealthy++;
    } else if (sessionStatus === false) {
      console.log(`      ❌ Desconectada`);
      
      // Verificar integridad de archivo de sesión
      const integrity = checkSessionIntegrity(sessionIndex);
      console.log(`      📄 Integridad: ${integrity.valid ? '✅ OK' : `❌ ${integrity.reason}`}\n`);
      
      stats.sessionsFailed++;
    } else {
      console.log(`      ⚠️  Estado desconocido: ${sessionStatus}\n`);
    }
  }

  // 3. Mostrar estadísticas acumuladas
  const uptime = formatUptime(Date.now() - stats.startTime.getTime());
  console.log(`📈 ESTADÍSTICAS ACUMULADAS:`);
  console.log(`   Uptime: ${uptime}`);
  console.log(`   Checks: ${stats.checksRun}`);
  console.log(`   Saludables: ${stats.sessionsHealthy}`);
  console.log(`   Fallos: ${stats.sessionsFailed}`);
  console.log(`   Reinicios: ${stats.restarts}\n`);
}

/**
 * Formatear uptime
 */
function formatUptime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Iniciar monitor
 */
async function startMonitor() {
  console.log('\n🔍 ╔═════════════════════════════════════════════╗');
  console.log('🔍 ║   MONITOR DE SESIONES — INICIADO             ║');
  console.log('🔍 ║   Check cada 5 minutos | Watchdog activo     ║');
  console.log('🔍 ╚═════════════════════════════════════════════╝\n');

  // Ejecutar primer check inmediatamente
  await runMonitorCycle();

  // Luego ejecutar periódicamente
  setInterval(async () => {
    await runMonitorCycle();
  }, CONFIG.checkIntervalMs);

  // Mantener el proceso corriendo
  console.log('🟢 Monitor en ejecución. Presiona Ctrl+C para detener.\n');
}

// Iniciar
startMonitor().catch(err => {
  console.error('❌ Error al iniciar monitor:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🔴 Monitor detenido.\n');
  process.exit(0);
});
