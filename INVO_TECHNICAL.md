# 🔧 DOCUMENTACIÓN TÉCNICA - COMANDO INVO

## 📁 Archivos relacionados

| Archivo | Propósito |
|---------|----------|
| `plugins/invo.js` | Comando principal |
| `db/grupos_clonados/` | Bases de datos con números de usuarios |
| `INVO_GUIDE.md` | Guía de usuario |

---

## 🏗️ Arquitectura

### Estructura del comando
```javascript
export default {
    command: 'invo',
    aliases: ['invite', 'invitar', 'agregar'],
    category: 'admin',
    description: '...',
    usage: '...',
    groupOnly: true,
    adminOnly: true,
    cooldown: 5000,
    async handler(sock, message, args, context) { ... }
}
```

### Flujo de ejecución

```
usuario escribe .invo
    ↓
¿Hay args?
    ├─ NO → Muestra menú de bases de datos
    └─ SÍ → Parsea índice seleccionado
         ↓
       ¿Índice válido?
         ├─ NO → Error
         └─ SÍ → Carga el archivo JSON
            ↓
          ¿Hay confirmación (si)?
            ├─ NO → Muestra confirmación
            └─ SÍ → Inicia proceso
               ↓
             Ejecuta addUsersToGroup() en background
               ↓
             Envía reporte final
```

---

## 🔑 Funciones principales

### `getDatabaseList()`
- Lee todos los archivos `.json` en `db/grupos_clonados/`
- Calcula la cantidad de usuarios en cada base
- Retorna array ordenado con metadata

**Salida:**
```javascript
[
  {
    index: 1,
    name: 'caraota',
    file: 'caraota.json',
    count: 150
  },
  // ...
]
```

### `extractPhoneNumber(entry)`
- Extrae números de teléfono desde diferentes formatos
- Soporta strings simples, objetos con propiedad `phone` o `number`

**Soporta:**
- `"573001234567@s.whatsapp.net"` → extrae 573001234567
- `{ phone: "573001234567" }` → extrae 573001234567
- `{ number: "573009876543" }` → extrae 573009876543

### `normalizePhoneNumber(phone)`
- Limpia el número de caracteres especiales
- Valida que tenga 10-15 dígitos
- Retorna en formato Baileys: `{numero}@s.whatsapp.net`

### `getRandomInterval()`
- Genera intervalo aleatorio entre 3-8 segundos
- Retorna valor en milisegundos

**Cálculo:**
```javascript
Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000
= random entre 3000-8000 ms
```

### `addUsersToGroup(sock, chatId, userNumbers, message)`
- Agrega usuarios uno a uno con intervalos aleatorios
- Valida que no estén duplicados en el grupo
- Maneja errores por usuario sin abortar el proceso

**Retorna:**
```javascript
{
  added: 142,      // Usuarios agregados exitosamente
  failed: 3,       // Errores durante invitación
  skipped: 5,      // Ya estaban en el grupo
  results: [...]   // Detalles por usuario (opcional)
}
```

---

## 📊 Parámetros en contexto

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `sock` | object | Socket Baileys de la sesión activa |
| `chatId` | string | JID del grupo (formato: `xxxxx@g.us`) |
| `message` | object | Objeto del mensaje de Baileys |
| `args` | array | Argumentos después del comando |
| `context` | object | Contexto: `{ chatId, sessionIndex, prefix }` |

---

## 🔐 Validaciones

1. **Solo en grupos**: `groupOnly: true`
   - Si es privado → error automático

2. **Solo admins**: `adminOnly: true`
   - Si usuario no es admin → error automático

3. **Índice de base válido**:
   - Debe ser número entre 1 y cantidad de bases
   - Si no → muestra error

4. **Base con usuarios**:
   - Si base vacía → muestra error

5. **Formato de confirmación**:
   - Acepta: 'si', 'yes', 'y', 'ok'
   - Sin confirmación → muestra mensaje de confirmación

---

## 🔄 Intervalos y tiempos

| Operación | Tiempo | Notas |
|-----------|--------|-------|
| Intervalo entre invitaciones | 3-8 seg | Aleatorio |
| Delay en error | 1 seg | Fijo |
| Inicio del proceso | 500 ms | Delay para respuesta inmediata |

**Ejemplo de timeline:**
```
00:00 - Usuario escribe .invo 1 si
00:00.5 - Bot responde "🚀 INICIANDO..."
00:03 - Primer usuario agregado
00:08 - Segundo usuario agregado (5 seg después)
00:15 - Tercer usuario agregado (7 seg después)
...
```

---

## 📝 Manejo de errores

### Errors capturados

1. **Archivo corrompido (JSON)**
   - El comando intenta parsear como JSON
   - Si falla → muestra error al usuario

2. **Número inválido**
   - Contabilizado como `skipped`
   - El proceso continúa con el siguiente

3. **Usuario ya en grupo**
   - Contabilizado como `skipped`
   - No intenta agregarlo

4. **JID no existe (número fantasma)**
   - Error de WhatsApp
   - Contabilizado como `failed`
   - El proceso continúa

5. **Permisos insuficientes**
   - Error nativo del bot
   - Mensaje de error enviado

---

## 🚀 Mejoras futuras posibles

1. **Historial de invitaciones**
   - Guardar en `db/invo_history.json`
   - Evitar reinvitar mismo grupo mismo día

2. **Pausa/Reanudación**
   - Comando `.invo stop` para pausar
   - Comando `.invo resume` para reanudar

3. **Personalización de intervalos**
   - `.invo 1 si --fast` (1-3 segundos)
   - `.invo 1 si --safe` (5-12 segundos)

4. **Múltiples bases simultáneamente**
   - `.invo 1,2,3 si` agregar de 3 bases

5. **Filtrado antes de agregar**
   - `.invo 1 si --no-duplicates`
   - `.invo 1 si --active-only`

6. **Logging detallado**
   - Guardar cada invitación exitosa/fallida
   - Para auditoría y estadísticas

---

## 🧪 Testing

### Casos de prueba manuales

- [ ] Escribir `.invo` sin args → Debe mostrar menú
- [ ] Escribir `.invo 999` → Error "número inválido"
- [ ] Escribir `.invo 1` → Muestra confirmación
- [ ] Escribir `.invo 1 si` → Inicia proceso
- [ ] Base vacía → Error apropiado
- [ ] En privado → Error "solo grupos"
- [ ] Sin permisos admin → Error automático
- [ ] Múltiples usuarios duplicados → Contabiliza como skipped
- [ ] Usuario fantasma → Contabiliza como failed

---

## 📌 Notas importantes

1. **Performance**: Para 1000+ usuarios, puede tomar 1+ hora
2. **Sesiones**: Ambos bots pueden usar simultáneamente en diferentes grupos
3. **Rate limiting**: WhatsApp puede limitar después de ~300-500/día
4. **Baneo**: Respetar intervalos y evitar patrones detectables
5. **Cache**: No hay cache, siempre lee fresh desde archivo

