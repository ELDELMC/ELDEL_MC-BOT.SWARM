# 🔇 Comando MUTE

## Información General

**Comando:** `.mute`
**Aliases:** `silenciar`, `silence`
**Categoría:** Administración
**Descripción:** Silencia a un usuario en el grupo, impidiendo que escriba mensajes

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
El comando `.mute` permite a los administradores del grupo silenciar temporalmente a usuarios. Los usuarios silenciados no podrán escribir ni enviar mensajes hasta que sean desilenciados con `.unmute`.

### Cómo Funciona
1. El comando extrae el JID del usuario a silenciar desde:
   - Un usuario mencionado con `@`
   - El usuario del que se está respondiendo (reply)
2. Valida que no se intente silenciar al bot mismo
3. Agrega el JID y timestamp a la lista de silenciados en `db/muted.json`
4. Automáticamente se desilencia después del tiempo especificado (ej: 30 minutos)
5. Envía confirmación del silenciamiento

### Archivos Afectados
- `db/muted.json` - Base de datos de usuarios silenciados
- `core/MessageHandler.js` - Validar si usuario está silenciado

### Lógica de Validación
- ❌ No permite silenciar al bot
- ❌ No permite silenciar al propietario
- ✅ Permite silenciar múltiples usuarios en un comando
- ✅ Permite especificar duración en minutos

---

## 🔧 Uso

### Sintaxis
```
.mute @usuario [duración en minutos]
```

### Ejemplos
```
.mute @Juan           ← Silencia a Juan por 24 horas (por defecto)
.mute @Juan 30        ← Silencia a Juan por 30 minutos
.mute @Maria @Pedro   ← Silencia a María y Pedro por 24 horas
```

### Respuesta del Bot
✅ **Éxito:**
```
Usuario @Juan ha sido silenciado del grupo por 24 horas.
```

❌ **Errores:**
```
Menciona al usuario o responde a su mensaje.
No puedo silenciarme a mi mismo.
No puedes silenciar al propietario.
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
| **Duración por defecto** | 24 horas |

---

## 🔗 Dependencias

- `core/Formatter.js` - Formatear respuestas
- `core/AdminChecker.js` - Validar admin
- `core/SharedData.js` - Acceso a base de datos
- `core/MessageHandler.js` - Validación de mensajes

---

## 📊 Estructura de Datos

### db/muted.json
```json
{
  "120363298765432@g.us": {
    "120312345@s.whatsapp.net": {
      "muter": "120312000@s.whatsapp.net",
      "startTime": 1712973600000,
      "duration": 1800000,
      "endTime": 1712975400000
    }
  }
}
```

---

## 🔐 Precauciones

- El bot debe tener permisos de administrador en el grupo
- El silenciamiento es a nivel de plugin, no se integra con WhatsApp nativo
- Requiere validación en `MessageHandler.js` para cada mensaje
- Necesita un job/timer para limpiar silencios expirados

---

## 📝 Notas Adicionales

- Es recomendable combinar con `.unmute` para desilenciar antes
- El sistema debe verificar permisos en cada mensaje
- Considerar implementar auto-unmute al expirar la duración
- Útil para controlar spam o usuarios problemáticos (alternativa a kick/ban)
