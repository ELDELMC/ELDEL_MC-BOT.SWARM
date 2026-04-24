# 🚪 Comando KICK

## Información General

**Comando:** `.kick`
**Aliases:** `remove`, `expulsar`
**Categoría:** Administración
**Descripción:** Expulsa a un usuario del grupo de WhatsApp

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
El comando `.kick` permite a los administradores del grupo expulsar (remover) usuarios del grupo de WhatsApp. Esta acción es irreversible a nivel de grupo (el usuario debe ser reinvitado).

### Cómo Funciona
1. Extrae el o los JIDs de usuarios a expulsar desde:
   - Usuarios mencionados con `@`
   - El usuario del que se está respondiendo (reply)
2. Valida que no se intente expulsar al bot mismo
3. Ejecuta la acción de expulsión en el grupo: `groupParticipantsUpdate('remove')`
4. Envía confirmación de la expulsión

### Archivos Afectados
- No modifica archivos (es una acción directa en el grupo de WhatsApp)

---

## 🔧 Uso

### Sintaxis
```
.kick @usuario
```

### Ejemplos
```
.kick @Juan          ← Expulsa a Juan del grupo
.kick @Maria @Pedro  ← Expulsa a María y Pedro del grupo

(responder a un mensaje)
.kick                ← Expulsa al autor del mensaje citado
```

---

## ⚠️ Consideraciones Importantes

- **Acción Irreversible:** Una vez expulsado, el usuario debe ser reinvitado
- El usuario **no** queda baneado del grupo, solo expulsado
- El bot **no puede expulsarse a sí mismo** (hay validación para esto)
- Requiere que el bot tenga permisos de admin en el grupo
- Cooldown de 3 segundos

---

## 📈 Cambios y Actualizaciones

### v1.0 - Versión Inicial
- Implementación del sistema de expulsión
- Soporte para menciones múltiples
- Validación anti-expulsión del bot
