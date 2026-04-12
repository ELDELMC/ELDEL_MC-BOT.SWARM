# 🚀 GUÍA PRÁCTICA: INTEGRAR ATLAS-MD EN JUANCHOTE-SWARM

**Nivel:** Avanzado  
**Tiempo estimado:** 3-4 semanas  
**Complejidad:** Alta pero viable

---

## 📋 TABLA DE CONTENIDOS

1. [Preparación](#preparación)
2. [FASE 1: MongoDB](#fase-1-mongodb)
3. [FASE 2: Descarga Universal](#fase-2-descarga-universal)
4. [FASE 3: Triple AI](#fase-3-triple-ai)
5. [FASE 4: Sticker Avanzado](#fase-4-sticker-avanzado)
6. [Testing y Deploy](#testing-y-deploy)

---

## 🔧 PREPARACIÓN

### Step 1: Validar Compatibilidad

```bash
# En tu proyecto JUANCHOTE-SWARM
npm list @whiskeysockets/baileys
# Necesita: >= 7.0.0

# Actualizar si es necesario
npm install @whiskeysockets/baileys@7.0.0-rc.9
```

### Step 2: Backup Proyecto

```bash
# Crear rama de feature
git checkout -b feature/atlas-integration
git add .
git commit -m "[BACKUP] Before Atlas integration"
```

### Step 3: Crear Estructura de Carpetas

```bash
# En /Atlas-MD-main, examina estos:
mkdir -p core/MongoDB
mkdir -p System/MongoDB
mkdir -p plugins-atlas
```

---

## 📊 FASE 1: MONGODB

### Paso 1: Instalar Dependencias

```bash
npm install mongoose
npm install dotenv    # Si no lo tienes
```

### Paso 2: Crear Archivo Schema

**Archivo:** `core/Database.js` (REEMPLAZAR ACTUAL)

```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  ban: { type: Boolean, default: false },
  addedMods: { type: Boolean, default: false },
  character: { type: Number, default: 0 },
  pmChatbot: { type: Boolean, default: false }
}, { timestamps: true });

const groupSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  antilink: { type: Boolean, default: false },
  welcome: { type: Boolean, default: false },
  chatBot: { type: Boolean, default: false },
  antidelete: { type: Boolean, default: false },
  description: String
}, { timestamps: true });

export const userData = mongoose.model('User', userSchema);
export const groupData = mongoose.model('Group', groupSchema);

// Conectar MongoDB
export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Error MongoDB:', error);
    process.exit(1);
  }
}
```

### Paso 3: Actualizar config.js

```javascript
// Agregar a config.js
export default {
  // ... existing config
  
  // MONGODB
  mongodb: process.env.MONGODB_URI || 'mongodb://localhost:27017/juanchote-swarm',
  
  // CACHE TTLs (ms)
  cacheTTL: 300000,      // 5 minutos
  groupCacheTTL: 300000, // 5 minutos
}
```

### Paso 4: Crear MongoDb_Core.js

**Copiar:** `Atlas-MD-main/System/MongoDB/MongoDb_Core.js` → `core/MongoDB_Core.js`

Cambios mínimos:
- Rutas imports (ajustar paths)
- Nombres de DB (userData, groupData)
- TTLs (configurables desde env)

### Paso 5: Integrar en index.js

```javascript
// En index.js, agregar al inicio:
import { connectDB } from './core/Database.js';
import { readcommands } from './core/ReadCommands.js';

// Conectar DB antes de todo
await connectDB();
console.log('✅ Base de datos lista');

// Resto del código...
```

---

## 📥 FASE 2: DESCARGA UNIVERSAL

### Paso 1: Descargar componentes

```bash
# Copiar desde Atlas-MD
cp Atlas-MD-main/Plugins/downloader.js plugins/universal-downloader.js
cp Atlas-MD-main/System/Scrapers.js core/Scrapers.js
```

### Paso 2: Actualizar imports en downloader.js

```javascript
// Cambiar imports si es necesario
import Uploader from '../core/Uploader.js';  // Si necesita
import Function2 from '../core/Function2.js'; // Si existe
```

### Paso 3: Crear plugin auto-detect

**Archivo:** `plugins/auto-downloader.js`

```javascript
// Detectar URLs automáticamente en mensajes
export default {
  command: 'auto-downloader',
  description: 'Auto-detect and download URLs',
  
  handler: async (msg, { Atlas, prefix }) => {
    const text = msg.body;
    
    // Regex URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);
    
    if (!urls) return;
    
    for (const url of urls) {
      // Intentar descargar
      try {
        const result = await downloadURL(url);
        if (result) {
          // Enviar media
          await Atlas.sendMessage(msg.from, result);
        }
      } catch (e) {
        // Ignorar silenciosamente si falla
      }
    }
  }
};

async function downloadURL(url) {
  // Usar funciones de downloader.js
  // Retornar media o null
}
```

### Paso 4: Test Locales

```bash
npm test -- downloader.test.js
```

---

## 🤖 FASE 3: TRIPLE AI

### Paso 1: Instalar SDKs

```bash
npm install openai
npm install @anthropic-ai/sdk
npm install @google/genai
```

### Paso 2: Actualizar .env

```env
# OpenAI (ChatGPT)
OPENAI_API=sk-...,sk-...  # Múltiples keys separadas por coma

# Anthropic (Claude)
CLAUDE_API=sk-ant-...,sk-ant-...

# Google (Gemini)
GEMINI_API=AIza...,AIza...

# O usar una sola key cada uno
OPENAI_API=sk-...
CLAUDE_API=sk-ant-...
GEMINI_API=AIza...
```

### Paso 3: Crear AI_Manager.js

**Archivo:** `core/AI_Manager.js`

```javascript
import { Configuration, OpenAIApi } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/genai';

class AIManager {
  constructor() {
    // ParseKeys (copiar de Configurations.js Atlas)
    this.openaiKeys = parseKeys(process.env.OPENAI_API);
    this.claudeKeys = parseKeys(process.env.CLAUDE_API);
    this.geminiKeys = parseKeys(process.env.GEMINI_API);
  }

  pickKey(keys) {
    if (!keys?.length) return null;
    return keys[Math.floor(Math.random() * keys.length)];
  }

  async chatGPT(messages, systemPrompt) {
    const key = this.pickKey(this.openaiKeys);
    const openai = new OpenAIApi(new Configuration({ apiKey: key }));
    
    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      return response.data.choices[0].message.content;
    } catch (e) {
      console.error('ChatGPT error:', e.message);
      return null;
    }
  }

  async claude(messages, systemPrompt) {
    const key = this.pickKey(this.claudeKeys);
    const client = new Anthropic({ apiKey: key });
    
    try {
      const response = await client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        system: systemPrompt,
        messages
      });
      
      return response.content[0].text;
    } catch (e) {
      console.error('Claude error:', e.message);
      return null;
    }
  }

  async gemini(messages, systemPrompt) {
    const key = this.pickKey(this.geminiKeys);
    const genAI = new GoogleGenerativeAI({ apiKey: key });
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const chat = model.startChat();
      
      const response = await chat.sendMessage(
        messages[messages.length - 1].content
      );
      
      return response.response.text();
    } catch (e) {
      console.error('Gemini error:', e.message);
      return null;
    }
  }

  // Seleccionar AI automáticamente o por fallback
  async ask(message, systemPrompt, aiType = 'auto') {
    let response;
    
    if (aiType === 'auto' || aiType === 'gpt') {
      response = await this.chatGPT(message, systemPrompt);
      if (response) return response;
    }
    
    if (aiType === 'auto' || aiType === 'claude') {
      response = await this.claude(message, systemPrompt);
      if (response) return response;
    }
    
    if (aiType === 'auto' || aiType === 'gemini') {
      response = await this.gemini(message, systemPrompt);
      if (response) return response;
    }
    
    return null;
  }
}

export default new AIManager();
```

### Paso 4: Integrar en chatbot

```javascript
// En plugins/chatbot.js (si existe)
import AIManager from '../core/AI_Manager.js';

export default {
  command: 'chat',
  
  handler: async (msg, { text, pushName }) => {
    const systemPrompt = `Eres un asistente de WhatsApp amable y útil.
    El usuario se llama ${pushName}.
    Responde corto y directo (máximo 300 caracteres).`;
    
    const response = await AIManager.ask(text, systemPrompt);
    
    if (response) {
      return await msg.reply(response);
    }
    
    return await msg.reply('❌ Error procesando tu mensaje.');
  }
};
```

---

## 🎨 FASE 4: STICKER AVANZADO

### Paso 1: Instalar dependencias

```bash
npm install wa-sticker-formatter
npm install jimp @napi-rs/canvas canvacord sharp
```

### Paso 2: Copiar sticker.js

```bash
cp Atlas-MD-main/Plugins/sticker.js plugins/sticker-advanced.js
```

### Paso 3: Ajustar imports

```javascript
// En sticker-advanced.js
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import sharp from 'sharp';
import jimp from 'jimp';
```

### Paso 4: Test

```bash
# Enviar imagen y responder:
.sticker
.s
.scrop
.smeme
.q (quote)
.emojimix 😀 😎
```

---

## 🔍 FASE 5: REACCIONES ANIME

### Paso 1: Instalar Tenor API

```bash
# Ya debe estar en package.json del atlas
npm install axios  # Si no existe
```

### Paso 2: Agregar env var

```env
TENOR_API_KEY=AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c
# O tu propia key de https://tenor.com/developer
```

### Paso 3: Copiar reactions

```bash
cp Atlas-MD-main/Plugins/reactions.js plugins/reactions.js
```

### Paso 4: Test

```
.hug @user
.kiss
.slap
.pat
... 26 reacciones disponibles
```

---

## 🛡️ TESTING Y VALIDACIÓN

### Test 1: MongoDB

```javascript
// test-mongodb.js
import { connectDB, userData } from './core/Database.js';

await connectDB();

// Crear usuario
await userData.create({ id: '123@s.whatsapp.net', ban: false });

// Leer
const user = await userData.findOne({ id: '123@s.whatsapp.net' });
console.log('✅ MongoDB funcionando:', user);

process.exit(0);
```

```bash
node test-mongodb.js
```

### Test 2: Downloader

```javascript
// test-downloader.js
import { downloadURL } from './plugins/universal-downloader.js';

const testURLs = [
  'https://www.tiktok.com/@user/video/12345',
  'https://www.instagram.com/p/ABC123/',
  'https://youtu.be/dQw4w9WgXcQ'
];

for (const url of testURLs) {
  try {
    const result = await downloadURL(url);
    console.log(`✅ ${url} descargado`);
  } catch (e) {
    console.error(`❌ ${url}:`, e.message);
  }
}

process.exit(0);
```

### Test 3: AI

```javascript
// test-ai.js
import AIManager from './core/AI_Manager.js';

const response = await AIManager.ask(
  [{ role: 'user', content: 'Hola, ¿cómo estás?' }],
  'Eres un asistente amable.'
);

console.log('✅ AI Response:', response);

process.exit(0);
```

### Test 4: Integración Full

```bash
# En grupo de prueba con bot
.owner         # Test comando normal
.weather Madrid  # Test API
.hug @user    # Test reacción
.s (foto)     # Test sticker
.chat Hola    # Test AI
```

---

## 🚨 TROUBLESHOOTING

### Problema: MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solución:**
```bash
# Start MongoDB locally
# Linux/Mac
brew services start mongodb-community

# Windows
net start MongoDB
```

O usar MongoDB Atlas (cloud):
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/juanchote
```

---

### Problema: Baileys LID Resolution

```
Error: Cannot read property 'sender' of undefined
```

**Solución:** Estamos en Baileys v7, necesita resolución LID:

```javascript
// En Core.js:
import { lidToJidMap } from './System/whatsapp.js';

const resolvedSender = m.sender.endsWith('@lid') 
  ? lidToJidMap.get(m.sender) || m.key.participantAlt
  : m.sender;
```

---

### Problema: API Keys Deprecadas

**ChatGPT:**
```
Error: This API version is deprecated
```

Usar `openai@^4.0.0` (nueva versión):
```javascript
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: key });
```

---

### Problema: Timeout en Descargas

**Solución:** Aumentar timeout

```javascript
const axios = require('axios').default;
const instance = axios.create({ timeout: 30000 });
```

---

## 📈 VERIFICACIÓN FINAL

- ✅ MongoDB conecta
- ✅ Todas APIs funcionan
- ✅ Descargas OK
- ✅ Stickers OK  
- ✅ Reacciones OK
- ✅ AI responde
- ✅ No hay errores en logs
- ✅ Bot responde a comandos
- ✅ Base datos persiste

---

## 🎯 PRÓXIMOS PASOS

1. **Migración de datos** - JSONs → MongoDB
2. **Gestión Grupos** - Implement group.js
3. **Moderación completa** - moderator.js
4. **Web Dashboard** - Frontend opcional
5. **Testing en producción** - Grupo pequeño

---

## 📚 REFERENCIAS

- MongoDB Docs: https://docs.mongodb.com
- Baileys: https://github.com/WhiskeySockets/Baileys
- OpenAI API: https://platform.openai.com
- Anthropic: https://console.anthropic.com
- Google Gemini: https://ai.google.dev

---

**Última actualización:** 12/04/2026  
**Autor:** Sistema de análisis  
**Licencia:** MIT

