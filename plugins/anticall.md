# 🚫 Comando ANTICALL

## Información General

**Comando:** `.anticall`
**Aliases:** `no-llamadas`, `bloquear-llamadas`
**Categoría:** Seguridad / Moderación
**Descripción:** Rechaza automáticamente llamadas y banea al usuario que intenta llamar

**Estado:** ❌ No Implementado (Pendiente)

---

## 👥 Permisos Requeridos

| Rol | Puede Ejecutar |
|-----|---|
| **Usuarios Comunes** | ❌ No |
| **Administradores del Grupo** | ✅ Habilitar/Deshabilitar |
| **Creador del Bot** | ✅ Sí |

---

## 📋 Funcionalidad Técnica

### Descripción Detallada
Sistema automático que detecta intentos de llamadas (voz/video) y rechaza automáticamente, además de banear al usuario. Útil para evitar interrupciones no deseadas.

### Cómo Funciona
1. Sistema de escucha en evento `call`
2. Cuando detecta llamada:
   - Rechaza automáticamente la llamada
   - Agrega usuario a lista de baneados
   - Opcionalmente envía advertencia
3. El usuario queda baneado de usar comandos del bot

### Archivos Afectados
- `db/banned.json` - Usuarios baneados por anticall
- `core/spyEvent.js` - Detector de eventos de llamada

---

## 🔧 Uso

### Sintaxis
```
.anticall [on|off]
```

### Ejemplos
```
.anticall on      ← Habilitar anti-llamadas
.anticall off     ← Deshabilitar anti-llamadas
.anticall         ← Ver estado actual
```

### Respuesta del Bot
✅ **Éxito (Habilitado):**
```
✅ Anti-llamadas: HABILITADO
El bot rechazará automáticamente todas las llamadas.
```

❌ **Éxito (Deshabilitado):**
```
❌ Anti-llamadas: DESHABILITADO
```

**Cuando alguien intenta llamar:**
```
Usuario intentó llamar. Llamada rechazada y usuario baneado.
@Usuario no podrá usar comandos del bot.
```

---

## ⚙️ Configuración Técnica

| Propiedad | Valor |
|-----------|-------|
| **Cooldown** | Evento en tiempo real |
| **Group Only** | No (Global) |
| **Admin Only** | Sí (para habilitar/deshabilitar) |
| **Owner Only** | No |
| **Requiere DB** | Sí |
| **Auto-baneo** | Sí |

---

## 🔗 Dependencias

- `core/spyEvent.js` - Detectar eventos de llamada
- `core/SharedData.js` - Manejo de banned.json
- `core/Formatter.js` - Respuestas

---

## 🔐 Precauciones

- El bot rechaza automáticamente, no interactúa con la llamada
- Usuario baneado puede usar `.unban` si admin desea
- Registrar intentos de llamada en logs
- Notificar al admin sobre intentos de llamada

---

## 📊 Estructura de Datos

Agrega a: `db/banned.json`
```json
[
  "120312345@s.whatsapp.net",
  "120312346@s.whatsapp.net"
]
```

---

## 📝 Notas Adicionales

- Recomendable usar en grupos grandes
- No bloquea mensajes, solo llamadas
- Complementa con `.ban` manual
- Ideal en grupos de trabajo o comunidades grandes
