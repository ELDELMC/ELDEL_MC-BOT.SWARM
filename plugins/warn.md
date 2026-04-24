# ⚠️ Comando WARN

## Información General

**Comando:** `.warn`
**Aliases:** `advertir`, `warning`
**Categoría:** Moderación
**Descripción:** Advertir a un usuario por mal comportamiento. Al llegar a 3 advertencias es expulsado automáticamente

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
Sistema de advertencias que permite advertir a usuarios por mal comportamiento. Después de 3 advertencias, el usuario es expulsado automáticamente del grupo.

### Cómo Funciona
1. El comando extrae el JID del usuario a advertir
2. Agrega una advertencia con timestamp y razón en `db/warnings.json`
3. Verifica cantidad de advertencias:
   - 1 advertencia ⚠️ Primer aviso
   - 2 advertencias ⚠️⚠️ Segundo aviso
   - 3 advertencias ❌ Expulsión automática + baneo
4. Notifica al usuario y al grupo
5. Registra en el log

### Archivos Afectados
- `db/warnings.json` - Base de datos de advertencias
- `db/banned.json` - Se agrega si llega a 3 warns
- `core/Logger.js` - Registro de eventos

### Variables del Sistema
- `warnCount` en `config.js` - Cantidad mínima para expulsión (por defecto 3)

---

## 🔧 Uso

### Sintaxis
```
.warn @usuario [razón]
```

### Ejemplos
```
.warn @Juan                    ← Advertencia sin razón
.warn @Juan spam de mensajes   ← Advertencia con razón
.warn @Maria | abuso de menciones ← Alternativa con pipe
```

### Respuesta del Bot
✅ **Éxito (1 warn):**
```
@Juan has recibido 1/3 advertencias.
Razón: spam de mensajes
```

⚠️ **Advertencia (2 warns):**
```
@Juan has recibido 2/3 advertencias.
⚠️ PRÓXIMA ADVERTENCIA = EXPULSIÓN
```

❌ **Expulsión (3 warns):**
```
@Juan ha recibido 3/3 advertencias.
❌ Usuario expulsado del grupo y baneado del bot.
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
| **Advertencias máximas** | 3 (configurable) |
| **Auto-expulsión** | Sí |
| **Auto-baneo** | Sí |

---

## 🔗 Dependencias

- `core/Formatter.js` - Formatear respuestas
- `core/AdminChecker.js` - Validar admin
- `core/SharedData.js` - Acceso a base de datos
- `core/Logger.js` - Registrar eventos

---

## 📊 Estructura de Datos

### db/warnings.json
```json
{
  "120363298765432@g.us": {
    "120312345@s.whatsapp.net": [
      {
        "id": "warn_001",
        "issuer": "120312000@s.whatsapp.net",
        "reason": "spam de mensajes",
        "timestamp": 1712973600000,
        "count": 1
      },
      {
        "id": "warn_002",
        "issuer": "120312000@s.whatsapp.net",
        "reason": "abuso de menciones",
        "timestamp": 1712973700000,
        "count": 2
      },
      {
        "id": "warn_003",
        "issuer": "120312000@s.whatsapp.net",
        "reason": "mal comportamiento reiterativo",
        "timestamp": 1712973800000,
        "count": 3,
        "action": "kicked_and_banned"
      }
    ]
  }
}
```

---

## 🔐 Precauciones

- Admin solo puede usar en miembros sin permisos
- El propietario está exento de advertencias
- Validar que usuario exista en el grupo
- Registrar todas las advertencias en logs
- Notificar al grupo cuando se alcanza advertencia #3

---

## 🚀 Características Futuras

- [ ] Sistema de apelación (poder eliminar warns)
- [ ] Decrementar warns automáticamente después de X tiempo
- [ ] Historial completo de warns por usuario
- [ ] Reportes de comportamiento

---

## 📝 Notas Adicionales

- Es más efectivo que ban/kick porque da oportunidad de mejorar
- Complementa bien con `.mute` para usuarios problemáticos
- Use con `.warnings` para ver historial
- Muy útil para módulos como ancall, antilink, antispam
