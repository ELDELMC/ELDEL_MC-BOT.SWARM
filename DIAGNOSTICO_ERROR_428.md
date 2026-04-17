# 🔴 Diagnóstico y Solución: Error 428 - Connection Terminated

## Fecha del Análisis
**17 de Abril de 2026** - Bot iniciado en modo producción con 2 sesiones

---

## ❌ El Problema

El bot genera correctamente los códigos de pairing pero **la conexión WebSocket se cierra inmediatamente** con error **428 (Connection Terminated)**.

### Síntomas Observados:

```
[16:59:24] ✅ Pairing code generated: PNLT-386R
[16:59:24] [CONNECTION UPDATE] connection: close
[16:59:24] ⚠️ Cerrada. Código: 428, Error: Connection Terminated
[16:59:24] ⚠️ Reintentando sin borrar sesión (delay: 60s)...
[17:00:24] ✅ Pairing code generated: BTLZ-QL1V  ← Reintentos infinitos
[17:00:24] [CONNECTION UPDATE] connection: close
[17:00:24] ⚠️ Cerrada. Código: 428, Error: Connection Terminated
```

**El ciclo se repite indefinidamente cada 60 segundos.**

---

## 🔍 Causas Raíz Identificadas

| # | Causa | Probabilidad | Validación |
|----|-------|-------------|-----------|
| 1️⃣ | **Número no existe o no está activo en WhatsApp** | 🔴 **ALTA** | Verificar que `573188774061` está vinculado a WhatsApp |
| 2️⃣ | **Firewall/Proxy bloqueando conexión WebSocket** | 🟡 **MEDIA** | Verificar conectividad a `ws.whatsapp.com` |
| 3️⃣ | **Versión Baileys obsoleta o incompatible** | 🟡 **MEDIA** | Usar `@whiskeysockets/baileys@latest` en lugar de RC |
| 4️⃣ | **Rate limiting de WhatsApp** | 🟡 **MEDIA** | Espaciar intentos (mín. 5 min entre intentos) |
| 5️⃣ | **Session tokens expirados o corruptos** | 🟢 **BAJA** | Limpiar carpeta `sessions/` antes de reintentar |

---

## ✅ Mejoras Implementadas en el Código

### 1. **Backoff Exponencial para Pairing** ⏱️
- **Antes:** Reintentos cada 60s indefinidamente
- **Después:** Backoff exponencial que aumenta: 120s → 216s → 388s → ...máx 10 min

```javascript
// Nueva función en SessionManager.js
_calculateBackoffForPairing(sessionIndex, statusCode) {
    const baseDelays = {
        428: 120000,  // 2 min inicial
    };
    // Backoff: delay * 1.8^attempt (máximo 10 minutos)
    return Math.min(baseDelay * Math.pow(1.8, pairingAttempts - 1), 600000);
}
```

### 2. **Límite de Reintentos** 🛑
- **Antes:** Reintentos infinitos
- **Después:** Máximo 8 intentos fallidos de pairing antes de pausar

```javascript
const maxPairingAttempts = 8;
if (pairingAttempts >= maxPairingAttempts) {
    log('error', `Límite de reintentos alcanzado. Paused.`);
    this.awaitingPairing.add(sessionIndex);  // ← Requiere intervención manual
}
```

### 3. **Limpieza de Locks Residuales** 🧹
- Elimina locks viejos (>10 min) al iniciar
- Previene que crashes previos bloqueen nuevos intentos

```javascript
_cleanupStaleLocks() {
    // Limpia locks de sesiones de hace >10 minutos
    // Evita que bloquee la inicialización
}
```

---

## 🎯 Pasos para Resolver El Problema

### **Paso 1: Validar el Número de Teléfono**

```bash
# Verificar que el número 573188774061 está activo en WhatsApp:
# 1. Intenta enviar un mensaje desde la aplicación de WhatsApp
# 2. Verifica que aparece "En línea" en el perfil
# 3. Si NO tiene WhatsApp, instálalo primero
```

**Problemas comunes:**
- ❌ Número no registrado en WhatsApp
- ❌ Cuenta desactivada/suspendida
- ❌ Número asociado a otra cuenta
- ❌ WhatsApp no actualizado

---

### **Paso 2: Limpiar Sesiones Viejas**

```bash
# Eliminar archivos residuales de intentos fallidos
rm -rf sessions/session-1
rm -rf sessions/session-2

# Opcional: Limpiar todo
rm -rf sessions/
```

---

### **Paso 3: Actualizar Dependencias**

```bash
# Actualizar Baileys a la versión más reciente (no RC)
npm install @whiskeysockets/baileys@latest

# Opcional: Actualizar todas las dependencias
npm install
```

**Versión actual (PROBLEMA):**
```json
"@whiskeysockets/baileys": "^7.0.0-rc.9"  // RC = Release Candidate
```

**Versión recomendada:**
```json
"@whiskeysockets/baileys": "^7.0.0"  // Versión estable
```

---

### **Paso 4: Configurar Números Válidos**

En `.env`, verifica que los números sean completamente válidos:

```bash
OWNER_NUMBER=573188774061      # ← Validar este número
BOT_ROTO=573117329903          # ← Y este también
PERSONAL=573188774061

# Requisitos:
# ✅ Formato: código país + operador + número (sin espacios)
# ✅ El número debe tener WhatsApp activo
# ✅ No puede ser un número duplicado en otra sesión
```

---

### **Paso 5: Esperar Entre Intentos**

El nuevo sistema de backoff hace esto automáticamente, pero:

```
Manual: Espera MÍNIMO 5 minutos entre intentos de pairing
Automático: El bot ahora espera 2 min → 3.6 min → 6.5 min → ...
```

---

### **Paso 6: Monitorear Intentos**

Después de reiniciar, busca estos mensajes:

```
✅ BUENA SEÑAL:
[17:05:00] [S1] ✅ Pairing code generated: ABCD-EFGH
[17:05:15] [S1] ✅ CONECTADA! Teléfono: 573188774061

❌ MALA SEÑAL (ver diagnóstico arriba):
[17:05:00] [S1] ✅ Pairing code generated: ABCD-EFGH
[17:05:01] [S1] ⚠️ Cerrada. Código: 428
[17:07:01] [S1] ✅ Pairing code generated: IJKL-MNOP  ← Reintento 2
```

---

## 📊 Cambios de Comportamiento Post-Implementación

### Antes (PROBLEMA) ❌
```
Intento 1: 60s delay
Intento 2: 60s delay
Intento 3: 60s delay  ← Infinito
...reintentos cada 60s para siempre
```

### Después (CORRECCIÓN) ✅
```
Intento 1 (falla): esperar 120s
Intento 2 (falla): esperar 216s (1.8x)
Intento 3 (falla): esperar 388s (1.8x)
Intento 4 (falla): esperar 698s (1.8x)
...
Intento 8 (falla): PAUSED - requiere intervención manual
```

**Beneficios:**
- ✅ No sobre-carga los servidores de WhatsApp
- ✅ Evita rate-limiting permanente
- ✅ Alerta clara cuando debe intervenir manualmente
- ✅ Limpia locks viejos automáticamente

---

## 🔧 Cambios Implementados en el Código

### Archivos Modificados:
- **`core/SessionManager.js`**
  - ✅ Nueva función: `_calculateBackoffForPairing()`
  - ✅ Nueva función: `_cleanupStaleLocks()`
  - ✅ Modificado: `_getReconnectDelay()` - ahora usa backoff exponencial para pairing
  - ✅ Agregado límite de reintentos (máx 8) antes de pausar

### Líneas de Código:
```javascript
// Función nueva (pairing backoff)
_calculateBackoffForPairing(sessionIndex, statusCode) {
    const baseDelay = 120000; // 2 min
    const exponentialDelay = Math.min(
        baseDelay * Math.pow(1.8, pairingAttempts - 1),
        600000  // 10 min máximo
    );
    return exponentialDelay;
}

// Control de límite
if (pairingAttempts >= 8) {
    log('error', `Límite alcanzado. Paused.`);
    this.awaitingPairing.add(sessionIndex);
    return;
}
```

---

## ❓ FAQ

**P: ¿Por qué el error 428 sucede tan rápido?**
A: El número WhatsApp no está activo o no existe. La conexión WebSocket se rechaza.

**P: ¿Cuánto tiempo espero antes de reintentar?**
A: Mínimo 10 minutos. El sistema ahora espacia automáticamente: 2 → 3.6 → 6.5 → ... min

**P: ¿Cómo sé si está funcionando?**
A: Busca en logs: `✅ CONECTADA! Teléfono:` o `🎉 CONECTADA!`

**P: ¿Qué hago si no funciona después de 8 intentos?**
A: Verifica que el número tiene WhatsApp activo, actualiza Baileys, y limpia `sessions/`

**P: ¿Puedo forzar un reintento manual?**
A: Sí: elimina `sessions/session-1/` y reinicia el bot con `npm start`

---

## 📋 Resumen de Acciones Recomendadas

1. **INMEDIATO:** Verifica que `573188774061` tiene WhatsApp activo
2. **Opcional:** `npm install @whiskeysockets/baileys@latest`
3. **CLI:** `rm -rf sessions/session-*` para limpiar
4. **Reinicia:** `npm start`
5. **Espera:** 10-15 minutos y revisa logs
6. **Si aún falla:** Contacta support con logs de error

---

## 📞 Contacto / Debugging

Si el problema persiste después de hacer los pasos anteriores:

1. Obtén el último error:
   ```bash
   npm start 2>&1 | tail -100
   ```

2. Comparte:
   - Logs completos (primeras 10 líneas de error)
   - Versión de Node.js: `node --version`
   - Variables de entorno (sin números sensibles)

3. Verifica estado de Baileys:
   ```bash
   npm list @whiskeysockets/baileys
   ```

---

**Documento generado:** 2026-04-17  
**Versión del Bot:** juanchote-swarm@1.0.0  
**Last Updated:** Implementación de backoff exponencial y límite de reintentos
