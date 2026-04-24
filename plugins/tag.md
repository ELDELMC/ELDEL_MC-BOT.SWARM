# 🏷️ Comando TAG

## Información General

**Comando:** `.tag`
**Aliases:** `@`, `mention`, `etiquetar`
**Categoría:** Administración / Utilidad
**Descripción:** Mencionar a uno o varios usuarios en el grupo

**Estado:** ❌ No Implementado (Pendiente)

---

## 👥 Permisos Requeridos

| Rol | Puede Ejecutar |
|-----|---|
| **Usuarios Comunes** | ✅ Sí |
| **Administradores del Grupo** | ✅ Sí |
| **Creador del Bot** | ✅ Sí |

---

## 📋 Funcionalidad Técnica

### Descripción Detallada
Comando para mencionar (@) a usuarios específicos. Permite etiquetar uno o múltiples usuarios y enviar un mensaje asociado.

### Cómo Funciona
1. Extrae usuarios mencionados con @
2. Extrae mensaje (si lo hay)
3. Envía mensaje con menciones
4. Las menciones generan notificaciones en los usuarios

---

## 🔧 Uso

### Sintaxis
```
.tag @usuario1 @usuario2 [mensaje]
```

### Ejemplos
```
.tag @Juan              ← Menciona a Juan
.tag @Juan @Maria       ← Menciona a Juan y María
.tag @Juan ¡Oye!        ← Menciona a Juan con mensaje
.tag @Juan @Maria Hola a todos ← Múltiples menciones con mensaje
```

### Respuesta del Bot
✅ **Éxito:**
```
@Juan @Maria Hola a todos
```

---

## ⚙️ Configuración Técnica

| Propiedad | Valor |
|-----------|-------|
| **Cooldown** | 1000ms |
| **Group Only** | Sí |
| **Admin Only** | No |
| **Owner Only** | No |
| **Requiere DB** | No |

---

## 📝 Notas Adicionales

- Similar a escribir @usuario naturalmente en WhatsApp
- Útil para notificaciones importantes
- Cada @ genera una notificación al usuario
