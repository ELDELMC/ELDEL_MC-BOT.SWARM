# 🔊 Comando UNMUTE

## Información General

**Comando:** `.unmute`
**Aliases:** `desisilenciar`, `unsilence`
**Categoría:** Administración
**Descripción:** Desilencia a un usuario que fue silenciado con `.mute`

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
El comando `.unmute` permite a los administradores desilenciar usuarios que fueron silenciados con `.mute`, permitiendo que vuelvan a escribir mensajes en el grupo.

### Cómo Funciona
1. El comando extrae el JID del usuario a desilenciar desde:
   - Un usuario mencionado con `@`
   - El usuario del que se está respondiendo (reply)
2. Busca al usuario en `db/muted.json`
3. Elimina la entrada de silenciamiento
4. Envía confirmación del desilenciamiento

### Archivos Afectados
- `db/muted.json` - Base de datos de usuarios silenciados

---

## 🔧 Uso

### Sintaxis
```
.unmute @usuario
```

### Ejemplos
```
.unmute @Juan        ← Desilencia a Juan
.unmute @Maria @Pedro ← Desilencia a María y Pedro
```

### Respuesta del Bot
✅ **Éxito:**
```
Usuario @Juan ha sido desilenciado.
```

❌ **Errores:**
```
Usuario @Juan no está silenciado.
Menciona al usuario o responde a su mensaje.
```

---

## ⚙️ Configuración Técnica

| Propiedad | Valor |
|-----------|-------|
| **Cooldown** | 3000ms |
| **Group Only** | Sí |
| **Admin Only** | Sí |
| **Owner Only** | No |
| **Requiere DB** | Sí |

---

## 🔗 Dependencias

- `core/Formatter.js` - Formatear respuestas
- `core/AdminChecker.js` - Validar admin
- `core/SharedData.js` - Acceso a base de datos

---

## 📝 Notas Adicionales

- Es el equivalente opuesto a `.mute`
- Verifica que el usuario esté realmente silenciado antes de desilenciar
- Complementa al sistema de `.mute` con duración automática
