# 🚫 Comando BAN

## Información General

**Comando:** `.ban`
**Aliases:** `banear`, `block`
**Categoría:** Administración
**Descripción:** Banea a un usuario del bot, impidiendo que pueda usar los comandos

---

## 👥 Permisos Requeridos

| Rol | Puede Ejecutar |
|-----|---|
| **Usuarios Comunes** | ❌ No |
| **Administradores del Grupo** | ✅ Sí |
| **Creador del Bot** | ✅ Sí |

---

## 📋 Funcionalidad Técnica

### Descripción Detallada
El comando `.ban` permite a los administradores del grupo banear usuarios del bot. Los usuarios baneados no podrán ejecutar ningún comando del bot.

### Cómo Funciona
1. El comando extrae el JID del usuario a banear desde:
   - Un usuario mencionado con `@`
   - El usuario del que se está respondiendo (reply)
2. Valida que no se intente banear al bot mismo
3. Agrega el JID a la lista de baneados en `db/banned.json`
4. Envía confirmación del baneo

### Archivos Afectados
- `db/banned.json` - Base de datos de usuarios baneados

---

## 🔧 Uso

### Sintaxis
```
.ban @usuario
```

### Ejemplos
```
.ban @Juan           ← Banea al usuario Juan
.ban @Maria @Pedro   ← Banea a María y Pedro

(responder a un mensaje)
.ban                 ← Banea al autor del mensaje citado
```

---

## 💾 Almacenamiento de Datos

**Archivo:** `db/banned.json`
**Formato:** Array de JIDs
```json
[
  "573001234567@s.whatsapp.net",
  "573009876543@s.whatsapp.net"
]
```

---

## 📈 Cambios y Actualizaciones

### v1.0 - Versión Inicial
- Implementación del sistema de baneo básico
- Soporte para menciones individuales
- Validación anti-baneo del bot

---

## ⚠️ Consideraciones Importantes

- Los usuarios baneados no pueden usar NINGÚN comando del bot
- El baneo se almacena permanentemente en `db/banned.json`
- Para desbanear, usar comando `.unban`
- El comando tiene cooldown de 3 segundos
