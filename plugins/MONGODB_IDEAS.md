# 💾 MONGODB - IDEAS Y CASOS DE USO

**Proyecto:** JUANCHOTE-SWARM  
**Fecha:** 12 de abril de 2026  
**Estado:** Propuestas de implementación futura

---

## 📊 Ideas de MongoDB para JUANCHOTE-SWARM

### 1. **Sistema de Blacklist/Whitelist en Nube** ⭐⭐⭐
**Propósito:** Reemplazar `banned.json` con colección MongoDB

**Ventajas:**
- Sincronización entre sesiones (session-1 y session-2 comparten ban list)
- Búsquedas O(1) con índices
- TTL automático (expiraciones sin cronJob)
- Auditoría integrada (quién baneó, cuándo, por qué)

**Esquema:**
```javascript
db.banned.insertOne({
    userId: "573123456789",
    reason: "spam",
    bannedBy: "573218950565",
    bannedAt: new Date(),
    duration: 30, // días
    expiresAt: new Date(Date.now() + 30*24*60*60*1000),
    appealedAt: null,
    appealReason: ""
})

// TTL Index: db.banned.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

**Impacto:** Moderación centralizada, multi-sesión

---

### 2. **Caché de Metadata de Grupos** ⭐⭐
**Propósito:** Almacenar info de grupos para evitar llamadas repetidas a Baileys

**Ventajas:**
- Evita latencia en `sock.groupMetadata()`
- Reduce uso de API limitada de WhatsApp
- Estadísticas rápidas de grupos
- Detección de cambios de administradores

**Esquema:**
```javascript
db.groupMetadata.updateOne(
    { groupJid: "120362023xxxx@g.us" },
    {
        $set: {
            groupName: "Los del Flow",
            memberCount: 45,
            subject: "Los del Flow",
            owner: "573218950565@s.whatsapp.net",
            admins: ["573218950565@s.whatsapp.net", "573052274793@s.whatsapp.net"],
            lastUpdate: new Date(),
            isGroup: true
        }
    },
    { upsert: true }
)
```

**Consultas útiles:**
```javascript
// Grupos donde soy admin
db.groupMetadata.find({ admins: { $in: ["573218950565@s.whatsapp.net"] } })

// Grupos grandes
db.groupMetadata.find({ memberCount: { $gt: 100 } })

// Últimos grupos actualizado hace 1 hora
db.groupMetadata.find({ lastUpdate: { $lt: new Date(Date.now() - 60*60*1000) } })
```

---

### 3. **Historial de Actividad del Bot** ⭐⭐⭐⭐
**Propósito:** Analytics completo del bot (comandos, usuarios, horas pico)

**Esquema:**
```javascript
db.activity.insertOne({
    timestamp: new Date(),
    command: "weather",
    user: "573123456789",
    group: "Madrid_tech",
    groupJid: "120362023xxxx@g.us",
    success: true,
    executionTime: 234, // ms
    errorMessage: null,
    parameters: { city: "Madrid" },
    session: 1
})
```

**Analytics (Aggregation Pipeline):**
```javascript
// Top 10 comandos más usados
db.activity.aggregate([
    { $group: { _id: "$command", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
])

// Tasa de error por comando
db.activity.aggregate([
    { $match: { success: false } },
    { $group: { _id: "$command", errors: { $sum: 1 } } }
])

// Usuarios más activos
db.activity.aggregate([
    { $group: { _id: "$user", commands: { $sum: 1 }, avgTime: { $avg: "$executionTime" } } },
    { $sort: { commands: -1 } },
    { $limit: 20 }
])

// Horas pico de uso
db.activity.aggregate([
    { $group: { _id: { $hour: "$timestamp" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
])
```

**I+ Panel de Dashboard / Comando `.analytics` del bot**

---

### 4. **Sistema de Configuración Persistente (Config Bot)** ⭐⭐⭐
**Propósito:** Configurar bot sin reiniciar (cambios en tiempo real)

**Esquema:**
```javascript
db.botConfig.insertOne({
    _id: "config",
    prefixes: [".", "!"],
    commandMode: "public", // public | private | admin_only
    timezone: "America/Bogota",
    maintenanceMode: false,
    maxSessionCount: 2,
    maxGroupsPerSession: 500,
    rateLimits: {
        commandsPerSecond: 10,
        imageProcessing: 5,
        apiCalls: 20
    },
    features: {
        spyMode: true,
        imageTrasformation: true,
        apiIntegration: true,
        autoModeration: false
    },
    notifications: {
        errorReporting: true,
        dailyStats: true,
        sessionAlerts: true
    },
    updatedBy: "Github_Copilot",
    updatedAt: new Date()
})

// Obtener config (con caché local)
const config = await db.botConfig.findOne({ _id: "config" })
```

**Ventajas:**
- Cambiar prefijos sin reiniciar
- Activar/desactivar features en vivo
- Multi-sesión sincronizada
- Rollback de cambios

---

### 5. **Sistema de Log Estructurado (para debugging)** ⭐⭐
**Propósito:** Logs persistentes con TTL (7 días automático)

**Esquema:**
```javascript
// Create TTL index (auto-borrado después de 7 días)
db.logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 604800 })

db.logs.insertOne({
    level: "error", // error | warn | info | debug
    message: "Failed to process image: timeout",
    stack: "Error at processImage (grayscale.js:45:12)",
    session: 1,
    command: "grayscale",
    user: "573123456789",
    group: "Madrid_tech",
    context: { imageSize: 2.5, timeout: 5000 },
    createdAt: new Date()
})
```

**Ventajas:**
- Búsqueda rápida de errores por fecha/comando
- Auto-limpieza (TTL)
- Debugging distribuido (múltiples sesiones)
- Alertas automáticas si error rate es alto

---

### 6. **Sistema de Sesiones/Tokens** ⭐
**Propósito:** Track de sesiones activas + API tokens

**Esquema:**
```javascript
db.sessions.insertOne({
    sessionId: 1,
    phoneNumber: "+573218950565",
    socketId: "uuid-xxx",
    connectedAt: new Date(),
    lastActivity: new Date(),
    status: "connected", // connected | disconnected | failed
    messageCount: 1234,
    groupCount: 87,
    expiresAt: new Date(Date.now() + 24*60*60*1000),
    
    // API Token para acceso remoto
    apiToken: "sha256_hash",
    tokenCreatedAt: new Date(),
    tokenExpiresAt: new Date(Date.now() + 30*24*60*60*1000)
})
```

**Utilidad:**
- Detectar desconexiones
- Rebalancear carga entre sesiones
- Monitoreo de métricas por sesión
- API tokens para control remoto

---

### 7. **Historial de Cambios de Configuración** ⭐
**Propósito:** Auditoría + Compliance

**Esquema:**
```javascript
db.configHistory.insertOne({
    changeType: "PERMISSION_UPDATE", // PERMISSION | CONFIG | FEATURE | MAINTENACE
    affectedUser: "573123456789",
    before: { role: "user", permissions: [] },
    after: { role: "admin", permissions: ["ban", "kick", "hidetag"] },
    changedBy: "573218950565", // Quién lo hizo
    reason: "User demonstrated maturity in moderation",
    timestamp: new Date(),
    ipAddress: "192.168.0.1" // Si es remoto
})
```

**Ventajas:**
- Trazabilidad completa
- Rollback de permisos
- Compliance y auditoría legal
- Detección de cambios maliciosos

---

### 8. **Sistema de APIs Tokens (para usuarios/apps)** ⭐⭐
**Propósito:** Permitir a usuarios externos usar el bot via API

**Esquema:**
```javascript
db.userTokens.insertOne({
    _id: ObjectId(),
    userId: "573123456789",
    token: "sha256_hash_token",
    name: "Mi App de Clima", // Nombre del token
    scope: "read:weather,write:logs", // Permisos
    rateLimitQuota: 10000, // Req/mes
    used: 2345,
    requests: [
        { method: "GET", endpoint: "/weather", timestamp: new Date() },
        // historial de requests
    ],
    createdAt: new Date(),
    lastUsed: new Date(),
    expiresAt: new Date(Date.now() + 90*24*60*60*1000) // 90 días
})
```

**Endpoints API:**
```
GET /api/weather?token=xxx&city=Madrid
POST /api/logs?token=xxx (para enviar logs)
GET /api/user-stats?token=xxx
```

---

### 9. **Sistema de Alertas/Monitoring** ⭐⭐⭐
**Propósito:** Alertas automáticas si algo falla

**Esquema:**
```javascript
db.alerts.insertOne({
    alertType: "SESSION_DOWN", // SESSION_DOWN | HIGH_ERROR_RATE | MEMORY_HIGH | API_RATE_LIMITED
    severity: "high", // high | medium | low
    sessionId: 1,
    message: "Session 1 disconnected for 5 minutes",
    threshold: { maxDowntime: 300000, actual: 315000 },
    triggeredAt: new Date(),
    
    autoRemediation: {
        action: "restart_session", // restart | notify | escalate
        status: "pending", // pending | completed | failed
        executedAt: null,
        result: null
    },
    
    notificationsSent: ["telegram:bot_alerts", "email:admin@juanchote.com"],
    resolvedAt: null,
    resolutionNotes: ""
})
```

**Ventajas:**
- Monitoreo proactivo
- Auto-recovery (reiniciar sesiones)
- Escalación a humano si falla auto-fix
- Historial de incidentes

---

### 10. **Analytics & Dashboard (agregación diaria)** ⭐⭐⭐
**Propósito:** Estadísticas diarias para análisis de rendimiento

**Esquema:**
```javascript
db.analytics.insertOne({
    date: ISODate("2026-04-12"),
    
    // Métricas generales
    totalCommands: 4523,
    totalErrors: 42,
    errorRate: 0.93, // %
    averageResponseTime: 245, // ms
    
    // Top comandos
    topCommands: [
        { command: "weather", count: 1200, avgTime: 234 },
        { command: "pokedex", count: 890, avgTime: 198 },
        { command: "gif", count: 780, avgTime: 1200 }
    ],
    
    // Usuarios
    uniqueUsers: 543,
    topUsers: [
        { userId: "573052274793", commands: 234 },
        { userId: "573123456789", commands: 189 }
    ],
    
    // Sesiones
    sessionCount: 2,
    sessionUptime: 99.8, // %
    sessionStats: [
        { sessionId: 1, commands: 2300, uptime: 99.9, messages: 5678 },
        { sessionId: 2, commands: 2223, uptime: 99.7, messages: 4892 }
    ],
    
    // Almacenamiento
    groupCount: 187,
    contactsExtracted: 2340,
    
    // Nube
    mongoDbSize: 12.5, // MB
    mongoOperations: 4523,
    
    createdAt: new Date()
})

// Obtener últimos 30 días
db.analytics.find({ date: { $gte: new Date(Date.now() - 30*24*60*60*1000) } })
```

**Dashboard Visualization:**
- Gráfico de comandos por día
- Uptime por sesión
- Top usuarios
- Error rate tendencia
- Response time promedio

---

## 🎯 **Recomendación de Priorización**

| Idea | Prioridad | Esfuerzo | ROI | Implementar | Estimado |
|------|-----------|----------|-----|-------------|----------|
| 3. Activity | ⭐⭐⭐⭐ | 2hrs | Alto | Sí | 2h |
| 4. Bot Config | ⭐⭐⭐ | 1.5hrs | Alto | Sí | 1.5h |
| 10. Analytics | ⭐⭐⭐ | 3hrs | Medio | Sí | 3h |
| 1. Blacklist | ⭐⭐⭐ | 2hrs | Alto | Sí | 2h |
| 9. Alerts | ⭐⭐⭐ | 3hrs | Medio | Opcional | 3h |
| 2. Metadata | ⭐⭐ | 2hrs | Bajo | Opcional | 2h |
| 5. Logs | ⭐⭐ | 1hr | Bajo | Opcional | 1h |
| 6. Sessions | ⭐ | 1.5hrs | Bajo | Opcional | 1.5h |
| 7. Audit | ⭐ | 1hr | Bajo | Legal | 1h |
| 8. API Tokens | ⭐⭐ | 4hrs | Medio | Futuro | 4h |

**Total Recomendado:** ~8.5 horas de desarrollo

---

## 📝 **Próximos Pasos**

1. ✅ **Completar integración MongoDB en spyMode.js** (CAMBIO #9 fix)
2. ⏳ **Implementar colección `activity` para analytics**
3. ⏳ **Crear colección `botConfig` para configuración en tiempo real**
4. ⏳ **Dashboard `.analytics` comando in-bot**

---

**Última actualización:** 12 de abril de 2026 | **Estado:** Propuestas documentadas y listos para implementación
