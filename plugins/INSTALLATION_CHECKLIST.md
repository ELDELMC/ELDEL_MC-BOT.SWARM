# ✅ CHECKLIST - INSTALACIÓN ERROR REPORTER

Use este checklist para verificar que todo está correctamente instalado.

---

## 📦 VERIFICACIÓN DE ARCHIVOS

### Nuevos archivos (deben existir)

- [ ] `core/ErrorReporter.js` (240 líneas)
  - [ ] Contiene clase `ErrorReporter`
  - [ ] Método `sendErrorReport()`
  - [ ] Método `handleUncaughtException()`
  - [ ] Método `handleUnhandledRejection()`
  - [ ] Método `handleSessionDisconnection()`
  - [ ] Método `handleCriticalError()`

- [ ] `core/ErrorFormatter.js` (130 líneas)
  - [ ] Exporta función `formatErrorReport()`
  - [ ] Contiene `parseErrorStack()`
  - [ ] Contiene `getSuggestion()`
  - [ ] Contiene `formatTimestamp()`

- [ ] `ERROR_REPORTER_GUIDE.md`
  - [ ] Descripción del sistema
  - [ ] Casos de uso
  - [ ] Configuración

- [ ] `ERROR_REPORTER_USAGE.js`
  - [ ] Ejemplos de código
  - [ ] Patrones de uso
  - [ ] Documentación de métodos

- [ ] `test-error-reporter.js`
  - [ ] Script ejecutable
  - [ ] Verifica sesiones
  - [ ] Envía error de prueba

- [ ] `SETUP_ERROR_REPORTER.md`
  - [ ] Pasos de configuración
  - [ ] Guía de prueba
  - [ ] Troubleshooting

- [ ] `CHANGES_SUMMARY.md`
  - [ ] Resumen de cambios
  - [ ] Líneas modificadas
  - [ ] Comportamiento antes/después

### Archivos modificados (verificar cambios)

- [ ] `index.js`
  - [ ] Línea ~17: Importa `errorReporter`
  - [ ] Línea ~18-20: Define `errorHandlerReady` y `isShuttingDown`
  - [ ] Línea ~22-30: Handler de `unhandledRejection` actualizado
  - [ ] Línea ~32-48: Handler de `uncaughtException` actualizado
  - [ ] Línea ~205: Activa `errorHandlerReady = true;`

- [ ] `core/SessionManager.js`
  - [ ] Línea ~32: Importa `errorReporter`
  - [ ] Línea ~46: Añade `this.reconnectionAttempts = new Map();`
  - [ ] Línea ~412: `this.reconnectionAttempts.delete(sessionIndex);`
  - [ ] Línea ~438-452: Sección de "REPORT SIGNIFICANT DISCONNECTIONS"
  - [ ] Línea ~467: Reset de contador en errores críticos

---

## 🔍 VERIFICACIÓN DE CÓDIGO

### En `index.js`

```bash
# Verificar importación
grep -n "import errorReporter" index.js
# Esperado: "import errorReporter from './core/ErrorReporter.js';"

# Verificar flags
grep -n "errorHandlerReady\|isShuttingDown" index.js
# Esperado: Encontrados en handlers de error

# Verificar activación
grep -n "errorHandlerReady = true" index.js
# Esperado: Encontrado después de sessionManager.startAll()
```

### En `core/SessionManager.js`

```bash
# Verificar importación
grep -n "import errorReporter" core/SessionManager.js
# Esperado: Importación al lado de otros modules

# Verificar Map de intentos
grep -n "reconnectionAttempts" core/SessionManager.js
# Esperado: 4+ menciones en código

# Verificar reportes de desconexión
grep -n "REPORT SIGNIFICANT DISCONNECTIONS" core/SessionManager.js
# Esperado: Sección encontrada cerca de "connection === 'close'"
```

---

## 🧪 VERIFICACIÓN FUNCIONAL

### Paso 1: Sintaxis
```bash
# No debería haber errores de sintaxis
node -c core/ErrorReporter.js
node -c core/ErrorFormatter.js
node -c index.js
# Esperado: Sin salida (sin errores)
```

### Paso 2: Imports
```bash
# Intentar importar módulos
node -e "import('./core/ErrorReporter.js').then(() => console.log('✓ OK'))"
node -e "import('./core/ErrorFormatter.js').then(() => console.log('✓ OK'))"
# Esperado: Líneas que digan ✓ OK
```

### Paso 3: Bot Startup
```bash
# Iniciar bot normalmente
npm start

# En otro terminal, después de 30 segundos:
# - Verificar que no haya errores de importación
# - Verificar que loga "JUANCHOTE-SWARM is running!"
# - Si hay error de ErrorReporter, revisar imports
```

### Paso 4: Prueba de Error
```bash
# Terminal 1: El bot ejecutándose (npm start)
# Terminal 2: Ejecutar test
node test-error-reporter.js

# Esperado:
# - ✅ Shows connected sessions
# - ✅ "Error report sent successfully!"
# - ✅ Un mensaje en WhatsApp
```

### Paso 5: Verificar Error Log
```bash
# Ver error log creado
cat data/error_log.json | jq . | head -20

# Esperado:
# - Archivo existe
# - Contiene array JSON
# - Cada entrada tiene: timestamp, errorType, status, etc.
```

---

## 🔧 CONFIGURACIÓN

### Variables de Entorno Requeridas

- [ ] SESSION_COUNT (default: 2)
- [ ] PAIRING_NUMBERS (al menos 2 números)
- [ ] TIMEZONE (default: America/Bogota)

Verificar en `.env`:
```bash
grep "SESSION_COUNT\|PAIRING_NUMBERS\|TIMEZONE" .env
```

---

## 📊 DATOS CREADOS

- [ ] `data/error_log.json` (creado automáticamente)
  - [ ] Archivo JSON válido
  - [ ] Array vacío `[]` al inicio
  - [ ] Permisos de lectura/escritura

---

## 🚀 ANTES DE PRODUCCIÓN

### Seguridad
- [ ] Revisar que no haya números de teléfono en logs (se truncan automáticamente)
- [ ] Verificar que error_log.json no sea accesible públicamente
- [ ] Revisar CHANGES_SUMMARY.md para cambios críticos

### Performance
- [ ] Ejecutar bot durante 5+ minutos sin errores
- [ ] Revisar uso de memoria (no debe aumentar)
- [ ] Verificar latencia de mensajes (no debe cambiar)

### Funcionalidad
- [ ] Ejecutar `test-error-reporter.js` exitosamente
- [ ] Recibir mensaje en WhatsApp
- [ ] Verificar que error_log.json se actualiza

---

## ❌ TROUBLESHOOTING DURANTE VERIFICACIÓN

### Error: "Cannot find module 'ErrorReporter'"
**Causa:** Import incorrecto
**Solución:**
```bash
# Verificar ruta
ls -la core/ErrorReporter.js

# Verificar import en index.js
head -20 index.js | grep ErrorReporter

# Debe ser:
# import errorReporter from './core/ErrorReporter.js';
```

### Error: "sessionManager is not defined"
**Causa:** ErrorReporter necesita sessionManager
**Solución:**
```bash
# sessionManager se importa en ErrorReporter
grep "import sessionManager" core/ErrorReporter.js
# Debe encontrarse
```

### No llega mensaje a WhatsApp
**Causa:** Sesiones no conectadas o números inválidos
**Solución:**
```bash
# Ver status de sesiones
npm start
# Esperar a que diga "JUANCHOTE-SWARM is running!"
# Verificar que ambas sesiones muestren "CONECTADA!"

# Revisar error_log.json
cat data/error_log.json | jq '.[-1]'
# Si status es "NO_SESSIONS_AVAILABLE" → sesiones no conectadas
# Si status es "SEND_FAILED" → revisar teléfono de destino
```

### Script test falla
**Causa:** Bot no iniciado
**Solución:**
```bash
# Terminal 1: Iniciar bot
npm start
# Esperar 30 segundos

# Terminal 2: Ejecutar test
node test-error-reporter.js
```

---

## 📋 VERIFICACIÓN FINAL

Una vez completados todos los puntos:

- [ ] Todos los archivos existen
- [ ] Importaciones funcionan sin errores
- [ ] Bot inicia sin errores adicionales
- [ ] test-error-reporter.js se ejecuta exitosamente
- [ ] Mensaje llega a WhatsApp
- [ ] data/error_log.json se crea y actualiza
- [ ] Puedes ver errores con: `cat data/error_log.json | jq`

---

## ✨ INSTALACIÓN COMPLETADA

Si todos los puntos están marcados ✅, tu sistema está **100% listo** para producción.

**Próximo paso:** Leer [SETUP_ERROR_REPORTER.md](SETUP_ERROR_REPORTER.md)
