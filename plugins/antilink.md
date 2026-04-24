# 🔗 Comando ANTILINK

## Información General

**Comando:** `.antilink`
**Aliases:** `no-links`, `bloquear-links`
**Categoría:** Seguridad / Moderación
**Descripción:** Elimina automáticamente mensajes con enlaces y opcionalmente expulsa al usuario

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
Sistema automático que detecta mensajes con enlaces (URLs) y los elimina. Opcionalmente puede bannear, mutear o advertir al usuario según configuración.

### Cómo Funciona
1. Escucha todos los mensajes del grupo
2. Detecta patrones de URLs (http://, https://, www., etc.)
3. Acciones configurables:
   - Eliminar mensaje
   - Advertencia (warn)
   - Silenciar (mute)
   - Banear (ban)
4. Registra intentos en logs

### Archivos Afectados
- `db/group_settings.json` - Configuración por grupo
- `db/warnings.json` - Si usa advertencias
- `core/MessageHandler.js` - Validador de mensajes

---

## 🔧 Uso

### Sintaxis
```
.antilink [on|off|warn|kick|mute] [duración]
```

### Ejemplos
```
.antilink on         ← Solo elimina mensajes
.antilink off        ← Deshabilitar
.antilink warn       ← Elimina + Advertencia
.antilink kick       ← Elimina + Expulsa
.antilink mute 30    ← Elimina + Silencia 30 min
```

### Respuesta del Bot
✅ **Éxito (Habilitado):**
```
✅ Anti-enlaces: HABILITADO (Modo: Eliminar)
Se eliminarán todos los mensajes con enlaces.
```

**Cuando se detecta un enlace:**
```
Mensaje eliminado: contiene enlace no permitido.
@Usuario |1/3 advertencias|
```

---

## ⚙️ Configuración Técnica

| Propiedad | Valor |
|-----------|-------|
| **Cooldown** | Evento en tiempo real |
| **Group Only** | Sí |
| **Admin Only** | Sí |
| **Owner Only** | No |
| **Requiere DB** | Sí |
| **Acción por defecto** | Eliminar mensaje |
| **Whitelist** | Admin links permitidos |

---

## 🔗 Dependencias

- `core/MessageHandler.js` - Interceptor de mensajes
- `core/SharedData.js` - Configuración de grupo
- `core/Logger.js` - Registro de eventos

---

## 🔐 Precauciones

- Validar expresiones regulares para URLs
- Permitir enlaces de confianza (whitelist)
- Admin puede enviar enlaces
- Registrar todos los intentos

---

## 📊 Estructura de Datos

### db/group_settings.json
```json
{
  "120363298765432@g.us": {
    "antilink": {
      "enabled": true,
      "action": "warn",
      "whitelisted_domains": ["google.com", "instagram.com"],
      "mute_duration": 1800000
    }
  }
}
```

---

## 🔍 Patrones de Detección

```
- http://
- https://
- www.
- [cualquier].com
- [cualquier].[cualquier]
```

---

## 📝 Notas Adicionales

- Muy efectivo para grupos profesionales
- Evitar spam y phishing
- Admin links son automáticamente ignorados
- Complementa `.antilink` con sistema de warns
