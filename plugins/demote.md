# ⬇️ Comando DEMOTE

## Información General

**Comando:** `.demote`
**Aliases:** `degradar`, `unadmin`
**Categoría:** Administración
**Descripción:** Degrada a un administrador a miembro regular del grupo

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
El comando `.demote` permite a los administradores del grupo degradar a otros administradores a miembros regulares. Esta acción se refleja inmediatamente en el grupo de WhatsApp.

### Cómo Funciona
1. Extrae el o los JIDs de usuarios a degradar desde:
   - Usuarios mencionados con `@`
   - El usuario del que se está respondiendo (reply)
2. Ejecuta la acción de degradación en el grupo: `groupParticipantsUpdate('demote')`
3. Los usuarios pierden el status de administrador en el grupo
4. Envía confirmación de la degradación

### Archivos Afectados
- No modifica archivos (es una acción directa en el grupo de WhatsApp)

---

## 🔧 Uso

### Sintaxis
```
.demote @usuario
```

### Ejemplos
```
.demote @Juan       ← Degrada a Juan de admin a miembro
.demote @Maria @Pedro ← Degrada a María y Pedro

(responder a un mensaje)
.demote             ← Degrada al autor del mensaje citado
```

---

## ⚠️ Consideraciones Importantes

- Los usuarios degradados pierden **todos los permisos de admin**
- La degradación es **inmediata** a nivel de grupo de WhatsApp
- Los usuarios degradados pasan a ser miembros comunes del grupo
- No pueden:
  - Expulsar miembros
  - Cambiar descripciones del grupo
  - Promover/degradar otros miembros
- Cooldown de 3 segundos

---

## 📈 Cambios y Actualizaciones

### v1.0 - Versión Inicial
- Implementación del sistema de degradación
- Soporte para menciones múltiples
- Manejo de errores en degradación
