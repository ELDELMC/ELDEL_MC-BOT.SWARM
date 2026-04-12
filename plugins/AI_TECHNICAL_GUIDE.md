# 📘 GUÍA TÉCNICA PARA IAs - REPLICAR SISTEMA MULTI-SESIÓN

## 🎯 Objetivo

Permitir que una IA lea esta guía y pueda replicar completamente el sistema de multi-sesión con paralelismo de tareas del bot JUANCHOTE-SWARM.

---

## 📋 TABLA DE CONTENIDOS

1. [Conceptos fundamentales](#1-conceptos-fundamentales)
2. [Componentes principales](#2-componentes-principales)
3. [Flujos de ejecución](#3-flujos-de-ejecución)
4. [Algoritmos clave](#4-algoritmos-clave)
5. [Ejemplo completo paso a paso](#5-ejemplo-completo-paso-a-paso)
6. [Checklist de implementación](#6-checklist-de-implementación)

---

## 1. CONCEPTOS FUNDAMENTALES

### 1.1 ¿Qué es una "sesión"?

Una sesión es una **instancia independiente de conexión a WhatsApp**.

```
Sesión = Número de teléfono + Socket Baileys + Estado de auth
```

**Ejemplo:**
```javascript
const sesion1 = {
    numero: "573001234567",
    socket: baiLeysSocket1,
    auth: { creds: {...}, keys: {...} }
};

const sesion2 = {
    numero: "573009876543",
    socket: baiLeysSocket2,
    auth: { creds: {...}, keys: {...} }
};
```

### 1.2 ¿Por qué múltiples sesiones?

```
1 sesión:  10 invitaciones/minuto = 100 invitaciones en 10 minutos
2 sesiones: 20 invitaciones/minuto = 100 invitaciones en 5 minutos (50% más rápido)

Cada sesión puede:
- Recibir mensajes simultáneamente
- Ser admin en diferentes grupos
- Ejecutar comandos en paralelo
```

### 1.3 El desafío del paralelismo

**Problema:** Si dos sesiones reciben el mismo mensaje, ¿quién responde?

**Solución:** Deduplicator (explicado en 2.1)

---

## 2. COMPONENTES PRINCIPALES

### 2.1 Deduplicator

**Propósito:** Asegurar que solo UNA sesión procesa cada mensaje.

**Implementación minimalista:**

```javascript
class Deduplicator {
    constructor(ttlMs = 60000) {
        this.claimed = new Map(); // msgId → sessionIndex
        this.ttl = ttlMs;
    }
    
    claim(messageId, sessionIndex) {
        // Si ya alguien lo reclamó:
        if (this.claimed.has(messageId)) {
            return false; // "No ganas este mensaje"
        }
        
        // Este es el primero:
        this.claimed.set(messageId, sessionIndex);
        
        // Auto-limpiar después de TTL:
        setTimeout(() => this.claimed.delete(messageId), this.ttl);
        
        return true; // "Ganaste este mensaje"
    }
}

// USO:
if (dedup.claim(msg.id, sessionIndex)) {
    // Solo esta sesión continúa
    handler(msg);
} else {
    // Otra sesión ya lo procesó, ignora
    return;
}
```

**Ventaja:** O(1) lookup, automático cleanup.

### 2.2 LoadBalancer

**Propósito:** Distribuir tareas equitativamente entre sesiones.

**Implementación minimalista:**

```javascript
class LoadBalancer {
    constructor() {
        this.taskCounts = new Map(); // sessionIndex → count
        this.sessions = new Map(); // sessionIndex → socket
    }
    
    register(sessionIndex, socket) {
        this.sessions.set(sessionIndex, socket);
        this.taskCounts.set(sessionIndex, 0);
    }
    
    getActiveSessions() {
        return [...this.sessions.keys()]; // [1, 2]
    }
    
    pick(requiresAdmin = false, groupId = null) {
        const active = this.getActiveSessions();
        
        // Si requiere admin y tenemos groupId:
        if (requiresAdmin && groupId) {
            const adminSessions = [];
            for (const idx of active) {
                // Verificar if socket[idx] is admin in groupId
                if (this.isAdminInGroup(idx, groupId)) {
                    adminSessions.push(idx);
                }
            }
            
            // Si hay opciones, elegir la menos cargada
            if (adminSessions.length > 0) {
                return this.getLeastLoaded(adminSessions);
            }
        }
        
        // Sino, elegir la menos cargada de todas
        return this.getLeastLoaded(active);
    }
    
    getLeastLoaded(candidates) {
        let minIdx = candidates[0];
        let minCount = this.taskCounts.get(minIdx) || 0;
        
        for (const idx of candidates) {
            const count = this.taskCounts.get(idx) || 0;
            if (count < minCount) {
                minCount = count;
                minIdx = idx;
            }
        }
        
        return minIdx;
    }
    
    incrementTask(sessionIndex) {
        this.taskCounts.set(
            sessionIndex,
            (this.taskCounts.get(sessionIndex) || 0) + 1
        );
    }
    
    completeTask(sessionIndex) {
        this.taskCounts.set(
            sessionIndex,
            Math.max(0, (this.taskCounts.get(sessionIndex) || 0) - 1)
        );
    }
}

// USO:
const sessionIndex = lb.pick(requiresAdmin=true, groupId);
lb.incrementTask(sessionIndex);
await executeTask(sessions[sessionIndex]);
lb.completeTask(sessionIndex);
```

### 2.3 SharedData

**Propósito:** Permitir escrituras concurrentes a archivos sin corrupción.

**Implementación minimalista:**

```javascript
class SharedData {
    constructor() {
        this.writeQueues = new Map(); // filename → queue de promesas
        this.cache = new Map();
    }
    
    async write(filename, data) {
        // Obtener la cola actual para este archivo
        const prevQueue = this.writeQueues.get(filename) || Promise.resolve();
        
        // Crear una nueva promesa que espera la anterior
        const writePromise = prevQueue.then(() => {
            // Solo después de que termine la anterior, hacer esta escritura
            fs.writeFileSync(filename, JSON.stringify(data, null, 2));
            this.cache.set(filename, data);
        });
        
        // Guardar como la nueva cola
        this.writeQueues.set(filename, writePromise);
        
        return writePromise;
    }
    
    read(filename, defaultValue = null) {
        // Si está cacheado, devolver rápido
        if (this.cache.has(filename)) {
            return this.cache.get(filename);
        }
        
        // Si no, leer del disco
        try {
            const data = JSON.parse(fs.readFileSync(filename, 'utf-8'));
            this.cache.set(filename, data);
            return data;
        } catch (err) {
            return defaultValue;
        }
    }
}

// USO - Dos sesiones escriben simultáneamente:
// Moment 0: S1.write('file.json', data1) → entra en cola
// Moment 0.1: S2.write('file.json', data2) → espera a S1
// Moment 0.2: S1 termina
// Moment 0.3: S2 comienza (después de S1)
// Result: Sin corrupción, orden garantizado
```

---

## 3. FLUJOS DE EJECUCIÓN

### 3.1 Flujo de mensaje ordinario

```
User → Group → Message received

PARALLEL en ambas sesiones:
  S1: Baileys callback → recv(message)
  S2: Baileys callback → recv(message)

EN SECUENCIA:
  ├─ S1 calls: Deduplicator.claim(msg.id, 1)
  │  └─ Returns TRUE (primera en llegar)
  │
  ├─ S1 procesa: MessageHandler.handle(msg)
  │  ├─ Extrae comando/texto
  │  ├─ Verifica permisos
  │  ├─ Ejecuta handler
  │  └─ Envía respuesta
  │
  └─ S2 calls: Deduplicator.claim(msg.id, 2)
     └─ Returns FALSE (S1 ya la reclamó)
        S2 termina, ignora el mensaje
```

### 3.2 Flujo de comando admin

```
User: .ban @usuario (en grupo)

├─ Deduplicator: S1 gana
│
├─ MessageHandler detecta: requiresAdmin=true
│
├─ LoadBalancer.pick(requiresAdmin=true, groupId):
│  ├─ ¿S1 es admin del grupo? Sí
│  ├─ ¿S2 es admin del grupo? Sí
│  └─ Como ambas son admin, elige la MENOS cargada
│     (supongamos S2 tiene menos tareas)
│
├─ Comando se ejecuta en S2 (la menos cargada)
│  (aunque S1 original procesó el mensaje)
│
└─ Respuesta enviada desde S2
```

### 3.3 Flujo de operación masiva (.invo)

```
User: .invo 1 si (agregar 300 usuarios)

├─ Deduplicator: S1 gana
│
├─ Handler invo.js en S1:
│  ├─ Carga 300 usuarios de base 1
│  │
│  ├─ Llama: addUsersWithMultipleSessions(300 usuarios)
│  │  ├─ LoadBalancer.getActiveSessions() → [1, 2]
│  │  ├─ Divide: [150 para S1, 150 para S2]
│  │  │
│  │  └─ Ejecuta Promise.all([
│  │       PARALELAMENTE:
│  │       S1: addUsersToGroupFromSession(150 usuarios)
│  │           ├─ usuario 1 → agregar
│  │           ├─ sleep(random 3-8s)
│  │           ├─ usuario 2 → agregar
│  │           ├─ sleep(random 3-8s)
│  │           └─ ... 150 usuarios en ~12 min
│  │
│  │       S2: addUsersToGroupFromSession(150 usuarios)
│  │           ├─ usuario 151 → agregar
│  │           ├─ sleep(random 3-8s)
│  │           ├─ usuario 152 → agregar
│  │           ├─ sleep(random 3-8s)
│  │           └─ ... 150 usuarios en ~12 min
│  │     ])
│  │
│  ├─ Espera Promise.all(): ambas terminan
│  │
│  └─ Reporta: 300 agregados (S1: 150, S2: 150)
```

---

## 4. ALGORITMOS CLAVE

### 4.1 División equitativa de tareas

```javascript
function divideEqually(items, numGroups) {
    // items: array de elementos
    // numGroups: número de grupos a crear
    
    const groups = [];
    const itemsPerGroup = Math.ceil(items.length / numGroups);
    
    for (let i = 0; i < items.length; i += itemsPerGroup) {
        groups.push(items.slice(i, i + itemsPerGroup));
    }
    
    return groups;
}

// EJEMPLO:
const users = [u1, u2, ..., u300]; // 300 users
const groups = divideEqually(users, 2);
// Result: [[u1..u150], [u151..u300]]

// Ahora ejecutar en paralelo:
await Promise.all([
    processGroup(groups[0], session1),
    processGroup(groups[1], session2)
]);
```

### 4.2 Intervalo aleatorio para anti-baneo

```javascript
function getRandomInterval(minMs = 3000, maxMs = 8000) {
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

// USO:
for (let user of users) {
    await addUser(user);
    
    if (user !== userS.last)) {
        const interval = getRandomInterval(); // 3721ms, 5429ms, etc
        await sleep(interval);
    }
}

// Beneficio: Patrón irregular detectado
// vs patrón regular (siempre 5s exacto)
```

### 4.3 Validación y normalización de números

```javascript
function validatePhoneNumber(input) {
    // input: "573001234567" o "573001234567@s.whatsapp.net" o "+57 300 123 4567"
    
    // Limpiar: solo dígitos
    const cleaned = input.replace(/\D/g, '');
    
    // Validar longitud: 10-15 dígitos
    if (cleaned.length < 10 || cleaned.length > 15) {
        return null; // Inválido
    }
    
    // Normalizar: agregar sufijo Baileys
    return `${cleaned}@s.whatsapp.net`;
}

// EJEMPLOS:
validatePhoneNumber("573001234567") 
  → "573001234567@s.whatsapp.net" ✓
  
validatePhoneNumber("+57 300 123 4567") 
  → "573001234567@s.whatsapp.net" ✓
  
validatePhoneNumber("123") 
  → null ✗ (demasiado corto)
```

---

## 5. EJEMPLO COMPLETO PASO A PASO

### 5.1 Setup inicial

```javascript
// 1. Crear deduplicador
const dedup = new Deduplicator();

// 2. Crear load balancer
const lb = new LoadBalancer();

// 3. Conectar sesiones (pseudocódigo)
const session1 = await makeSession(number1);
const session2 = await makeSession(number2);

lb.register(1, session1.socket);
lb.register(2, session2.socket);

// 4. Crear shared data
const shared = new SharedData();
```

### 5.2 Recibir mensaje

```javascript
// Baileys callback para ambas sesiones
session1.socket.on('messages.upsert', async (m) => {
    handleIncomingMessage(m, sessionIndex=1);
});

session2.socket.on('messages.upsert', async (m) => {
    handleIncomingMessage(m, sessionIndex=2);
});

async function handleIncomingMessage(msg, sessionIndex) {
    // Intentar reclamar este mensaje
    if (!dedup.claim(msg.key.id, sessionIndex)) {
        // Otra sesión ya lo procesó
        return;
    }
    
    // Esta sesión lo procesó
    processMessage(msg, sessionIndex);
}
```

### 5.3 Procesar comando

```javascript
async function processMessage(msg, sessionIndex) {
    const text = extractText(msg);
    
    if (!text.startsWith('.invo')) {
        return;
    }
    
    const args = text.slice(5).trim().split(/\s+/);
    
    if (args[0] === '1' && args[1] === 'si') {
        // Cargar usuarios de base 1
        const users = loadData('base1.json');
        
        // Iniciar invitaciones masivas
        await inviteMultipleSessions(users);
    }
}
```

### 5.4 Invitar con múltiples sesiones

```javascript
async function inviteMultipleSessions(users) {
    // Obtener sesiones activas
    const activeSessions = lb.getActiveSessions(); // [1, 2]
    
    // Dividir usuarios
    const groups = divideEqually(users, activeSessions.length);
    
    // Crear promesas
    const promises = [];
    for (let i = 0; i < activeSessions.length; i++) {
        const sessionIndex = activeSessions[i];
        const socket = sessions[sessionIndex];
        
        promises.push(
            inviteFromSession(socket, groups[i], sessionIndex)
        );
    }
    
    // Ejecutar en paralelo
    const results = await Promise.all(promises);
    
    // Reportar
    let totalAdded = 0;
    for (const result of results) {
        totalAdded += result.added;
    }
    
    console.log(`Total agregados: ${totalAdded}`);
}
```

### 5.5 Invitar desde una sesión

```javascript
async function inviteFromSession(socket, users, sessionIndex) {
    let added = 0;
    const groupId = "123456@g.us"; // Grupo destino
    
    // Obtener miembros actuales
    const members = await socket.groupMetadata(groupId);
    const memberIds = members.participants.map(p => p.id);
    
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const normalized = validatePhoneNumber(user);
        
        // Si no es válido o ya está:
        if (!normalized || memberIds.includes(normalized)) {
            continue;
        }
        
        try {
            // Agregar usuario
            await socket.groupParticipantsUpdate(
                groupId,
                [normalized],
                'add'
            );
            
            added++;
            memberIds.push(normalized);
            
            // Esperar intervalo aleatorio
            if (i < users.length - 1) {
                await sleep(getRandomInterval());
            }
        } catch (err) {
            // Continuar con siguiente
        }
    }
    
    return { added, sessionIndex };
}
```

---

## 6. CHECKLIST DE IMPLEMENTACIÓN

### Nivel 1: Básico (debe tener)

- [ ] 2+ sockets Baileys concurrentes
- [ ] Deduplicador con Map y TTL
- [ ] LoadBalancer que elige sesión menos cargada
- [ ] Handlers que ejecutan en sesión seleccionada
- [ ] Logging mostrando qué sesión ejecutó qué

### Nivel 2: Intermedio (muy recomendado)

- [ ] SharedData con colas de escritura
- [ ] AdminChecker con caché
- [ ] Validación de phone numbers
- [ ] Intervalos aleatorios (anti-baneo)
- [ ] Manejo de errores por item

### Nivel 3: Avanzado (opcional pero useful)

- [ ] Promise.all para paralelismo de tareas
- [ ] Reportes desglosados por sesión
- [ ] Health checks por sesión
- [ ] Cooldowns por comando
- [ ] Graceful shutdown

### Nivel 4: Producción (para deployment)

- [ ] Monitoreo de memory leaks
- [ ] Reinicio automático si sesión cae
- [ ] Alertas si una sesión se atasca
- [ ] Métricas de performance
- [ ] Backups automáticos

---

## 📚 REFERENCIAS INTERNAS

**Ver estos archivos para más detalles:**

- `core/Deduplicator.js` — Implementación completa del deduplicador
- `core/LoadBalancer.js` — Implementación de load balancer
- `core/SharedData.js` — Implementación de datos compartidos
- `plugins/invo.js` — Caso de uso (invitaciones masivas)
- `TECHNICAL_MULTI_SESSION.md` — Documentación técnica detallada

---

## ✅ CONCLUSIÓN

Con estos 6 componentes, una IA puede:

1. ✅ Entender cómo funciona el sistema
2. ✅ Replicar la arquitectura completa
3. ✅ Implementar multi-sesión con paralelismo
4. ✅ Agregar nuevos comandos que usen ambas sesiones
5. ✅ Escalar a 3+ sesiones con pocos cambios

**Tiempo estimado para replicar:** 2-4 horas para una IA con conocimiento de JavaScript y Node.js.

---

**Documento:** Guía técnica para IAs  
**Versión:** 1.0  
**Fecha:** 2024-04-08  
**Confidencialidad:** Puede compartirse con IAs/otros developers
