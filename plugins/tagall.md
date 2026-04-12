# 📢 Comando TAGALL

## Información General

**Comando:** `.tagall`
**Aliases:** `@all`, `@todos`, `etiquetar-todos`
**Categoría:** Administración
**Descripción:** Mencionar a TODOS los miembros del grupo en un solo mensaje

**Estado:** ❌ No Implementado (Pendiente)

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
Menciona a todos los miembros del grupo en un solo mensaje. Es útil para avisos importantes que requieren notificar a toda la comunidad.

### Cómo Funciona
1. Obtiene lista de todos los participantes del grupo
2. Crea menciones para cada uno
3. Envía mensaje con todas las menciones
4. Todos reciben notificación

---

## 🔧 Uso

### Sintaxis
```
.tagall [mensaje]
```

### Ejemplos
```
.tagall                      ← Menciona a todos sin mensaje
.tagall ¡Atención!           ← Menciona a todos con mensaje
.tagall Reunión importante ahora ← Mensaje personalizado
```

### Respuesta del Bot
✅ **Éxito:**
```
@Usuario1 @Usuario2 @Usuario3 ... @UsuarioN
¡Atención! Este es el mensaje
```

---

## ⚙️ Configuración Técnica

| Propiedad | Valor |
|-----------|-------|
| **Cooldown** | 5000ms |
| **Group Only** | Sí |
| **Admin Only** | Sí |
| **Owner Only** | No |
| **Requiere DB** | No |
| **Límite de menciones** | 256 por mensaje |

---

## 🔐 Precauciones

- Usar con moderación para no abusar del spam
- No menciona al bot
- Exclir usuarios silenciados (mute) de las menciones
- Registrar uso en logs para auditoría

---

## 📝 Notas Adicionales

- Cuidado: puede generar muchas notificaciones
- Ideal para avisos críticos
- Complementa el sistema de `.tag`
