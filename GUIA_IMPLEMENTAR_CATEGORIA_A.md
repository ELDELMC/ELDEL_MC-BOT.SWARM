# 🎯 GUÍA PRÁCTICA - IMPLEMENTAR COMANDOS CATEGORÍA A

Este documento proporciona ejemplos prácticos para implementar los primeros 35 comandos de la Categoría A.

---

## 📌 ESTRUCTURA BASE DE UN COMANDO

Todos los comandos deben seguir esta estructura:

```javascript
export default {
    command: 'nombre-del-comando',
    aliases: ['alias1', 'alias2'],
    category: 'category-name',
    description: 'Descripción breve del comando',
    usage: '.comando <parámetro>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        
        try {
            // Lógica del comando aquí
            
            await sock.sendMessage(chatId, { 
                text: 'Respuesta aquí' 
            }, { quoted: message });
        } catch (error) {
            console.error('Error:', error.message);
            await sock.sendMessage(chatId, { 
                text: '❌ Error al ejecutar comando' 
            }, { quoted: message });
        }
    }
};
```

---

## ✨ EJEMPLOS - PRIMEROS 5 COMANDOS

### 1️⃣ COMANDO: `alive` (Verifica si el bot responde)

```javascript
// plugins/alive.js
export default {
    command: 'alive',
    aliases: ['ping', 'status'],
    category: 'utility',
    description: 'Verifica si el bot está activo',
    usage: '.alive',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const uptime = Math.floor(process.uptime());
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        
        const response = `✅ *BOT ACTIVO*
        
Uptime: ${hours}h ${minutes}m ${seconds}s
Memoria: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
Estado: Running properly ⚡`;
        
        await sock.sendMessage(chatId, { text: response }, { quoted: message });
    }
};
```

---

### 2️⃣ COMANDO: `hello` (Mensaje de bienvenida)

```javascript
// plugins/hello.js
export default {
    command: 'hello',
    aliases: ['hi', 'hola'],
    category: 'fun',
    description: 'Saluda al usuario',
    usage: '.hello',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const userName = message.pushName || 'Amigo';
        
        const greetings = [
            `¡Hola ${userName}! 👋`,
            `Saludos ${userName}! 😊`,
            `¡Qué onda ${userName}! 🎉`,
            `Heyy ${userName}! 🤙`
        ];
        
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        
        await sock.sendMessage(chatId, { text: randomGreeting }, { quoted: message });
    }
};
```

---

### 3️⃣ COMANDO: `flip` (Lanza moneda)

```javascript
// plugins/flip.js
export default {
    command: 'flip',
    aliases: ['coin', 'moneda'],
    category: 'fun',
    description: 'Lanza una moneda al aire',
    usage: '.flip',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const result = Math.random() > 0.5 ? '🪙 *CARA*' : '🪙 *CRUZ*';
        
        await sock.sendMessage(chatId, { text: result }, { quoted: message });
    }
};
```

---

### 4️⃣ COMANDO: `calc` (Calculadora básica)

```javascript
// plugins/calc.js
export default {
    command: 'calc',
    aliases: ['calculator', 'math'],
    category: 'utility',
    description: 'Calcula operaciones matemáticas',
    usage: '.calc <operación>\n\nEjemplo: .calc 2+2*3',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const expression = args.join('').replace(/,/g, '.');
        
        try {
            // Validación: solo permite números y operadores básicos
            if (!/^[\d+\-*/(). ]+$/.test(expression)) {
                throw new Error('Expresión inválida');
            }
            
            // Usar Function constructor en lugar de eval (más seguro)
            const result = Function('"use strict"; return (' + expression + ')')();
            
            await sock.sendMessage(chatId, {
                text: `🔢 *Resultado*\n\n${expression} = ${result}`
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Expresión inválida. Ejemplo: .calc 2+2*3`
            }, { quoted: message });
        }
    }
};
```

---

### 5️⃣ COMANDO: `reverse` (Invierte texto)

```javascript
// plugins/reverse.js
export default {
    command: 'reverse',
    aliases: ['inv', 'invert'],
    category: 'text',
    description: 'Invierte el orden del texto',
    usage: '.reverse <texto>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const text = args.join(' ');
        
        if (!text) {
            return await sock.sendMessage(chatId, {
                text: '❌ Debes proporcionar un texto\n\nEjemplo: .reverse Hola Mundo'
            }, { quoted: message });
        }
        
        const reversed = text.split('').reverse().join('');
        
        await sock.sendMessage(chatId, {
            text: `↩️ *Invertido*\n\n${reversed}`
        }, { quoted: message });
    }
};
```

---

## 🔧 CÓMO AGREGAR UN NUEVO COMANDO

### Paso 1: Crear el archivo en `/plugins`
```bash
# En terminal PowerShell
New-Item -Path "C:\Users\wasma\Documents\JUANCHOTE-SWARM\plugins\nombrecomando.js" -ItemType File
```

### Paso 2: Copiar la estructura base
Usa el template de arriba

### Paso 3: Implementar la lógica

### Paso 4: Probar localmente
```bash
# El bot debería cargar automáticamente el nuevo comando
```

### Paso 5: Documentación (opcional)
Crear archivo `.md` con la documentación del comando

---

## 📋 CHECKLIST POR COMANDO

Antes de considerar un comando "terminado":

```
✅ Archivo creado en /plugins/ con nombre correcto
✅ Estructura export default{ } correcta
✅ Propiedades obligatorias: command, handler
✅ Alias incluidos (si existen)
✅ Descripción clara
✅ Usage documentado
✅ Error handling implementado
✅ Validación de argumentos
✅ Respuesta de usuario amigable
✅ Probado en local
✅ Sin logs innecesarios
```

---

## 🎓 PATRONES COMUNES

### Patrón: Comando sin argumentos
```javascript
if (args.length === 0) {
    return await sock.sendMessage(chatId, { 
        text: '❌ Este comando requiere argumentos' 
    }, { quoted: message });
}
```

### Patrón: Opción aleatoria
```javascript
const options = ['opción1', 'opción2', 'opción3'];
const random = options[Math.floor(Math.random() * options.length)];
```

### Patrón: Formateo de respuesta
```javascript
const response = `*Titulo*
\n- Item 1
\n- Item 2
\n\nPie de página`;
```

### Patrón: Try/Catch
```javascript
try {
    // lógica
} catch (error) {
    console.error('Error:', error.message);
    await sock.sendMessage(chatId, { 
        text: '❌ Error: ' + error.message 
    }, { quoted: message });
}
```

---

## 📊 ORDEN RECOMENDADO DE IMPLEMENTACIÓN

**Semana 1 (Por complejidad):**

1. `flip` - ⭐ Más simple
2. `random`
3. `choose`
4. `hello`
5. `goodbye`
6. `goodnight`
7. `count`
8. `reverse`
9. `string`
10. `alive`

**Semana 1 (Continuación):**

11. `calc`
12. `math`
13. `percentage`
14. `timestamp`
15. `uptime`

**Semana 2 (Más complejos):**

16. `dice`
17. `dado`
18. `rate`
19. `simp`
20. `stupid`
21. `tiny`
22. `shuffle`
23. `define`
24. `element`
25. `fact`

**Semana 2 (Finales):**

26. `quote`
27. `url`
28. `units`
29. `oxford`
30. `character`
31. `menu`
32. `info`
33. `why`
34. `echo`
35. `howgay`

---

## 🚀 PRÓXIMO PASO

Una vez implementados estos 35, pasar a Categoría B que requiere APIs externas. Revisar archivo `TABLA_REFERENCIA_COMANDOS.md` para detalles de cada API.

---

*Generado: 12 de Abril de 2026*
*Framework: Baileys + Node.js*
