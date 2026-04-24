# ⚡ CHEATSHEET - COMANDOS FALTANTES (Referencia Rápida)

## 📊 NÚMEROS CLAVE
- **De 259 disponibles, 225 faltan implementar (86.9%)**
- **De los 225, recomendamos implementar 140 (62.2%)**
- **Evitar completamente 85+ por alto riesgo (37.8%)**
- **Tiempo estimado: 2-3 semanas**

---

## 🟢 CATEGORÍA A - HAZLO PRIMERO (35 comandos)
*Implementación: 2-3 días | Riesgo: NULO*

| Comando | Función | Dificultad |
|---------|---------|-----------|
| `alive` | Ver si bot funciona | ⭐ |
| `calc` | Operación matemática | ⭐ |
| `character` | Info Unicode | ⭐ |
| `choose` | Elegir opción | ⭐ |
| `count` | Contar caracteres | ⭐ |
| `dado` | Lanzar dados | ⭐ |
| `define` | Definir palabras | ⭐⭐ |
| `dice` | Dados (alt) | ⭐ |
| `echo` | Repetir texto | ⭐ |
| `element` | Tabla periódica | ⭐⭐ |
| `fact` | Datos curiosos | ⭐⭐ |
| `flip` | Lanzar moneda | ⭐ |
| `goodbye` | Despedida | ⭐ |
| `goodnight` | Buenas noches | ⭐ |
| `hello` | Bienvenida | ⭐ |
| `howgay` | Calcular % (humor) | ⭐ |
| `info` | Información | ⭐⭐ |
| `math` | Mate avanzada | ⭐⭐ |
| `menu` | Menú de cmds | ⭐⭐ |
| `oxford` | Comas Oxford | ⭐ |
| `percentage` | Porcentajes | ⭐ |
| `quote` | Citas aleatorias | ⭐⭐ |
| `random` | # aleatorio | ⭐ |
| `rate` | Calificar | ⭐ |
| `reverse` | Invertir texto | ⭐ |
| `shuffle` | Barajar | ⭐ |
| `simp` | % simp (humor) | ⭐ |
| `stupid` | IQ jocoso | ⭐ |
| `string` | Manipulación texto | ⭐⭐ |
| `timestamp` | Marca tiempo | ⭐ |
| `tiny` | Texto pequeño | ⭐ |
| `units` | Conversión unidades | ⭐⭐ |
| `uptime` | Tiempo funcionando | ⭐ |
| `url` | Manejo URLs | ⭐ |
| `why` | Respuestas absurdas | ⭐ |

---

## 🟠 CATEGORÍA B - LUEGO (45 comandos con APIs)
*Implementación: 4-7 días | Riesgo: BAJO*

### 🤖 IA & Búsqueda
- `ai-gpt` (Cloudflare Workers)
- `ai-llama` (Cloudflare Workers)
- `ai-mistral` (Cloudflare Workers)

### 🌍 Información General
- `weather` (OpenWeatherMap)
- `crypto` (CoinGecko)
- `translate` (Google Translate)
- `wikipedia` (Wikipedia API)
- `news` (NewsAPI)
- `pokedex` (PokéAPI)
- `imdb` (OMDb API)

### 🎵 Entretenimiento
- `spotify` (Spotify API)
- `song` (iTunes Search)
- `shazam` (RapidAPI)
- `meme` (Meme APIs)
- `quozio` (Citas con imágenes)
- `genshin` (Genshin API)

### 👨‍💻 Desarrollo
- `github` (GitHub API)
- `gitinfo` (GitHub Info)
- `ytsearch` (YouTube Search)
- `manga` (Jikan/MAL)

### 📚 Otros
- `nasa` (NASA APOD)
- `itunes` (iTunes)
- `element` (Tabla periódica)
- `exchange` (Tipo cambio)
- `distance` (Geolocalización)
- `trivia` (Trivia API)
- `quote2` (Quotable API)
- `quran` (Quran API)
- `trends` (Tendencias)
- `whois` (WHOIS lookup)
- Y 15+ más...

---

## 🟡 CATEGORÍA C - CON CUIDADO (60 comandos)
*Implementación: 5-10 días | Riesgo: MEDIO (requiere validación)*

### 🛡️ Moderación & Admin
```
ban, kick, promote, demote, warn, warnings, unban
mute, unmute, hidetag, tag, tagall, tagnotadmin
staff, manage, mode, admin-check
```

### ⚙️ Configuración de Grupo
```
gcadd, gcleave, gcsettings, groupinfo, groupdata
setgname, setgdesc, setgpp, setpp, setbio
getpp, getfile, invitelink, joingroup, joinrequests
```

### 📨 Auto-Respuesta
```
autoreply, addreply, delreply, setcmd, searchcmd
anticall, antidelete, antilink, antispam, antitag
areact, autostatus, autotyping, badwordkick
```

### 📊 Broadcast & Notificaciones
```
broadcast, broadcastdm, poll, pinchat, sharechat
schedule, schedulelist, schedulecancel
```

### 👤 Perfil & Sistema
```
info, menu, pair, privacy, settings
welcome, goodbye, hello, owner, invo
pmblocker, clear, reload, update
```

---

## 🔴 CATEGORÍA D - EVITAR (85+ Comandos)
*Riesgo: ALTO | Implicación: Ban de WhatsApp / Inestable*

### ❌ Descargas (DMCA Risk)
```
facebook, instagram, tiktok, twitter, igs, igsc, youtube
spotify (descarga), song (descarga), wattpad, mediafire, mega
statusdl, vidsplay, snackvideo, terabox, pinterest
```
⚠️ **WhatsApp puede banear el bot**

### ❌ IA Inestable
```
imagen-dalle, imagen-flux, imagine-diffusion, sora
```
⚠️ **APIs bloqueadas / acceso comercial restringido**

### ❌ Comandos Sistema (RCE)
```
sudo, execute, eval, shell, sysadmin, update, clear
brainfuck, bfread
```
⚠️ **Riesgo de inyección de código**

### ❌ APIs Bloqueadas
```
attp, android1, exad, hack, iplookup, removebg, readqr
```
⚠️ **Frecuentemente inaccesibles**

### ❌ Almacenamiento Personal
```
notes, vnote, readmore, maintenance, rentbot
```
⚠️ **Memory limits en Pterodactyl**

### ❌ Stalking
```
npmstalk, pstalk, tgstalk, tstalk, xstalk, gstalk
```
⚠️ **Posible violación de privacidad**

---

## 🚀 PLAN EJECUCIÓN

```
SEMANA 1 (Categoría A - 35 comandos simples)
├─ Lunes: comandos 1-5 (flip, random, choose, hello, calc)
├─ Martes: comandos 6-10
├─ Miércoles: comandos 11-15
├─ Jueves: comandos 16-25
└─ Viernes: comandos 26-35 + Testing

SEMANA 2 (Categoría B - 45 comandos con APIs)
├─ Lunes-Martes: Validar + Setup APIs
├─ Miércoles-Viernes: Implementar 45 comandos
└─ Testing + Rate Limiting

SEMANA 3 (Categoría C - 60 comandos con restricciones)
├─ Implementar módulos de admin/configuración
├─ Testing en multigrupos
└─ Deploy a producción
```

---

## ✅ CHECKLIST ANTES DE IMPLEMENTAR

Para **CADA** comando:
- [ ] Validar existencia de API (si aplica)
- [ ] Crear archivo en `/plugins/nombrecomando.js`
- [ ] Implementar error handling
- [ ] Agregar rate limiting
- [ ] Testear localmente
- [ ] Documentar en comments
- [ ] Crear archivo `.md` doc (opcional)

---

## 🎓 EJEMPLOS RÁPIDOS

### Comando Más Simple: `flip`
```javascript
export default {
    command: 'flip',
    async handler(sock, message, args, context) {
        const result = Math.random() > 0.5 ? '🪙 CARA' : '🪙 CRUZ';
        await sock.sendMessage(context.chatId, { text: result });
    }
};
```

### Comando Con Validación: `calc`
```javascript
export default {
    command: 'calc',
    async handler(sock, message, args, context) {
        const expr = args.join('');
        if (!/^[\d+\-*/(). ]+$/.test(expr)) {
            return await sock.sendMessage(context.chatId, { 
                text: '❌ Expresión inválida' 
            });
        }
        const result = Function('"use strict"; return (' + expr + ')')();
        await sock.sendMessage(context.chatId, { 
            text: `${expr} = ${result}` 
        });
    }
};
```

### Comando Con API: `weather`
```javascript
import axios from 'axios';

export default {
    command: 'weather',
    async handler(sock, message, args, context) {
        const city = args.join(' ');
        try {
            const { data } = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
            );
            const info = `🌡️ ${data.main.temp}°C\n💨 ${data.wind.speed} m/s`;
            await sock.sendMessage(context.chatId, { text: info });
        } catch (e) {
            await sock.sendMessage(context.chatId, { text: '❌ Ciudad no encontrada' });
        }
    }
};
```

---

## 📞 DOCUMENTOS DE REFERENCIA

| Documento | Contenido |
|-----------|----------|
| `RESUMEN_EJECUTIVO.md` | Visión general completa |
| `ANALISIS_COMANDOS_FALTANTES.md` | Análisis detallado por categoría |
| `TABLA_REFERENCIA_COMANDOS.md` | Tabla completa de 225 comandos |
| `GUIA_IMPLEMENTAR_CATEGORIA_A.md` | Ejemplos prácticos + patrones |
| **📄 ESTE ARCHIVO** | Cheatsheet rápido |

---

## 🎯 DECISION FINAL

### ✅ SÍ IMPLEMENTAR
- Categoría A: 35 (PRIORIDAD 🟥)
- Categoría B: 45 (PRIORIDAD 🟠)
- Categoría C: 60 (PRIORIDAD 🟡)

**Total: 140 comandos** en 2-3 semanas

### ❌ NO IMPLEMENTAR
- Categoría D: 85+ (RIESGO CRÍTICO 🔴)

*Tu bot sobrevive sin ellos, pero puede morir CON ellos*

---

*Generado: 12 de Abril de 2026 | Framework: Baileys + Pterodactyl*
