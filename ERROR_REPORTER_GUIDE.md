# 🚨 Sistema de Automonitoreo y Reporte de Errores

## Descripción General

Se ha implementado un sistema completo y automático de captura, registro y reporte de errores para tu bot multi-sesión.

El sistema captura:
- ✅ Excepciones no capturadas (`uncaughtException`)
- ✅ Promesas rechazadas sin manejo (`unhandledRejection`)
- ✅ Desconexiones de sesión con errores críticos
- ✅ Errores de conexión de WhatsApp

**Característica clave:** Los errores se envían automáticamente a la otra sesión (nunca a la sesión que los generó), evitando patrones detectables de bot.

---

## Archivos Creados / Modificados

### ✨ Nuevos Módulos

#### `core/ErrorReporter.js`
**Módulo principal** que gestiona:
- Captura e almacenamiento de errores
- Lógica de enrutamiento (cuál sesión reporta)
- Envío de mensajes vía WhatsApp
- Registro persistente en `data/error_log.json`

**Métodos públicos:**
```javascript
async sendErrorReport(errorMsg, errorType, sourceSessionIndex, metadata)
async handleUncaughtException(err, sourceSessionIndex)
async handleUnhandledRejection(reason, promise, sourceSessionIndex)
async handleSessionDisconnection(sessionIndex, error, reconnectAttempts)
async handleCriticalError(title, description, sourceSessionIndex, details)
```

#### `core/ErrorFormatter.js`
**Utilidad** para formatear errores de forma legible:
- Extrae ubicación del error (archivo, línea)
- Genera sugerencias inteligentes para errores comunes
- Formatea con emojis e headers para WhatsApp
- Trunca errores muy largos automáticamente

### 🔄 Modificaciones Existentes

#### `index.js`
- Agregó importación de `ErrorReporter`
- Reemplazó handlers básicos de error con versiones que reportan
- Añadió flag `errorHandlerReady` para activar reporte solo cuando sesiones están listas
- Agregó protección contra múltiples envíos durante shutdown

#### `core/SessionManager.js`
- Agregó importación de `ErrorReporter`
- Agregó Map `reconnectionAttempts` para trackear intentos de reconexión
- Integró llamada a `errorReporter.handleSessionDisconnection()` en `_handleConnectionUpdate`
- Resetea contador de intentos al reconectarse exitosamente

---

## Flujo de Funcionamiento

### 1️⃣ Captura de Errores Globales

```
Programa → Error Global
           ↓
       ¿ErrorHandlerReady?
       ├─ SÍ → ErrorReporter.sendErrorReport()
       └─ NO → Log local solo
```

### 2️⃣ Lógica de Enrutamiento

```
Error detectado en S1
↓
¿Hay otra sesión conectada?
├─ SÍ (S2) → Enviar a S2
└─ NO → S1 lo envía a su propio número (como fallback)
```

### 3️⃣ Formato del Mensaje

Cada reporte contiene:
```
🔥 EXCEPCIÓN NO CAPTURADA
═════════════════════════

📱 Origen: Session 1
📋 ID: S1
🕐 Hora: 09/04/2026 14:35:22

📍 Ubicación del Error:
  • Archivo: CommandHandler.js
  • Línea: 156

📄 Detalle del Error:
Cannot read property 'message' of undefined
at CommandHandler.execute (CommandHandler.js:156:12)
...

💡 Causa: Promise sin manejo de error. Revisar logs.

═════════════════════════
✅ Bot monitoreando...
```

### 4️⃣ Persistencia

Todos los errores se registran en `data/error_log.json`:
```json
[
  {
    "timestamp": "2026-04-09T14:35:22.123Z",
    "errorType": "uncaughtException",
    "message": "Cannot read property...",
    "sourceSession": 1,
    "reportingSession": 2,
    "targetSession": 1,
    "status": "SENT"
  }
]
```

---

## Casos de Uso

### Caso 1: Una sesión tiene error, la otra está conectada
```
Session 1 → Error (uncaughtException)
Session 2 → Conectada
Resultado: ✅ Mensaje enviado de S2 a S1
```

### Caso 2: Una sesión se desconecta
```
Session 2 → Desconexión (status 401)
Session 1 → Conectada
Resultado: ✅ Reporte enviado de S1 a S2
```

### Caso 3: Las dos sesiones caen
```
Session 1 → Error crítico
Session 2 → Desconectada
Resultado: ⚠️ Error registrado localmente (sin envío)
           Bot entra en recuperación
```

---

## Configuración

### Variables de Entorno (Heredadas)

El sistema usa configuración existente:
- `SESSION_COUNT`: Número de sesiones (por defecto: 2)
- `TIMEZONE`: Zona horaria para timestamps
- `DEVICE_NAMES`: Nombres de dispositivos en reportes
- `PAIRING_NUMBERS`: Números de teléfono de cada sesión

### Ubicaciones Importantes

| Archivo | Propósito |
|---------|-----------|
| `data/error_log.json` | Historial persistente de errores |
| `core/ErrorReporter.js` | Lógica principal de reporte |
| `core/ErrorFormatter.js` | Formato de mensajes |

---

## Monitoreo y Debugging

### Ver Errores Almacenados

```bash
# Último error más reciente
tail -30 data/error_log.json | jq '[-1]'

# Últimos 10 errores
cat data/error_log.json | jq '.[-10:]'

# Filtrar por tipo
cat data/error_log.json | jq '.[] | select(.errorType == "sessionDisconnection")'
```

### Logs en Terminal

```
[ERROR] 🔥 UNCAUGHT EXCEPTION: Cannot read property...
[INFO] 📤 Sending error report to S2 (573001234567)
[SUCCESS] ✅ Error report sent successfully
```

### Desactivar Reportes Temporalmente

Si necesitas desactivar reportes sin comentar código:

```javascript
// En index.js, comentar esta línea:
// errorHandlerReady = true;
```

---

## Errores Que Se Reportan

### Automáticos
- ✅ `uncaughtException` - Excepciones no manejadas
- ✅ `unhandledRejection` - Promesas sin catch
- ✅ Desconexiones con codes: 401, 404, 440, 515, 428
- ✅ `DisconnectReason.loggedOut` - Sesión cerrada
- ✅ `DisconnectReason.restartRequired` - Requiere reinicio

### Manuales (Puedes llamar desde tu código)

```javascript
import errorReporter from './core/ErrorReporter.js';

// Error crítico personalizado
await errorReporter.handleCriticalError(
  'Database Connection Failed',
  'Could not connect to MongoDB after 3 attempts',
  sessionIndex,
  { database: 'MongoDB', attempts: 3 }
);
```

---

## Limitaciones y Consideraciones

⚠️ **Importante:**
1. Las sesiones deben tener números de WhatsApp válidos
2. El reporte solo funciona cuando al menos 1 sesión está conectada
3. Si ambas sesiones caen, solo hay registro local
4. Máximo 500 errores guardados (se rotan automáticamente)
5. Los reportes se deduplican (mismo error en 1 segundo no se envía dos veces)

---

## Testing / Prueba Manual

Para probar el sistema sin esperar errores reales:

```javascript
// Archivo de prueba: test-error-reporter.js
import errorReporter from './core/ErrorReporter.js';

// Simular error
await errorReporter.handleCriticalError(
  'TEST ERROR',
  'This is a test error report',
  1,
  { test: true }
);
```

Luego ejecutar:
```bash
node test-error-reporter.js
```

---

## Soporte de Errores Inteligentes

El sistema detecta causas comunes y genera sugerencias:

| Error | Sugerencia |
|-------|-----------|
| ECONNREFUSED | Servidor no disponible |
| TIMEOUT | Verificar velocidad de internet |
| Stream Errored | Se intentará reconectar automáticamente |
| Logged Out | Será necesario volver a escanear QR |
| Out of Memory | Se reiniciará el bot |

---

## Próximas Mejoras (Opcional)

- [ ] Dashboard web para visualizar errores
- [ ] Alertas a número de owner si hay 3+ errores en 5 min
- [ ] Backup automático de error_log.json
- [ ] Compresión de logs antiguos
- [ ] Estadísticas de errores por tipo
- [ ] Integración con Discord webhook

---

**¡Sistema listo para monitoreo 24/7!** 🎉
