# 📑 TABLA REFERENCIA RÁPIDA - COMANDOS FALTANTES

## CATEGORÍA A: ALTAMENTE VIABLES (35 COMANDOS)
**Implementación Inmediata - Sin Dependencias Externas**

| # | Comando | Descripción | Complejidad |
|---|---------|-------------|-------------|
| 1 | `alive` | Verifica si el bot responde | Muy Baja |
| 2 | `calc` | Calculadora básica | Baja |
| 3 | `character` | Información de caracteres Unicode | Baja |
| 4 | `choose` | Elige entre opciones | Muy Baja |
| 5 | `count` | Cuenta caracteres/palabras | Muy Baja |
| 6 | `dado` | Lanza dados virtuales | Muy Baja |
| 7 | `define` | Define palabras | Baja |
| 8 | `dice` | Dados (alternativa) | Muy Baja |
| 9 | `echo` | Repite texto | Muy Baja |
| 10 | `element` | Tabla periódica | Baja |
| 11 | `fact` | Datos curiosos | Baja |
| 12 | `flip` | Lanza moneda | Muy Baja |
| 13 | `goodbye` | Mensaje de despedida | Muy Baja |
| 14 | `goodnight` | Mensaje de buenas noches | Muy Baja |
| 15 | `hello` | Mensaje de bienvenida | Muy Baja |
| 16 | `howgay` | Calcula % (humor) | Muy Baja |
| 17 | `info` | Información general | Baja |
| 18 | `math` | Operaciones matemáticas | Baja |
| 19 | `menu` | Menú de comandos | Baja |
| 20 | `oxford` | Comas de Oxford | Baja |
| 21 | `percentage` | Calcula porcentajes | Baja |
| 22 | `quote` | Citas aleatorias | Baja |
| 23 | `random` | Número aleatorio | Muy Baja |
| 24 | `rate` | Califica algo | Muy Baja |
| 25 | `reverse` | Invierte texto | Muy Baja |
| 26 | `shuffle` | Baraja texto | Baja |
| 27 | `simp` | Detector de simp | Muy Baja |
| 28 | `stupid` | Calcula IQ burlonamente | Muy Baja |
| 29 | `string` | Manipulación de strings | Baja |
| 30 | `timestamp` | Marca de tiempo | Baja |
| 31 | `tiny` | Texto diminuto | Baja |
| 32 | `units` | Conversión de unidades | Baja |
| 33 | `uptime` | Tiempo de funcionamiento | Muy Baja |
| 34 | `url` | Manejo de URLs | Baja |
| 35 | `why` | Respuestas absurdas | Muy Baja |

---

## CATEGORÍA B: VIABLES CON APIs EXTERNAS (45 COMANDOS)
**APIs Gratuitas/Estables - Rate Limiting Recomendado**

| # | Comando | Source API | Complejidad |
|---|---------|-----------|-------------|
| 1 | `ai-gpt` | Cloudflare Workers (Stacktoy) | Media |
| 2 | `ai-llama` | Cloudflare Workers | Media |
| 3 | `ai-mistral` | Cloudflare Workers | Media |
| 4 | `alamy` | Alamy API | Media |
| 5 | `animes` | GitHub JSON DB (Guru322) | Media |
| 6 | `analyze` | MIME Detection | Baja |
| 7 | `character` | Unicode DB | Baja |
| 8 | `crypto` | CoinGecko API (Free) | Media |
| 9 | `define` | DictionaryAPI | Baja |
| 10 | `distance` | Geolocation Cálculos | Media |
| 11 | `exchange` | Exchange Rates API | Baja |
| 12 | `fact` | Random Facts API | Baja |
| 13 | `genshin` | Genshin Impact API | Media |
| 14 | `github` | GitHub API (Public) | Media |
| 15 | `gitinfo` | GitHub API | Media |
| 16 | `howgay` | Pseudoaleatorio | Muy Baja |
| 17 | `imdb` | OMDb API (Free) | Media |
| 18 | `itunes` | iTunes Search API | Media |
| 19 | `jokeapi` | Joke API | Baja |
| 20 | `jokes` | Jokes API | Baja |
| 21 | `lyricsearch` | Genius/Musixmatch | Media |
| 22 | `manga` | Jikan (MyAnimeList) API | Media |
| 23 | `movie` | TMDb/OMDb API | Media |
| 24 | `nasa` | NASA APOD API (Free) | Media |
| 25 | `news` | NewsAPI | Media |
| 26 | `npmsearch` | NPM Registry | Baja |
| 27 | `pokedex` | PokéAPI | Baja |
| 28 | `programming` | Programming Quotes API | Baja |
| 29 | `quote2` | Quotable API | Baja |
| 30 | `quozio` | Quozio (Imágenes Citas) | Media |
| 31 | `quran` | Quran API | Media |
| 32 | `rank` | Ranking Systems | Media |
| 33 | `readmore` | URL Extractors | Media |
| 34 | `shazam` | RapidAPI Shazam | Media |
| 35 | `siminfo` | SIM Info (Generador) | Baja |
| 36 | `song` | Spotify/iTunes API | Media |
| 37 | `spotify` | Spotify API (Web) | Media |
| 38 | `sysinfo` | System Info (Node.js) | Baja |
| 39 | `translate` | Google Translate API | Media |
| 40 | `trivia` | Open Trivia DB | Baja |
| 41 | `trends` | Twitter Trends API | Media |
| 42 | `weather` | OpenWeatherMap API | Media |
| 43 | `whois` | WHOIS API | Media |
| 44 | `wikipedia` | Wikipedia API | Baja |
| 45 | `ytsearch` | YouTube Search API | Media |

---

## CATEGORÍA C: VIABLES CON RESTRICCIONES (60 COMANDOS)
**Funcionalidad Limitada a Permisos de Grupo/Admin**

### Sub-C1: Auto-Respuesta & Configuración (15)
| # | Comando | Requisitos | Complejidad |
|---|---------|-----------|-------------|
| 1 | `addreply` | DB Local | Media |
| 2 | `anticall` | Event Handler | Media |
| 3 | `antidelete` | Message Backup | Media |
| 4 | `antilink` | Regex + Kick Perm | Media |
| 5 | `antispam` | Message Cache | Media |
| 6 | `antitag` | Mention Detection | Baja |
| 7 | `areact` | Auto Reaction | Baja |
| 8 | `autoreply` | DB Local | Media |
| 9 | `autostatus` | Download Handler | Media |
| 10 | `autotyping` | Socket Control | Baja |
| 11 | `badwordkick` | Filter List + Kick | Media |
| 12 | `cmdreact` | Command Reaction | Baja |
| 13 | `delreply` | DB Query | Media |
| 14 | `setcmd` | DB Storage | Media |
| 15 | `searchcmd` | DB Search | Media |

### Sub-C2: Gestión de Grupo (25)
| # | Comando | Requisitos | Complejidad |
|---|---------|-----------|-------------|
| 1 | `ban` | Admin Perm + DB | Media |
| 2 | `broadcast` | All Groups Access | Alta |
| 3 | `broadcastdm` | All DMs Access | Alta |
| 4 | `demote` | Admin Perm | Media |
| 5 | `gcadd` | Invite Link Gen | Media |
| 6 | `gcleave` | Admin Perm | Baja |
| 7 | `gcsettings` | Group Metadata | Media |
| 8 | `getplugin` | Plugin FS | Baja |
| 9 | `groupdata` | Group Analytics | Media |
| 10 | `groupinfo` | Group Metadata | Baja |
| 11 | `hidetag` | Mention Handler | Media |
| 12 | `invitelink` | Link Generator | Baja |
| 13 | `joingroup` | Invite Handler | Media |
| 14 | `joinrequests` | Group Requests | Media |
| 15 | `kick` | Admin Perm + BD | Media |
| 16 | `list` | DB Listing | Baja |
| 17 | `listcmd` | Plugin Listing | Baja |
| 18 | `manage` | Full Control | Alta |
| 19 | `mention` | @ Handler | Media |
| 20 | `mute` | Admin Perm | Baja |
| 21 | `poll` | Poll Creator | Media |
| 22 | `promote` | Admin Perm | Media |
| 23 | `tag`/`tagall` | Mention All | Media |
| 24 | `tagnotadmin` | Selective Mention | Media |
| 25 | `unmute` | Admin Perm | Baja |

### Sub-C3: Configuración de Perfil (10)
| # | Comando | Requisitos | Complejidad |
|---|---------|-----------|-------------|
| 1 | `setbio` | Profile Editor | Baja |
| 2 | `setgdesc` | Group Editor | Baja |
| 3 | `setgname` | Group Editor | Baja |
| 4 | `setgpp` | Image Handler | Media |
| 5 | `setpp` | Image Handler | Media |
| 6 | `getpp` | Profile Data | Baja |
| 7 | `getfile` | File Manager | Media |
| 8 | `settings` | Config Panel | Alta |
| 9 | `sharechat` | Share Handler | Media |
| 10 | `welcome` | Greeting Message | Media |

### Sub-C4: Sistema de Moderación (10)
| # | Comando | Requisitos | Complejidad |
|---|---------|-----------|-------------|
| 1 | `warn` | DB + Admin Perm | Media |
| 2 | `warnings` | DB Query | Baja |
| 3 | `unban` | DB + Admin | Media |
| 4 | `staff` | Role Manager | Media |
| 5 | `privacy` | Privacy Settings | Media |
| 6 | `mode` | Bot Mode Selector | Media |
| 7 | `pair` | Pairing Handler | Alta |
| 8 | `pinchat` | Pin Message | Baja |
| 9 | `pmblocker` | DM Filter | Baja |
| 10 | `invo` | Invoice Generator | Alta |

---

## CATEGORÍA D: NO VIABLES / ALTO RIESGO (85+ COMANDOS)
**❌ NO SE RECOMIENDA IMPLEMENTAR - ALTO RIESGO DE BAN / INESTABLE**

### Sub-D1: Descargas de Contenido (DMCA Risk) ❌
```
facebook, igs, igsc, instagram, mediafire, mega, snapchat, 
snackvideo, song (descarga), spotify (descarga), ss, statusdl, 
tiktok, twitter, video, vidsplay, wattpad, youtube, terabox,
sticker-telegram, stickers, sticker-alt, sticker2, pininterest
```
**Razón:** Violación DMCA, ToS de plataformas, WhatsApp Ban Risk

### Sub-D2: Generadores IA Inestables ❌
```
imagen-dalle, imagen-flux, imagine-diffusion, sora
```
**Razón:** APIs sin licencia, acceso restringido, términos comerciales

### Sub-D3: Comandos del Sistema (RCE Risk) ❌
```
sysinfo, sysadmin, sudo, execute, eval, update, shell, clear, 
clearchat, clearsession, crun, brainfuck, bfread, dna
```
**Razón:** Riesgo de inyección, acceso a recursos del servidor

### Sub-D4: APIs Inestables/Bloqueadas ❌
```
attp, android1, exad, fetch, gimage, gitclone, gitclone2, glitch, 
hack, iplookup, islamicImg, mountImg, removebg, readqr, ringtone,
roseday, techImg, teddy
```
**Razón:** APIs frecuentemente bloqueadas, requieren autenticación especial

### Sub-D5: Funcionalidades Complejas de Datos (Storage Risk) ❌
```
notes, vnote, readmore, maintenance, schedulecancel, schedulelist, 
rentbot, stoprent, resetlink, pinchat
```
**Razón:** Memory limits en Pterodactyl, persistencia limitada

### Sub-D6: Stalking / Privacy Violation ❌
```
npmstalk, pstalk, tgstalk, tstalk, xstalk, gstalk
```
**Razón:** Posible violación de privacidad, scrapeo de datos personales

---

## 📊 RESUMEN GRÁFICO

```
TOTAL: 225 COMANDOS FALTANTES

┌─────────────────────────────────────────┐
│ A (Viables)      35 | ████░░░░░░░░  15.6%
│ B (APIs)         45 | █████░░░░░░░   20% 
│ C (Restricciones) 60| ███████░░░░░  26.7%
│ D (Riesgo)        85+| ██████████░░  37.7%
└─────────────────────────────────────────┘

RECOMENDABLE IMPLEMENTAR: 140 (62.2%)
RIESGO ALTO (EVITAR):      85+ (37.8%)
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN SUGERIDO

### FASE 1: Semana 1 (Categoría A - 35 comandos)
- Desarrollo diario de ~5 comandos
- Testing y documentación paralela
- Estimación: 5 días

### FASE 2: Semana 2-3 (Categoría B - 45 comandos)
- Validación de APIs
- Integración con manejo de errores
- Rate limiting implementation
- Estimación: 10 días

### FASE 3: Semana 4-5 (Categoría C - 60 comandos)
- Validar permisos de grupo
- Implementar logs
- Testing en ambiente
- Estimación: 10 días

### Total Estimado: 2-3 semanas (140 comandos)

---

## ✅ CHECKLIST ANTES DE IMPLEMENTAR CADA COMANDO

- [ ] Revisar disponibilidad de APIs (si aplica)
- [ ] Verificar compatibilidad con Baileys
- [ ] Validar límites de Pterodactyl
- [ ] Implementar error handling
- [ ] Agregar rate limiting
- [ ] Documentar uso
- [ ] Testing local
- [ ] Testing en producción
- [ ] Monitorear en Discord/logs

---

*Generado: 12 de Abril de 2026*
*Framework: Baileys + Pterodactyl + Node.js*
