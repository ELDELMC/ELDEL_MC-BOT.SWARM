# ℹ️ Comando INFO

## Información General

**Comando:** `.info`
**Aliases:** `estado`, `status`, `botinfo`
**Categoría:** General
**Descripción:** Muestra información detallada del bot y sus sesiones activas

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
El comando `.info` proporciona un resumen detallado del estado actual del bot, incluyendo uptime, consumo de memoria, sesiones activas, balanceo de carga y estadísticas de deduplicación.

### Cómo Funciona
1. Calcula el uptime del bot a partir de `process.uptime()`
2. Obtiene el consumo de RAM en MB
3. Consulta el estado de todas las sesiones activas
4. Obtiene estadísticas del LoadBalancer
5. Obtiene estadísticas del Deduplicador
6. Formatea toda la información en un mensaje visual
7. Envía la información con decoradores y formatos especiales

### Componentes Consultados
- `SessionManager` - Estado de sesiones
- `LoadBalancer` - Estadísticas de balanceo de tareas
- `Deduplicator` - Caché de mensajes
- `process.memoryUsage()` - Consumo de RAM

---

## 🔧 Uso

### Sintaxis
```
.info
.estado
.status
.botinfo
```

### Ejemplos
```
.info                ← Muestra información del bot
.estado              ← Alias en español
.status              ← Alias en inglés
```

---

## 📊 Información Mostrada

El comando muestra:

| Aspecto | Descripción |
|--------|-------------|
| **Bot** | Nombre/identificador del bot |
| **Uptime** | Tiempo que lleva ejecutándose (Xh Ym Zs) |
| **RAM** | Consumo de memoria en MB |
| **Sesión Actual** | Número de la sesión que procesa el comando (S1, S2, etc.) |
| **Prefijos** | Símbolos de activación de comandos (. !) |
| **Sesiones Activas** | Listado con: Estado (ONLINE/OFFLINE), Número de teléfono, Tareas encoladas |
| **Mensajes en Caché** | Cantidad de mensajes en el deduplicador |
| **TTL Dedup** | Tiempo de vida de los mensajes en caché (segundos) |

### Ejemplo de Respuesta
```
═══════════════════════════════════════
ℹ️ INFO DEL BOT

  ◆ Bot: JUANCHOTE-SWARM
  ◆ Uptime: 2h 15m 47s
  ◆ RAM: 145.3 MB
  ◆ Sesion actual: S1
  ◆ Prefijos: . !

⭐───── SESIONES ────⭐
  🟢 S1: ONLINE | Tel: 573001234567 | Tareas: 5
  🟢 S2: ONLINE | Tel: 573009876543 | Tareas: 3

  ◆ Mensajes en cache: 247
  ◆ TTL dedup: 300s

═══════════════════════════════════════
```

---

## 📈 Cambios y Actualizaciones

### v1.0 - Versión Inicial
- Implementación del comando info
- Integración con SessionManager
- Integración con LoadBalancer
- Información de deduplicación

---

## ℹ️ Información Adicional

- **Cooldown:** 5 segundos
- **Uso:** Disponible para todos los usuarios
- **Grupos y Privados:** Funciona en ambos
- **Sesiones:** Se actualiza según las sesiones activas en tiempo real
- **RAM:** Es el consumo actual, puede variar según la cantidad de mensajes en caché
