# ⬆️ Comando PROMOTE

## Información General

**Comando:** `.promote`
**Aliases:** `promover`, `admin`
**Categoría:** Administración
**Descripción:** Promueve a un usuario a administrador del grupo

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
El comando `.promote` permite a los administradores del grupo promover usuarios regulares a administradores. Esta acción se refleja inmediatamente en el grupo de WhatsApp.

### Cómo Funciona
1. Extrae el o los JIDs de usuarios a promover desde:
   - Usuarios mencionados con `@`
   - El usuario del que se está respondiendo (reply)
2. Ejecuta la acción de promoción en el grupo: `groupParticipantsUpdate('promote')`
3. Los usuarios reciben el status de administrador en el grupo
4. Envía confirmación de la promoción

### Archivos Afectados
- No modifica archivos (es una acción directa en el grupo de WhatsApp)

---

## 🔧 Uso

### Sintaxis
```
.promote @usuario
```

### Ejemplos
```
.promote @Juan       ← Promueve a Juan a admin del grupo
.promote @Maria @Pedro ← Promueve a María y Pedro a admins

(responder a un mensaje)
.promote             ← Promueve al autor del mensaje citado
```

---

## ⚠️ Consideraciones Importantes

- Los usuarios promovidos obtienen **todos los permisos de admin** del grupo
- La promoción es **inmediata** a nivel de grupo de WhatsApp
- El usuario promovido puede:
  - Expulsar miembros
  - Promover/degradar otros usuarios
  - Cambiar la descripción del grupo
  - Etc. (según permisos de WhatsApp)
- Cooldown de 3 segundos

---

## 📈 Cambios y Actualizaciones

### v1.0 - Versión Inicial
- Implementación del sistema de promoción
- Soporte para menciones múltiples
- Manejo de errores en promoción
