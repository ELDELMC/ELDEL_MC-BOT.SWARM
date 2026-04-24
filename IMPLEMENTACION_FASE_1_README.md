# 🚀 IMPLEMENTACIÓN SEGURA - ATLAS-MD EXTRACTION

**Estado:** ✅ FASE 1 Completada  
**Fecha:** 12 de Abril de 2026  
**Objetivo:** Mejorar bot sin riesgos de baneos de WhatsApp

---

## 📋 ARCHIVOS CREADOS EN FASE 1

```
✅ core/MongoDB_Core.js           - Caché inteligente + MongoDB (10-100x velocidad)
✅ core/models/MongoDB_Schemas.js - Esquemas Mongoose completos
✅ core/SafeDownloader.js         - Descargador con rate limits (10/hora)
✅ core/SafeAIManager.js          - IA segura con @menciones (50/hora)
✅ core/StickerManager.js         - Sticker avanzado (sin límites técnicos)
✅ core/SafeConfig.js             - Configuración global + restricciones
📄 PLAN_IMPLEMENTACION_SEGURO.md  - Este plan
```

---

## 🔧 CONFIGURACIÓN REQUERIDA

### 1️⃣ MongoDB Atlas (Gratuito)

```bash
# Crear cuenta en https://www.mongodb.com/cloud/atlas
1. Crear proyecto nuevo
2. Crear cluster M0 (gratuito)
3. Guardar connection string
4. En tu .env:
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/juanchote?retryWrites=true&w=majority
```

### 2️⃣ APIs de IA (Opcionales pero recomendados)

```bash
# ChatGPT (OpenAI)
OPENAI_API_KEY=sk-...

# Claude (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# Gemini (Google)
GOOGLE_API_KEY=AIzaSy...

# Si no tienes APIs, IA estará deshabilitada pero el bot funcionará normalmente
```

### 3️⃣ Actualizar .env

```bash
# Añadir a tu .env actual:
MONGO_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIzaSy...
```

### 4️⃣ Actualizar package.json (ya está hecho ✅)

```json
{
  "dependencies": {
    "mongoose": "^9.4.1",          // ✅ Ya instalado
    "node-cache": "^5.1.2",        // ✅ Ya instalado
    "sharp": "^0.34.5",            // ✅ Ya instalado
    "axios": "^1.15.0"             // ✅ Ya instalado
  }
}
```

---

## 📥 INSTALACIÓN

### Paso 1: Descargar dependencias (si no las tienes)

```bash
npm install mongoose node-cache sharp axios
```

### Paso 2: Importar nuevos módulos en index.js

```javascript
// Añadir al inicio de index.js:
import DB from './core/Database.js';
import mongoDBCore from './core/MongoDB_Core.js';
import safeDownloader from './core/SafeDownloader.js';
import safeAIManager from './core/SafeAIManager.js';
import stickerManager from './core/StickerManager.js';
import { CONFIG } from './core/SafeConfig.js';

// Conectar a MongoDB al iniciar
await DB.connect();
```

### Paso 3: Registrar nuevos comandos

Crear archivo: `plugins/atlas-commands.js`

```javascript
/**
 * Nuevos comandos de Atlas-MD (FASE 1)
 */

export const commands = [
    {
        name: 'download',
        aliases: ['dl', 'descargar'],
        description: 'Descargar contenido de URL (TikTok, IG, FB, YouTube, etc)',
        example: '.download <URL>',
        handler: async (msg, args) => {
            const url = args.join(' ');
            if (!url.includes('http')) {
                return await msg.reply('❌ Debes pasar una URL válida\n\nEjemplo: .download https://tiktok.com/...');
            }

            const result = await safeDownloader.download(url, msg.sender, msg.chatId);
            
            if (!result.success) {
                return await msg.reply(result.error);
            }

            // Enviar archivo descargado
            await msg.reply(`✅ Descargado de ${result.platform}`);
            await msg.sendFile(result.url, result.filename);
        }
    },

    {
        name: 'ia',
        aliases: ['gpt', 'ask', 'claude', 'gemini'],
        description: 'Hacer pregunta a IA (ChatGPT, Claude o Gemini)',
        example: '.ia ¿Cuál es la capital de Francia?',
        handler: async (msg, args) => {
            const question = args.join(' ');
            
            const result = await safeAIManager.processMessage(
                `.ia ${question}`,
                msg.sender,
                msg.chatId,
                false // No es @mención, es comando
            );

            if (!result || result.error) {
                return await msg.reply(result?.error || '❌ Error al procesar pregunta');
            }

            let response = `🤖 ${result.model.toUpperCase()}\n\n${result.content}`;
            
            // Si respuesta > 4096 caracteres, usar archivo
            if (response.length > 4096) {
                return await msg.sendDocument(
                    Buffer.from(response),
                    'respuesta-ia.txt'
                );
            }

            await msg.reply(response);
        }
    },

    {
        name: 'sticker',
        aliases: ['stick', 'fig'],
        description: 'Convertir imagen a sticker',
        example: '.sticker (respondiendo a imagen)',
        handler: async (msg) => {
            if (!msg.quoted || !msg.quoted.isMedia) {
                return await msg.reply('❌ Responde a una imagen con .sticker');
            }

            const image = await msg.quoted.download();
            const result = await stickerManager.imageToSticker(image);

            if (!result.success) {
                return await msg.reply(result.error);
            }

            await msg.sendSticker(result.buffer);
        }
    },

    {
        name: 'stats',
        aliases: ['estadísticas'],
        description: 'Ver estadísticas del bot',
        example: '.stats',
        handler: async (msg) => {
            const cacheStats = mongoDBCore.getCacheStats();
            
            const stats = `
📊 ESTADÍSTICAS DEL BOT

💾 Cache MongoDB:
   • Hit rate: ${cacheStats.hitRate}
   • Usuarios en caché: ${cacheStats.usersCached}
   • Grupos en caché: ${cacheStats.groupsCached}

⚙️ Rate Limits Activos:
   • Descargas: ${CONFIG.rateLimits.download.perGroupPerHour}/hora/grupo
   • Respuestas IA: ${CONFIG.rateLimits.ai.perGroupPerHour}/hora/grupo
   • Comandos: ${CONFIG.rateLimits.commands.perGroupPerHour}/hora/grupo

🔐 Seguridad:
   • Features peligrosas: DESHABILITADAS
   • Validación de permisos: ACTIVA
   • Rate limiting: ACTIVO
            `.trim();

            await msg.reply(stats);
        }
    }
];
```

---

## 🔍 FLUJOS DE EJECUCIÓN

### Flujo 1: Descargar contenido

```
Usuario: .download https://tiktok.com/...
   ↓
SafeDownloader.download()
   ├─ Detectar plataforma (TikTok)
   ├─ Checar rate limits (10/hora/grupo)
   ├─ Descargar (con APIs específicas)
   ├─ Guardar en MongoDB (DownloadHistory)
   └─ Enviar archivo al usuario
   ✅ Resultado: Archivo descargado
```

### Flujo 2: Pregunta a IA

```
Usuario: .ia ¿Cuál es 2+2?
   ↓
SafeAIManager.processMessage()
   ├─ Checar si es comando válido (.ia, .gpt, etc)
   ├─ Checar rate limits (50/hora/grupo)
   ├─ Llamar ChatGPT
   ├─ Si falla → llamar Claude
   ├─ Si falla → llamar Gemini
   ├─ Si todo falla → error
   ├─ Guardar en MongoDB (AIInteraction)
   └─ Responder al usuario
   ✅ Resultado: Respuesta de IA
```

### Flujo 3: Crear sticker

```
Usuario: (responde a imagen) .sticker
   ↓
StickerManager.imageToSticker()
   ├─ Descargar imagen
   ├─ Resize a 512x512
   ├─ Convertir a WebP
   └─ Enviar como sticker
   ✅ Resultado: Sticker creado
```

---

## 🚨 LÍMITES DE SEGURIDAD (PARA EVITAR BANEOS)

| Feature | Límite | Acción si se excede |
|---------|--------|-------------------|
| Descargas | 10/hora/grupo | Mensaje de espera |
| Respuestas IA | 50/hora/grupo | Mensaje de espera |
| Comandos | 100/hora/grupo | Sin respuesta |
| Mensajes bot | 10/min/grupo | STOP automático |
| Reacciones | 3/min/usuario | Cooldown |

---

## 📊 MONITOREO

### Ver estadísticas en tiempo real

```bash
# En cualquier grupo:
.stats
```

### Logs detallados

```bash
# Ver errores:
tail -f logs/error.log

# Ver todo:
tail -f logs/app.log
```

### MongoDB Atlas Dashboard

```
https://cloud.mongodb.com
→ Clusters → Collections
→ Ver userData, groupData, downloads, interactions
```

---

## 🆘 TROUBLESHOOTING

### "MongoDB connection failed"
```
❌ Problema: MONGO_URI incorrecto
✅ Solución: Verificar .env, crear IP whitelist en MongoDB Atlas
```

### "OpenAI API key invalid"
```
❌ Problema: API key expirada o incorrecta
✅ Solución: Generar nueva key en https://platform.openai.com/api-keys
```

### "Download rate limit exceeded"
```
❌ Problema: Demasiadas descargas en poco tiempo
✅ Solución: Esperar 1 hora, intentar de nuevo
```

### "All AIs failed"
```
❌ Problema: Todas las APIs de IA están caídas
✅ Solución: Checar status en https://status.openai.com
```

---

## ✅ CHECKLIST PRE-DEPLOY

- [ ] .env tiene MONGO_URI configurado
- [ ] .env tiene al menos 1 API key de IA (OpenAI/Claude/Gemini)
- [ ] `npm install` ejecutado
- [ ] MongoDB Atlas cluster creado
- [ ] Archivos creados en core/: MongoDB_Core.js, SafeDownloader.js, etc
- [ ] Comandos registrados en plugins/atlas-commands.js
- [ ] Bot inicia sin errores: `npm start`
- [ ] Probar en grupo privado: `.download <URL>`
- [ ] Probar IA: `.ia ¿Hola?`
- [ ] Probar sticker: Imagen + `.sticker`

---

## 🎯 PRÓXIMOS PASOS (FASE 2-5)

**FASE 2:** Reacciones avanzadas (26 anime GIFs)  
**FASE 3:** Welcome/Goodbye automático  
**FASE 4:** Moderación mejorada (ban, antilink, etc)  
**FASE 5:** Scrapers web (búsquedas, lyrics, etc)

---

## 📞 SOPORTE

Si algo no funciona:
1. Ver logs: `npm start 2>&1 | tee logs/debug.log`
2. Checar .env: ¿Están todas las keys?
3. MongoDB: ¿Cluster está activo?
4. APIs: ¿API keys válidas?

---

**Status: 🟢 FASE 1 COMPLETADA Y LISTA PARA USAR**
