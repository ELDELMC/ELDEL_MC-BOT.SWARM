# 🔧 DOCUMENTACIÓN TÉCNICA - SISTEMA DE MULTI-SESIÓN PARA CLONADOR E INVOCADOR

## 📋 Resumen Ejecutivo

El sistema JUANCHOTE-SWARM implementa un arquitectura multi-sesión que permite:
- Ejecutar múltiples números de WhatsApp simultáneamente en un mismo proceso Node.js
- Distribuir tareas equitativamente entre sesiones usando un LoadBalancer
- Evitar respuestas duplicadas usando un Deduplicator
- Paralelizar operaciones masivas (como invitaciones de usuarios)

Este documento explica cómo una IA puede replicar estas capacidades.

---

## 1. ARQUITECTURA DE SESIONES MÚLTIPLES

### 1.1 Modelo de operación

```
┌─────────────────────────────────────────────────────────────────┐
│                    Node.js Process                              │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────────┐   │
│  │ Session-1  │  │ Session-2  │  │ Core System              │   │
│  │ (Socket-1) │  │ (Socket-2) │  │ - LoadBalancer           │   │
│  │ 573001...  │  │ 573009...  │  │ - Deduplicator           │   │
│  │            │  │            │  │ - SharedData             │   │
│  └────────────┘  └────────────┘  │ - CommandHandler         │   │
│        ↓              ↓            │ - AdminChecker           │   │
│  ┌────────────────────────────────┐ - MessageHandler         │   │
│  │    Mensaje de WhatsApp         │                          │   │
│  │    (recibido por ambas)        │                          │   │
│  └────────────────────────────────┘                          │   │
│        ↓              ↓                                        │   │
│  Deduplicator.claim()  ← Una sola sesión gana                │   │
│        ↓                                                       │   │
│    LoadBalancer.pick() ← Elige mejor sesión si es necesario  │   │
│        ↓                                                       │   │
│    Handler ejecuta                                            │   │
│        ↓                                                       │   │
│   Respuesta enviada                                           │   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Flujo de ejecución de mensaje

**Paso 1: Recepción**
- WhatsApp envía mensaje a TODAS las sesiones (porque todas están conectadas)
- Cada sesión recibe el mismo mensaje vía callback de Baileys

**Paso 2: Deduplicación**
```javascript
// En MessageHandler.js
const claimed = Deduplicator.claim(messageId, sessionIndex);
if (!claimed) {
    // Esta sesión NO obtiene este mensaje
    return;
}
// Esta sesión SI obtiene este mensaje
```

El Deduplicator usa un Set en memoria con TTL para asegurar que solo UNA sesión procesa cada mensaje:
```javascript
class Deduplicator {
    constructor() {
        this.claimed = new Map(); // msgId → sessionIndex
        this.ttl = 60000; // 60 segundos
    }
    
    claim(messageId, sessionIndex) {
        if (this.claimed.has(messageId)) {
            // Otro ya lo reclamó
            return false;
        }
        // Este es el primero
        this.claimed.set(messageId, sessionIndex);
        // Limpiar después de TTL
        setTimeout(() => this.claimed.delete(messageId), this.ttl);
        return true;
    }
}
```

**Paso 3: Routing**
```javascript
// Si es un comando regular:
// LoadBalancer.pick() → elige la sesión MENOS cargada

// Si es un comando admin:
// LoadBalancer.pick(groupId, requiresAdmin=true)
// → elige sesión que sea admin en ese grupo
// → si hay múltiples, elige la MENOS cargada entre ellas
```

---

## 2. LOAD BALANCER - DISTRIBUCIÓN DE CARGA

### 2.1 Algoritmo de selección

```javascript
async function pick(groupId, requiresAdmin = false) {
    // Obtener sesiones activas
    const active = getActiveSessions(); // [1, 2]
    
    if (requiresAdmin && groupId) {
        // Para comandos admin: filtrar a sesiones que sean admin
        const adminSessions = [];
        for (const sessionIdx of active) {
            const isAdmin = await adminChecker.isBotAdminIn(
                sessions[sessionIdx], 
                groupId
            );
            if (isAdmin) adminSessions.push(sessionIdx);
        }
        
        // Si hay múltiples, elegir la menos cargada
        if (adminSessions.length > 1) {
            return sessions[leastLoaded(adminSessions)];
        }
        return sessions[adminSessions[0]];
    }
    
    // Para comandos normales: siempre elegir la MENOS cargada
    return sessions[leastLoaded(active)];
}

function leastLoaded(candidates) {
    let minIdx = candidates[0];
    let minCount = taskCounts[minIdx];
    
    for (const idx of candidates) {
        if (taskCounts[idx] < minCount) {
            minCount = taskCounts[idx];
            minIdx = idx;
        }
    }
    return minIdx;
}
```

### 2.2 Conteo de tareas

Cada sesión mantiene un contador de tareas activas:
```javascript
taskCounts = new Map();
// { 1: 2, 2: 1 }  // Sesión 1 tiene 2 tareas, sesión 2 tiene 1

// Cuando se asigna una tarea:
taskCounts[sessionIdx]++;

// Cuando se completa:
taskCounts[sessionIdx]--;
```

---

## 3. COMANDO INVO - DISTRIBUCIÓN DE USUARIOS

### 3.1 Estructura de datos de usuarios

Las bases de datos se guardan en `db/grupos_clonados/` y pueden tener varios formatos:

**Formato 1: Array simple**
```json
[
  "573001234567",
  "573009876543",
  "584245583273"
]
```

**Formato 2: Objeto con propiedades**
```json
{
  "user1": { "phone": "573001234567", "name": "Juan" },
  "user2": { "phone": "573009876543", "name": "María" }
}
```

### 3.2 Algoritmo de distribución paralela

```javascript
async function addUsersWithMultipleSessions(chatId, userNumbers) {
    // PASO 1: Obtener sesiones activas
    const activeSessions = loadBalancer.getActiveSessions(); // [1, 2]
    
    // PASO 2: Dividir usuarios equitativamente
    const chunkSize = Math.ceil(userNumbers.length / activeSessions.length);
    const chunks = [];
    
    for (let i = 0; i < userNumbers.length; i += chunkSize) {
        chunks.push(userNumbers.slice(i, i + chunkSize));
    }
    // Si hay 300 usuarios y 2 sesiones:
    // chunkSize = 150
    // chunks = [usuarios 0-149, usuarios 150-299]
    
    // PASO 3: Ejecutar en paralelo
    const promises = [];
    for (let i = 0; i < activeSessions.length; i++) {
        const sessionIndex = activeSessions[i];
        const sock = loadBalancer.getSocket(sessionIndex);
        
        promises.push(
            addUsersToGroupFromSession(sock, chatId, chunks[i], sessionIndex)
        );
    }
    
    // PASO 4: Esperar a que terminen TODAS
    const results = await Promise.all(promises);
    
    // PASO 5: Agregar resultados
    let totalAdded = 0;
    for (const result of results) {
        totalAdded += result.added;
    }
    return totalAdded;
}
```

### 3.3 Procesamiento en una sesión

```javascript
async function addUsersToGroupFromSession(sock, chatId, userNumbers, sessionIndex) {
    let added = 0;
    const results = [];
    
    // Obtener miembros actuales del grupo (para evitar duplicados)
    const groupMetadata = await sock.groupMetadata(chatId);
    let members = groupMetadata.participants.map(p => p.id);
    
    // Procesar cada usuario secuencialmente EN ESTA SESIÓN
    for (let i = 0; i < userNumbers.length; i++) {
        const phoneNumber = userNumbers[i];
        const normalized = normalizePhoneNumber(phoneNumber); // "573001234567" → "573001234567@s.whatsapp.net"
        
        // Verificar si ya está en el grupo
        if (members.includes(normalized)) {
            results.push(`[S${sessionIndex}] ${phoneNumber} - YA_EN_GRUPO`);
            continue;
        }
        
        try {
            // Agregar usuario
            await sock.groupParticipantsUpdate(chatId, [normalized], 'add');
            added++;
            members.push(normalized);
            results.push(`[S${sessionIndex}] ${phoneNumber} - OK`);
            
            // IMPORTANTE: Esperar intervalo aleatorio para evitar baneo
            if (i < userNumbers.length - 1) {
                const interval = Math.random() * (8000 - 3000) + 3000; // 3-8s
                await sleep(interval);
            }
        } catch (err) {
            results.push(`[S${sessionIndex}] ${phoneNumber} - ERROR`);
            await sleep(1000); // Esperar 1s en caso de error
        }
    }
    
    return { added, sessionIndex };
}
```

---

## 4. SISTEMA DE CLONADOR

El clonador es el módulo que recopila números de usuarios de grupos.

### 4.1 Estructura del clonador

```
CLONADOR/
├── engine.js          # Motor principal del clonador
├── utils/
│   ├── clonador.js     # Lógica de recopilación
│   └── spyMode.js      # Modo espía para capturar datos
└── db/
    ├── espionaje.json  # Datos recopilados
    └── grupos_clonados/ # Bases por grupo
        ├── grupo1.json
        └── grupo2.json
```

### 4.2 Flujo del clonador

```javascript
// En index.js o engine.js, durante la inicialización:

// Cuando se recibe un mensaje de grupo:
ClonadorEngine.processGroupMessage(message) {
    const senderId = message.key.participant;
    const groupId = message.key.remoteJid;
    
    // Si el grupo está siendo monitoreado:
    if (isMonitoredGroup(groupId)) {
        // Guardar el número del usuario en db/grupos_clonados/{groupId}.json
        saveUserToDatabase(groupId, senderId);
    }
}

// El flujo es:
// 1. Usuario escribe en grupo monitorizado
// 2. Mensaje llega a bot
// 3. Extraer senderId (573001234567@s.whatsapp.net)
// 4. Guardar en db/grupos_clonados/{groupName}.json
// 5. Después usar .invo para invitar a otros grupos
```

### 4.3 Validación de números capturados

```javascript
function validateAndNormalizePhoneNumber(jid) {
    // Entrada: "573001234567@s.whatsapp.net" o "573001234567"
    
    const number = jid.replace(/@s.whatsapp.net|@.*/, '').replace(/[^0-9]/g, '');
    
    // Validar longitud
    if (number.length < 10 || number.length > 15) {
        return null; // Inválido
    }
    
    return `${number}@s.whatsapp.net`;
}
```

---

## 5. MECANISMO DE SHARED DATA (Escritura concurrente)

Cuando ambas sesiones quieren escribir a `db/grupos_clonados/{grupo}.json` simultáneamente:

```javascript
class SharedData {
    constructor() {
        this.writeQueues = new Map(); // archivo → cola de promesas
        this.cache = new Map();
    }
    
    async write(filename, data) {
        // Obtener la cola de escritura para este archivo
        const prevQueue = this.writeQueues.get(filename) || Promise.resolve();
        
        // Crear nueva promesa que espera a la anterior
        const writePromise = prevQueue.then(() => {
            // Solo después de que termine la anterior, hacer esta escritura
            fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
        });
        
        // Guardar como la nueva cola
        this.writeQueues.set(filename, writePromise);
        
        return writePromise;
    }
}

// En práctica:
// Momento 0: Session-1 llama write('grupo1.json', [...])
//            → Se agrega a cola de 'grupo1.json'
// Momento 0.1: Session-2 llama write('grupo1.json', [...])
//              → Se espera a que termine Session-1
//              → Luego se ejecuta Session-2
// Momento 0.2: Session-1 termina, Session-2 lee archivo actualizado y escribe
```

---

## 6. ANTI-BANEO - INTERVALOS VARIABLES

WhatsApp detecta bots analizando patrones. Los intervalos fijos son sospechosos.

### 6.1 Generación de intervalos aleatorios

```javascript
function getRandomInterval() {
    // Rango: 3-8 segundos
    const min = 3000;
    const max = 8000;
    
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    return random;
    
    // Ejemplos de salida: 3741ms, 5290ms, 7845ms, 4102ms, etc.
}

// Uso:
for (let i = 0; i < usuarios.length; i++) {
    await agregarUsuario(usuarios[i]);
    
    if (i < usuarios.length - 1) {
        const interval = getRandomInterval();
        // Cada invitación espera 3-8 segundos => patrón irregular
        await sleep(interval);
    }
}
```

### 6.2 Límites de WhatsApp

Empíricamente determinados:
- **Máximo seguro**: 200-300 invitaciones/día por número
- **Intervalo mínimo recomendado**: 3 segundos
- **Máximo de intentos**: 500/día = riesgo alto

Con 2 sesiones en paralelo:
- Sesión 1: agrega 75 usuarios
- Sesión 2: agrega 75 usuarios
- Total: 150 usuarios simultáneamente
- Tiempo total: ~12 minutos (en vez de 25 minutos con 1 sesión)

---

## 7. INTEGRACIÓN COMPLETA - EJEMPLO PASO A PASO

### 7.1 Usuario ejecuta comando

```
Usuario escribo:
.invo 1 si
```

### 7.2 Flujo de ejecución

```
1. Message llega a SessionManager
   ├─ Recibida por Socket-1 y Socket-2
   
2. Deduplicator.claim()
   ├─ Socket-1 llama primero → GANA (claimed = true)
   ├─ Socket-2 llama después → PIERDE (claimed = false, retorna)
   
3. MessageHandler procesa en Socket-1
   ├─ Extrae comando: ".invo 1 si"
   ├─ Busca plugin: invo.js
   ├─ Ejecuta handler
   
4. Handler invo.js
   ├─ Carga base de datos (150 usuarios)
   ├─ Llama addUsersWithMultipleSessions()
   │  ├─ Obtiene sesiones activas: [1, 2]
   │  ├─ Divide usuarios: [75 para S1, 75 para S2]
   │  ├─ Ejecuta Promise.all([
   │  │    addUsersToGroupFromSession(sock1, ..., 75 usuarios),
   │  │    addUsersToGroupFromSession(sock2, ..., 75 usuarios)
   │  │  ])
   │  │
   │  └─ PARALELO:
   │     ├─ Socket-1 agrega usuarios 1-75
   │     │  (con intervalos 3-8s entre cada uno)
   │     │
   │     └─ Socket-2 agrega usuarios 76-150
   │        (con intervalos 3-8s entre cada uno)
   │
   │     Tiempo total: ~max(12min S1, 12min S2) = ~12 minutos
   │     (vs 25 minutos con 1 sesión)
   │
   ├─ Espera a que ambas terminen
   ├─ Agrega resultados: 142 agregados, 3 errores, 5 duplicados
   ├─ Envía reporte final
```

---

## 8. CÓDIGO MÍNIMO PARA REPLICAR ESTA FUNCIONALIDAD

Una IA puede replicar esto con:

### 8.1 Estructura básica
```javascript
// 1. Mantener múltiples sockets (uno por sesión)
const sessions = {
    1: baileySocket1,
    2: baileySocket2
};

// 2. Deduplicador simple
const deduplicator = new Set();
function claim(messageId, sessionIndex) {
    if (deduplicator.has(messageId)) return false;
    deduplicator.add(messageId);
    setTimeout(() => deduplicator.delete(messageId), 60000);
    return true;
}

// 3. Load Balancer simple
const taskCounts = { 1: 0, 2: 0 };
function pick(requiresAdmin) {
    if (taskCounts[1] <= taskCounts[2]) return 1;
    return 2;
}

// 4. Distribuidora de tareas
async function distributeUsers(users, chatId) {
    const half = Math.ceil(users.length / 2);
    const [users1, users2] = [users.slice(0, half), users.slice(half)];
    
    const [result1, result2] = await Promise.all([
        processUsers(sessions[1], users1, chatId),
        processUsers(sessions[2], users2, chatId)
    ]);
    
    return {
        added: result1.added + result2.added,
        from: [result1, result2]
    };
}
```

---

## 9. CHECKLIST PARA IMPLEMENTAR UN SISTEMA SIMILAR

- [ ] Múltiples sockets Baileys concurrentes
- [ ] Deduplicador basado en messageId (con TTL)
- [ ] LoadBalancer que elige por carga + admin check
- [ ] SharedData con colas de escritura para prevenir corrupción
- [ ] Paralización de tareas masivas con Promise.all
- [ ] Intervalos aleatorios (no fijos) entre acciones
- [ ] Validación y normalización de phone numbers
- [ ] Gestión de errores por item (no abortar en error)
- [ ] Reportes que muestren distribución por sesión
- [ ] TTL en deduplicador para limpieza de memoria

---

## 10. NOTAS DE IMPLEMENTACIÓN IMPORTANTE

1. **No usar `async/await` para bloqueos** — WhatsApp rechaza si respuesta tarda >30s
2. **Background tasks en setTimeout** — Invitaciones en background, respuesta inmediata
3. **Validar números antes de invitar** — Evitar errores masivos
4. **Cachear metadata de grupo** — AdminChecker cachea por 5 minutos
5. **Logging de sesión** — Identificar qué sesión ejecutó qué
6. **Monitorear task counts** — Para alertas si una sesión se atasca
7. **Implementar graceful shutdown** — Limpiar locks de sesión al cerrar

---

**Archivo de referencia**: `plugins/invo.js` (v2.0 - Multi-sesión)  
**Archivos de soporte**: `core/LoadBalancer.js`, `core/Deduplicator.js`, `core/SharedData.js`
