# 🏆 Comando TOP

## Información General

**Comando:** `.top`
**Aliases:** `ranking`
**Categoría:** Estadísticas
**Descripción:** Muestra el ranking de miembros más activos del grupo

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
El comando `.top` muestra un ranking de los usuarios más activos en el grupo basado en el número de mensajes enviados. Utiliza el sistema de seguimiento de actividad (`ActivityTracker`) para registrar y mostrar estadísticas en tiempo real.

### Cómo Funciona
1. Extrae el subcomando de los argumentos (por defecto: "activos")
2. Si el subcomando es "activos":
   - Obtiene los 10 usuarios más activos del grupo
   - Genera un mensaje formateado con badges (🥇, 🥈, 🥉)
   - Muestra el número de mensajes de cada usuario
3. Para otros subcomandos: muestra error "no reconocido"

### Archivos Afectados
- `db/activity.json` - Base de datos de actividad (gestionada por ActivityTracker)

---

## 🔧 Uso

### Sintaxis
```
.top [subcomando]
.ranking [subcomando]
```

### Subcomandos Disponibles

| Subcomando | Descripción |
|-----------|-------------|
| **activos** | Muestra los 10 usuarios más activos (default) |

### Ejemplos
```
.top                 ← Muestra top activos (default)
.top activos         ← Muestra los 10 más activos
.ranking             ← Alias de .top
```

---

## 📊 Información Mostrada

Ejemplo de respuesta:

```
═══════════════════════════════════════
📊 RANKING DE ACTIVIDAD EN EL GRUPO 📊
━━━━━━━━━━━━━━━━━━━━━━

🥇 Juan Silva
    ╰─> 💬 Mensajes: 342

🥈 María Pérez
    ╰─> 💬 Mensajes: 298

🥉 Pedro López
    ╰─> 💬 Mensajes: 245

 4. Carlos Ramírez
    ╰─> 💬 Mensajes: 198

... (más usuarios hasta 10)

━━━━━━━━━━━━━━━━━━━━━━
Usa .top activos para actualizar el ranking
═══════════════════════════════════════
```

---

## 🏅 Sistema de Badges

| Posición | Badge | Descripción |
|----------|-------|-------------|
| 1º | 🥇 | Oro - Usuario más activo |
| 2º | 🥈 | Plata - Segundo más activo |
| 3º | 🥉 | Bronce - Tercero más activo |
| 4-10º | Número | Posición numérica simple |

---

## ⚠️ Consideraciones Importantes

- El ranking solo muestra **grupos donde el bot está** (groupOnly: true)
- Se necesita actividad en el grupo para mostrar datos
- Si no hay suficiente actividad, se muestra un mensaje de error
- El contador incluye TODOS los mensajes del usuario en el grupo
- Los nombres se truncan a 20 caracteres si son muy largos
- Cooldown de 5 segundos

---

## 📈 Cambios y Actualizaciones

### v1.0 - Versión Inicial (2026-04-09 14:40)
**🤖 IA responsable:** Google Antigravity AI
- Implementación del sistema de ranking
- Integración con ActivityTracker
- Sistema de badges para posiciones principales
- Limitado a 10 usuarios principales
- Guardar estadísticas en `db/activity.json`
- Propósito: Fomentar la interacción en los grupos

---

## 🔗 Relación con Otros Componentes

- **ActivityTracker** (`core/ActivityTracker.js`) - Registra mensajes de cada usuario
- **Archivo de datos** (`db/activity.json`) - Almacena el historial de actividad
