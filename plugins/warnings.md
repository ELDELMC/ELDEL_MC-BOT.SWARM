# 📋 Comando WARNINGS

## Información General

**Comando:** `.warnings`
**Aliases:** `warns`, `advertencias`, `historial`
**Categoría:** Moderación
**Descripción:** Ver todas las advertencias de un usuario o del grupo

**Estado:** ❌ No Implementado (Pendiente)

---

## 👥 Permisos Requeridos

| Rol | Puede Ejecutar |
|-----|---|
| **Usuarios Comunes** | ✅ Ver propias |
| **Administradores del Grupo** | ✅ Ver todas |
| **Creador del Bot** | ✅ Sí |

---

## 📋 Funcionalidad Técnica

### Descripción Detallada
Comando para visualizar el historial completo de advertencias. Si se especifica un usuario, muestra solo sus warns. Si no se especifica, muestra un resumen del grupo.

### Cómo Funciona
1. Si se menciona un usuario, extrae su JID
2. Si no, muestra estadísticas del grupo completo
3. Lee `db/warnings.json`
4. Formatea y envía la información en tabla legible
5. Muestra cuenta regresiva si usuario está cerca de expulsión

### Archivos Afectados
- `db/warnings.json` - Base de datos de advertencias

---

## 🔧 Uso

### Sintaxis
```
.warnings [@usuario]
```

### Ejemplos
```
.warnings              ← Ver resumen de todos en el grupo
.warnings @Juan       ← Ver advertencias de Juan específicamente
.warnings @Maria      ← Ver advertencias de María
```

### Respuesta del Bot
✅ **Éxito - Resumen del Grupo:**
```
📋 RESUMEN DE ADVERTENCIAS

Total de usuarios advertidos: 5

@Juan      → 3/3 ❌ EXPULSADO
@Maria     → 2/3 ⚠️
@Pedro     → 1/3 ⚠
@Luis      → 1/3 ⚠
@Ana       → 1/3 ⚠

[Ver detalles: .warnings @usuario]
```

✅ **Éxito - Usuario Específico:**
```
📋 ADVERTENCIAS DE @Juan

Total: 3/3 ❌ EXPULSADO

1️⃣ Razón: spam de mensajes
   Por: @Admin
   Fecha: 12 de Abril de 2026 14:30

2️⃣ Razón: abuso de menciones
   Por: @Admin
   Fecha: 12 de Abril de 2026 14:45

3️⃣ Razón: mal comportamiento reiterativo
   Por: @Admin
   Fecha: 12 de Abril de 2026 15:00
   Acción: Expulsado y Baneado
```

---

## ⚙️ Configuración Técnica

| Propiedad | Valor |
|-----------|-------|
| **Cooldown** | 2000ms |
| **Group Only** | Sí |
| **Admin Only** | Parcial |
| **Owner Only** | No |
| **Requiere DB** | Sí |

---

## 🔗 Dependencias

- `core/Formatter.js` - Formatear respuestas
- `core/SharedData.js` - Acceso a base de datos

---

## 📊 Estructura de Datos

Lee de: `db/warnings.json`

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
      }
    ]
  }
}
```

---

## 🔍 Permisos de Visualización

| Tipo de Usuario | Puede Ver |
|-----------------|-----------|
| Usuario normal | Sus propias warns |
| Administrador | Todas las warns del grupo |
| Propietario | Todas las warns globales |
| Usuario advertido | Sus propias warns |

---

## 📝 Notas Adicionales

- Integra perfectamente con comando `.warn`
- Útil para auditoría del grupo
- Ayuda a usuarios a entender por qué van a ser expulsados
- Complementa el sistema de moderación
