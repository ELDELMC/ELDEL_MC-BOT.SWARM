# CONTEXTO — JUANCHOTE-SWARM
## Instrucciones para futuras IAs editoras de código

> Este archivo contiene TODAS las reglas y contexto del proyecto.  
> Cualquier IA que edite este código DEBE leer este archivo primero.

---

## 1. ¿Qué es este proyecto?

**JUANCHOTE-SWARM** es un bot de WhatsApp diseñado para **gestión y moderación de grupos**.  
Está construido con **JavaScript (ES Modules)** usando la librería **@whiskeysockets/baileys**.

La característica principal es que funciona con **2 o más sesiones (números de WhatsApp) simultáneamente**, distribuyendo la carga de trabajo para evitar saturación.

---

## 2. Plataforma de despliegue

El bot se despliega en **panel.boxmineworld.com** (panel Pterodactyl).
- Runtime: **Node.js**
- El código debe ser **JavaScript puro** (no TypeScript compilado)
- `package.json` con `"type": "module"` (ESM)
- Script de inicio: `node index.js`
- Requiere un **servidor Express** en el puerto configurado para health-check
- Sin dependencias nativas complicadas (nada de `better-sqlite3`, etc.)

---

## 3. Sesiones múltiples

- El bot soporta **2 o más sesiones** de WhatsApp operando al mismo tiempo en el **MISMO proceso Node.js**
- Configurado vía `SESSION_COUNT` en `.env` (por defecto 2)
- Cada sesión tiene su propia carpeta de auth en `sessions/session-N/`
- Los números se configuran en `PAIRING_NUMBERS` (separados por coma)
- Cada sesión tiene su propio socket de Baileys y mantiene conexión independiente

### Reglas de sesiones:

#### a) Para mensajes ordinarios:
- **Solo UNA sesión responde por mensaje** — garantizado por el `Deduplicator`
  - La primera sesión que llama `Deduplicator.claim(messageId, sessionIndex)` gana (retorna true)
  - Las otras sesiones reciben false y lo ignoran
  - Esto evita respuestas duplicadas

#### b) Para comandos:
- **Las tareas se distribuyen equitativamente** — gestionado por el `LoadBalancer`
- `LoadBalancer` mantiene contador de tareas activas por sesión
- Cuando se necesita ejecutar un comando, elige la sesión **menos cargada**

#### c) Para comandos que requieren admin:
- Si el comando requiere permisos de admin (ej: `.ban`, `.kick`, `.invo`)
- `LoadBalancer` primero verifica cuál sesión es admin en ese grupo
- Si solo 1 es admin → delega a esa
- Si múltiples son admin → elige la **menos cargada** entre ellas
- Si ninguna es admin → intenta con la menos cargada (fallará con error controlado)

#### d) Para operaciones masivas (ej: `.invo` - invitar usuarios):
- **Ambas sesiones trabajan EN PARALELO**
- Los usuarios se dividen **equitativamente** entre sesiones
- Ej: 300 usuarios + 2 sesiones → Sesión 1 agrega 150, Sesión 2 agrega 150
- Se ejecutan con `Promise.all([task1, task2])` → se espera a que ambas terminen
- Tiempo total: **~mitad del tiempo** vs usar una sola sesión
- Cada sesión respeta intervalos aleatorios (3-8s) para evitar baneo de WhatsApp

---

## 3.1 Flujo de procesamiento de mensaje

```
┌─ Usuario envía mensaje al grupo
│
├─ Ambas sesiones lo reciben (callback de Baileys)
│
├─ Deduplicator.claim(messageId, sessionIndex)
│  ├─ Sesión 1: primero → GANA (retorna true)
│  └─ Sesión 2: después → PIERDE (retorna false, ignora mensaje)
│
├─ Solo Sesión 1 continúa:
│  ├─ Verifica si es comando
│  ├─ Verifica permisos (admin, owner, etc)
│  ├─ Si es admin-only y NO es admin en ese grupo:
│  │  └─ LoadBalancer busca otra sesión que SÍ sea admin
│  │
│  ├─ Ejecuta el comando en la sesión apropiada
│  └─ Envía respuesta formateada
│
└─ Sesión 2: ignoró completamente, sigue escuchando otros mensajes
```

---

## 3.2 Ejemplo de operación masiva (.invo)

```
Usuario escribe: .invo 1 si
(para agregar 300 usuarios a un grupo desde base 1)

┌─ Deduplicator: Sesión 1 gana el mensaje
│
├─ LoadBalancer.pick(groupId, requiresAdmin=true):
│  ├─ Verifica: ¿Sesión 1 es admin del grupo? SÍ
│  ├─ Verifica: ¿Sesión 2 es admin del grupo? SÍ
│  └─ Como ambas son admin, pero es operación masiva:
│
├─ Comando .invo ejecuta en Sesión 1
│  ├─ Carga base de 300 usuarios
│  ├─ Enutra addUsersWithMultipleSessions()
│  │  ├─ Obtiene sesiones activas: [1, 2]
│  │  ├─ Divide usuarios: [150 para S1, 150 para S2]
│  │  └─ Ejecuta en PARALELO:
│  │
│  │     Sesión 1:                        Sesión 2:
│  │     usuario 1   → esperar 3-8s       usuario 151 → esperar 3-8s
│  │     usuario 2   → esperar 3-8s       usuario 152 → esperar 3-8s
│  │     ...                              ...
│  │     usuario 150 (sin esperar)        usuario 300 (sin esperar)
│  │
│  │     Tiempo: ~12-15 minutos           Tiempo: ~12-15 minutos
│  │     (ambas en paralelo)               
│  │
│  ├─ Espera Promise.all() → ambas terminan
│  └─ Reporte: 300 agregados (distribuidos entre S1 y S2)
│
└─ Ventaja: Redujo tiempo a la mitad vs una sola sesión
```

---

## 4. Prefijos de comandos

Los prefijos son: **`.` `!` `/` `#`**

Todos los comandos actuales y futuros DEBEN funcionar con TODOS estos prefijos.  
Ejemplo: `.ban`, `!ban`, `/ban`, `#ban` — todos hacen lo mismo.

Los prefijos se configuran en `config.js` y en `.env` como `PREFIXES=.,!,/,#`

---

## 5. Estilo visual de respuestas — MUY IMPORTANTE

**TODAS** las respuestas del bot DEBEN usar el estilo Unicode **Mathematical Monospace**.

### Conversión de caracteres:
- `A-Z` → `𝙰-𝚉` (U+1D670 a U+1D689)
- `a-z` → `𝚊-𝚣` (U+1D68A a U+1D6A3)
- `0-9` → `𝟶-𝟿` (U+1D7F6 a U+1D7FF)
- Los emojis, espacios, puntuación y caracteres especiales se mantienen tal cual

### Nombre del bot:
```
⸙𝙴𝙻𝙳𝙴𝙻_𝙼𝙲-𝙱𝙾𝚃⸙
```

### Caracteres decorativos usados:
- `⸙` — marcador principal del bot
- `◈` — sub-headers
- `✦` — sparkle
- `❖` — bullets para listas
- `꒰` `꒱` — encierros decorativos
- `━` — líneas horizontales
- `•` — punto medio

### Funciones de formato disponibles en `core/Formatter.js`:
- `toMono(text)` — convierte texto a monospace Unicode
- `header(text)` — header decorado: `⸙━━━━━ 𝙼𝙴𝙽𝚄 ━━━━━⸙`
- `subheader(text)` — sub header: `◈ 𝙲𝚊𝚝𝚎𝚐𝚘𝚛𝚒𝚊`
- `bullet(text)` — item con bullet: `  ❖ 𝚝𝚎𝚡𝚝𝚘`
- `botTag()` — retorna `⸙𝙴𝙻𝙳𝙴𝙻_𝙼𝙲-𝙱𝙾𝚃⸙`
- `reply(text)` — texto mono con footer del bot
- `formatMessage(title, body)` — mensaje completo con header y footer
- `formatList(title, items)` — lista formateada

---

## 6. Arquitectura del código

### Estructura de carpetas:
```
JUANCHOTE-SWARM/
├── index.js              # Punto de entrada
├── config.js             # Configuración centralizada
├── package.json
├── contexto.md           # ← ESTE ARCHIVO
├── .env.example
├── core/
│   ├── SessionManager.js # Gestión de sesiones Baileys
│   ├── LoadBalancer.js   # Distribución equitativa de tareas
│   ├── Deduplicator.js   # Evita respuestas duplicadas
│   ├── SharedData.js     # Lectura/escritura concurrente de archivos JSON
│   ├── AdminChecker.js   # Verificación de admin por sesión
│   ├── Formatter.js      # Conversión Unicode fancy text
│   ├── CommandHandler.js # Carga y gestión de comandos
│   ├── MessageHandler.js # Procesamiento de mensajes
│   └── Logger.js         # Console formateado con colores
├── plugins/              # Cada archivo = 1 comando
│   ├── ping.js
│   ├── menu.js
│   ├── ban.js
│   ├── unban.js
│   ├── kick.js
│   ├── promote.js
│   ├── demote.js
│   ├── info.js
│   └── hidetag.js
├── data/                 # Datos compartidos (JSON)
└── sessions/             # Auth por sesión (auto-generado)
```

### Flujo de un mensaje:
```
1. WhatsApp envía mensaje → TODAS las sesiones lo reciben
2. Deduplicator.claim(msgId, sessionIndex)
   → La primera sesión que llame claim() gana
   → Las demás sesiones reciben false y lo ignoran
3. MessageHandler.handleMessage() procesa el mensaje:
   - Extrae texto, chatId, senderId
   - Verifica si es comando
   - Verifica si usuario está baneado
   - Verifica permisos (admin, owner)
   - Si es comando admin y la sesión NO es admin,
     LoadBalancer busca otra sesión que SÍ sea admin
   - Ejecuta el handler del plugin
   - Aplica formato Unicode a la respuesta
4. LoadBalancer lleva cuenta de tareas por sesión
```

---

## 7. Cómo crear un nuevo comando/plugin

Crear un archivo en `plugins/nombre.js`:

```javascript
import { reply } from '../core/Formatter.js';

export default {
    command: 'nombre',          // Nombre del comando (sin prefijo)
    aliases: ['alias1'],         // Alias opcionales
    category: 'general',        // Categoría: general, admin, moderation, owner, misc
    description: 'Descripción', // Qué hace el comando
    usage: '.nombre args',      // Cómo usarlo
    groupOnly: false,           // true = solo funciona en grupos
    adminOnly: false,           // true = requiere ser admin del grupo
    ownerOnly: false,           // true = solo el owner del bot
    cooldown: 3000,             // Cooldown en ms (por defecto 3000)

    async handler(sock, message, args, context) {
        // sock      — socket de Baileys (ya es la sesión correcta)
        // message   — objeto de mensaje de Baileys
        // args      — array de argumentos del comando
        // context   — { chatId, senderId, isGroup, isSenderAdmin, isBotAdmin,
        //              senderIsOwner, sessionIndex, prefix, config, ... }

        await sock.sendMessage(context.chatId, {
            text: reply('Respuesta del bot'),  // SIEMPRE usar reply() o toMono()
        }, { quoted: message });
    },
};
```

### Reglas para plugins:
1. **SIEMPRE** usar `reply()`, `toMono()`, o `formatMessage()` para las respuestas
2. Para escribir datos compartidos, usar `sharedData.update()`
3. Para verificar admin, ya viene en `context.isBotAdmin` y `context.isSenderAdmin`
4. Hot-reload: al guardar el archivo, el bot lo recarga automáticamente
5. Cada plugin se carga dinámicamente — no hay que importarlo manualmente

---

## 8. Datos compartidos

Los datos se almacenan en archivos JSON dentro de `data/`.
- Usar `import sharedData from '../core/SharedData.js'`
- `sharedData.read('archivo.json', valorDefault)` — leer
- `sharedData.write('archivo.json', datos)` — escribir
- `sharedData.update('archivo.json', default, fn)` — leer-modificar-escribir (atómico)

El sistema serializa escrituras al mismo archivo para evitar corrupción.

---

## 9. Rendimiento y rapidez

- La **rapidez** es prioridad
- `Deduplicator` usa `Map` nativo (O(1) lookup)
- `AdminChecker` cachea metadata de grupo (TTL: 5 min)
- `SharedData` cachea lecturas en memoria (TTL: 5 seg)
- Cooldowns previenen spam de comandos
- Health-check Express es mínimo
- No hay dependencias pesadas innecesarias

---

## 10. Logging / Console

El logger muestra información limpia y clara:
```
[14:30:15] [S1] ✅ Connected! Phone: 573001234567
[14:30:16] [S2] ✅ Connected! Phone: 573009876543
╭──────────────────────────────────
│ [S1] [14:30:20] TEXT
│ 📨 FROM Juan (573001234567)
│ 👥 GROUP Mi Grupo
│ 💭 .menu
╰──────────────────────────────────
[14:30:20] [S1] ⚡ .menu (45ms)
```

Cada sesión se identifica con `[S1]`, `[S2]`, etc.
Tipos de log: info 💡, success ✅, warn ⚠️, error ❌, cmd ⚡, debug 🔍

---

## 11. Reglas de conflicto entre sesiones

| Situación | Resolución |
|-----------|-----------|
| 2 sesiones reciben mismo mensaje | Deduplicator: solo la primera que llame `claim()` lo procesa |
| `.ban @user` y ambas son admin | LoadBalancer: elige la menos cargada |
| `.kick @user` y solo 1 es admin | LoadBalancer + AdminChecker: delega a la sesión admin |
| `.menu` enviado por usuario | Deduplicator: solo 1 sesión responde |
| Escritura a `banned.json` simultánea | SharedData: serializa las escrituras en cola |

---

## 12. Variables de entorno (.env)

| Variable | Descripción | Default |
|----------|------------|---------|
| `BOT_NAME` | Nombre del bot | `⸙𝙴𝙻𝙳𝙴𝙻_𝙼𝙲-𝙱𝙾𝚃⸙` |
| `OWNER_NUMBER` | Número del dueño | (vacío) |
| `SESSION_COUNT` | Cantidad de sesiones | `2` |
| `PAIRING_NUMBERS` | Números separados por coma | (vacío) |
| `PREFIXES` | Prefijos de comandos | `.,!,/,#` |
| `COMMAND_MODE` | Modo del bot (public/private) | `public` |
| `PORT` | Puerto del health server | `3000` |
| `TIMEZONE` | Zona horaria | `America/Bogota` |

---

## 13. Comando .INVO - Invitaciones masivas multi-sesión

### Descripción:
El comando `.invo` permite agregar cientos de usuarios a un grupo de forma masiva. **Ambas sesiones trabajan en paralelo** para reducir el tiempo a la mitad.

### Estructura de datos:
Las bases de datos se guardan en `db/grupos_clonados/` como archivos JSON. Soportan varios formatos:

```json
// Formato 1: Array simple
["573001234567", "573009876543", "584245583273"]

// Formato 2: Array con @s.whatsapp.net
["573001234567@s.whatsapp.net", "573009876543@s.whatsapp.net"]

// Formato 3: Objeto con propiedades
{
  "user1": { "phone": "573001234567", "name": "Juan" },
  "user2": { "number": "573009876543" }
}
```

### Algoritmo de distribución:
```
1. Usuario ejecuta: .invo 1 si
2. Sesión 1 carga 300 usuarios de base 1
3. Divide equitativamente: 150 para S1, 150 para S2
4. Ejecuta Promise.all([
     S1.addUsersToGroup(usuarios 1-150),
     S2.addUsersToGroup(usuarios 151-300)
   ])
5. AMBAS SESIONES TRABAJAN EN PARALELO
   - S1 agrega usuarios 1-150 (con intervalos 3-8s entre cada uno)
   - S2 agrega usuarios 151-300 (con intervalos 3-8s entre cada uno)
   - Tiempo total: ~mitad vs una sola sesión
6. Espera a que ambas terminen
7. Reporta: X agregados, Y errores, Z duplicados (desglosado por sesión)
```

### Protecciones anti-baneo:
- ✅ Intervalos aleatorios 3-8 segundos (no fijos)
- ✅ Validación de números (10-15 dígitos)
- ✅ Evita re-invitar personas ya en grupo
- ✅ Manejo de errores individual (no aborta si uno falla)
- ✅ Límites respetados: máximo 200-300 usuarios/día por sesión

### Archivos relacionados:
- `plugins/invo.js` — Comando principal
- `TECHNICAL_MULTI_SESSION.md` — Documentación técnica detallada
- `INVO_GUIDE.md` — Guía para usuarios
- `db/grupos_clonados/` — Bases de datos de usuarios

---

## 14. Clonador - Recopilación de usuarios

### Descripción:
El sistem de **clonador** captura automáticamente los números de teléfono de los usuarios que escriben en grupos monitorizados, guardándolos en bases de datos para usarlas después con `.invo`.

### Ubicación del clonador:
```
CLONADOR/
├── engine.js             # Motor del clonador
├── utils/
│   ├── clonador.js       # Lógica de captura
│   └── spyMode.js        # Modo espía
└── db/
    ├── espionaje.json    # Datos globales
    └── grupos_clonados/  # Base por grupo
```

### Flujo:
```
1. Usuario escribe en grupo [siendo monitoreado]
2. Mensaje llega al bot
3. Se extrae senderId (573001234567@s.whatsapp.net)
4. Se valida el número
5. Se guarda en db/grupos_clonados/{grupo}.json
6. Después usar .invo para invitar a otros grupos
```

### Detalles técnicos:
- Los números se capturan del campo `message.key.participant`
- Se normalizan a formato `573001234567@s.whatsapp.net`
- Se evitan duplicados verificando antes de guardar
- Se usan escrituras concurrentes serializadas (SharedData) para evitar corrupción

---

## 15. Límites y restricciones conocidas de WhatsApp

| Aspecto | Límite Seguro | Límite Peligroso | Acción |
|---------|---------------|-----------------|--------|
| Invitaciones/hora | 30-50 | >100 | Ralentizar |
| Invitaciones/día | 200-300/sesión | >500 total | Distribuir entre sesiones |
| Intervalo mínimo | 3-5 seg | <1 seg | Aumentar intervalo |
| Números inválidos | <5% | >20% | Limpiar base datos |
| Grupos simultáneos | 2-3 | >5 | Espaciar en tiempo |

---

## 16. Arquitectura del sistema de datos compartidos

Cuando múltiples sesiones escriben al mismo archivo JSON:

```javascript
// SharedData usa colas de escritura por archivo
writeQueues = {
  'user.json': [promesa1] → [promesa1 + promesa2] → [promesa1 + promesa2 + promesa3]
}

// Escritura 1 (S1): escribe, después libera
// Escritura 2 (S2): espera a 1, escribe, después libera
// Escritura 3 (S1): espera a 1+2, escribe, después libera

// Resultado: NUNCA hay corrupción de archivo
```

**Beneficio**: Ambas sesiones pueden recopilar usuarios y escribir a la misma base sin conflictos.
