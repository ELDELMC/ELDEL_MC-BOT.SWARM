# 📚 PLANTILLAS DE DOCUMENTACIÓN - CATEGORÍA C

## Estructura Base de Archivo .md para Comando

```markdown
# 🔧 Comando NOMBRE

## Información General

**Comando:** `.nombrecmd`
**Aliases:** `alias1`, `alias2`
**Categoría:** Administración / Funcionalidad
**Descripción:** Descripción breve del comando

**Estado:** ❌ No Implementado | ✅ Implementado

---

## 👥 Permisos Requeridos

| Rol | Puede Ejecutar |
|-----|---|
| **Usuarios Comunes** | ❌ No |
| **Administradores del Grupo** | ✅/❌ |
| **Creador del Bot** | ✅ Sí |
| **Owner General** | ✅ Sí |

---

## 📋 Funcionalidad Técnica

### Descripción Detallada
[Descripción técnica completa]

### Cómo Funciona
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

### Archivos Afectados
- `db/archivo.json` - Descripción
- `core/modulo.js` - Descripción

---

## 🔧 Uso

### Sintaxis
\`\`\`
.comando [parámetros]
\`\`\`

### Ejemplos
\`\`\`
.comando ejemplo1 → Resultado
.comando ejemplo2 → Resultado
\`\`\`

### Respuesta del Bot
✅ Éxito: [Mensaje de éxito]
❌ Error: [Posibles errores]

---

## ⚙️ Configuración Técnica

**Cooldown:** 3000ms (3 segundos)
**Group Only:** Sí/No
**Admin Only:** Sí/No
**Owner Only:** Sí/No
**Requiere DB:** Sí/No

---

## 🔗 Dependencias

- [Dependencia 1]
- [Dependencia 2]

---

## 📊 Notas Adicionales

- [Nota importante 1]
- [Nota importante 2]
```

---

## 📋 COMANDOS DE CATEGORÍA C - PLANTILLAS POR SUBCATEGORÍA

### 1️⃣ COMANDOS DE ADMINISTRADOR/GRUPO (32)

#### `ban.md` ✅ YA EXISTE
#### `kick.md` ✅ YA EXISTE  
#### `promote.md` ✅ YA EXISTE
#### `demote.md` ✅ YA EXISTE
#### `unban.md` ✅ YA EXISTE

#### `mute.md` ❌ PENDIENTE
**Descripción:** Silencia a un usuario en el grupo
**Permisos:** Admin Only
**Archivos:** core/AdminChecker.js, db/muted.json

#### `unmute.md` ❌ PENDIENTE
**Descripción:** Dessilencia a un usuario
**Permisos:** Admin Only
**Archivos:** core/AdminChecker.js, db/muted.json

#### `warn.md` ❌ PENDIENTE
**Descripción:** Sistema de advertencias para usuarios
**Permisos:** Admin Only
**Archivos:** db/warnings.json, core/Database.js
**Funcionalidad:** 
- Agregar advertencia (warn)
- Ver advertencias (warnings)
- Expulsar si llega a 3 advertencias

#### `warnings.md` ❌ PENDIENTE
**Descripción:** Ver advertencias de un usuario
**Permisos:** Admin Only
**Archivos:** db/warnings.json

#### `tag.md` ❌ PENDIENTE
**Descripción:** Etiquetar a un usuario
**Permisos:** Admin Only
**Archivos:** Ninguno

#### `tagall.md` ❌ PENDIENTE
**Descripción:** Etiquetar a todos en el grupo
**Permisos:** Admin Only
**Archivos:** Ninguno

#### `tagnotadmin.md` ❌ PENDIENTE
**Descripción:** Etiquetar solo a no-administradores
**Permisos:** Admin Only
**Archivos:** Ninguno

#### `hidetag.md` ❌ PENDIENTE
**Descripción:** Etiquetar de forma oculta
**Permisos:** Admin Only
**Archivos:** Ninguno

#### `gcadd.md` ❌ PENDIENTE
**Descripción:** Agregar usuarios al grupo
**Permisos:** Admin Only
**Archivos:** Ninguno
**Nota:** Requiere código de invitación válido

#### `gcleave.md` ❌ PENDIENTE
**Descripción:** Salir del grupo
**Permisos:** Owner Only
**Archivos:** Ninguno

#### `gcsettings.md` ❌ PENDIENTE
**Descripción:** Configurar opciones del grupo
**Permisos:** Admin Only
**Archivos:** db/group_settings.json

#### `groupinfo.md` ❌ PENDIENTE
**Descripción:** Información del grupo actual
**Permisos:** Public
**Archivos:** Ninguno

#### `groupdata.md` ❌ PENDIENTE
**Descripción:** Datos detallados y estadísticas del grupo
**Permisos:** Admin Only
**Archivos:** db/activity.json, db/group_stats.json

#### `setgname.md` ❌ PENDIENTE
**Descripción:** Cambiar nombre del grupo
**Permisos:** Admin Only
**Archivos:** Ninguno

#### `setgdesc.md` ❌ PENDIENTE
**Descripción:** Cambiar descripción del grupo
**Permisos:** Admin Only
**Archivos:** Ninguno

#### `setgpp.md` ❌ PENDIENTE
**Descripción:** Cambiar foto de perfil del grupo
**Permisos:** Admin Only
**Archivos:** Ninguno
**Nota:** Requiere imagen adjunta

#### `manage.md` ❌ PENDIENTE
**Descripción:** Panel de gestión completa del grupo
**Permisos:** Admin Only
**Archivos:** Múltiples

#### `mention.md` ❌ PENDIENTE
**Descripción:** Mencionar a un usuario específico
**Permisos:** Public
**Archivos:** Ninguno

#### `invitelink.md` ❌ PENDIENTE
**Descripción:** Obtener enlace de invitación del grupo
**Permisos:** Admin Only
**Archivos:** Ninguno

#### `joingroup.md` ❌ PENDIENTE
**Descripción:** Unirse a un grupo mediante enlace
**Permisos:** Public / Admin
**Archivos:** core/SessionManager.js

#### `joinrequests.md` ❌ PENDIENTE
**Descripción:** Ver/aprobar solicitudes de unión
**Permisos:** Admin Only
**Archivos:** db/join_requests.json

#### `list.md` ❌ PENDIENTE
**Descripción:** Listar datos del bot
**Permisos:** Public
**Archivos:** Múltiples

#### `listcmd.md` ❌ PENDIENTE
**Descripción:** Listar comandos disponibles
**Permisos:** Public
**Archivos:** Ninguno

#### `listrent.md` ❌ PENDIENTE
**Descripción:** Listar sistemas de renta activos
**Permisos:** Public / Admin
**Archivos:** db/rentals.json

#### `listreplies.md` ❌ PENDIENTE
**Descripción:** Listar respuestas automáticas
**Permisos:** Admin Only
**Archivos:** db/autoreply.json

#### `disappear.md` ❌ PENDIENTE
**Descripción:** Enviar mensaje que desaparece
**Permisos:** Public
**Archivos:** Ninguno
**Nota:** Feature de WhatsApp

#### `gitignore.md` ❌ PENDIENTE
**Descripción:** Ignorar cambios en git
**Permisos:** Owner Only
**Archivos:** .gitignore

#### `staff.md` ❌ PENDIENTE
**Descripción:** Gestionar staff del bot
**Permisos:** Owner Only
**Archivos:** db/staff.json

---

### 2️⃣ AUTO-RESPUESTA & CONFIGURACIÓN (15)

#### `addreply.md` ❌ PENDIENTE
**Descripción:** Agregar respuesta automática personalizada
**Uso:** `.addreply palabra | respuesta`
**Archivos:** db/autoreply.json

#### `delreply.md` ❌ PENDIENTE
**Descripción:** Eliminar respuesta automática
**Uso:** `.delreply palabra`
**Archivos:** db/autoreply.json

#### `autoreply.md` ❌ PENDIENTE
**Descripción:** Habilitar/deshabilitar respuestas automáticas
**Permisos:** Admin Only
**Archivos:** db/autoreply.json

#### `anticall.md` ❌ PENDIENTE
**Descripción:** Rechazar y banear quien haga llamadas
**Permisos:** Admin Only
**Archivos:** core/spyEvent.js, db/banned.json

#### `antidelete.md` ❌ PENDIENTE
**Descripción:** Recuperar mensajes eliminados
**Permisos:** Admin Only
**Archivos:** core/MessageHandler.js

#### `antilink.md` ❌ PENDIENTE
**Descripción:** Eliminar/banear quien comparta enlaces
**Permisos:** Admin Only
**Archivos:** core/MessageHandler.js

#### `antispam.md` ❌ PENDIENTE
**Descripción:** Detener spam automáticamente
**Permisos:** Admin Only
**Archivos:** core/Deduplicator.js

#### `antitag.md` ❌ PENDIENTE
**Descripción:** Bloquear menciones excesivas
**Permisos:** Admin Only
**Archivos:** core/spyEvent.js

#### `areact.md` ❌ PENDIENTE
**Descripción:** Reacción automática a palabras clave
**Archivos:** db/autoreact.json

#### `autostatus.md` ❌ PENDIENTE
**Descripción:** Descargar estados automáticamente
**Permisos:** Public
**Archivos:** temp/

#### `autotyping.md` ❌ PENDIENTE
**Descripción:** Mostrar "escribiendo..." automáticamente
**Archivos:** core/MessageHandler.js

#### `badwordkick.md` ❌ PENDIENTE
**Descripción:** Expulsar automáticamente por palabras malas
**Permisos:** Admin Only
**Archivos:** db/badwords.json

#### `cmdreact.md` ❌ PENDIENTE
**Descripción:** Reacción automática a comandos
**Archivos:** core/CommandHandler.js

#### `delcmd.md` ❌ PENDIENTE
**Descripción:** Eliminar comando personalizado
**Archivos:** db/custom_commands.json

#### `searchcmd.md` ❌ PENDIENTE
**Descripción:** Buscar comando en la base de datos
**Archivos:** db/custom_commands.json

---

### 3️⃣ BROADCAST & NOTIFICACIONES (8)

#### `broadcast.md` ❌ PENDIENTE
**Descripción:** Enviar mensaje a todos los grupos
**Permisos:** Owner Only
**Uso:** `.broadcast mensaje aquí`

#### `broadcastdm.md` ❌ PENDIENTE
**Descripción:** Enviar DM a todos los contactos
**Permisos:** Owner Only
**Uso:** `.broadcastdm mensaje privado`

#### `poll.md` ❌ PENDIENTE
**Descripción:** Crear encuesta en el grupo
**Uso:** `.poll opción1 | opción2 | opción3`

#### `pinchat.md` ❌ PENDIENTE
**Descripción:** Fijar mensaje importante
**Permisos:** Admin Only

#### `sharechat.md` ❌ PENDIENTE
**Descripción:** Compartir chat o grupo
**Permisos:** Public

#### `schedule.md` ❌ PENDIENTE
**Descripción:** Programar envío de mensajes
**Permisos:** Admin Only
**Archivos:** db/scheduled_messages.json

#### `schedulelist.md` ❌ PENDIENTE
**Descripción:** Ver mensajes programados
**Permisos:** Admin Only
**Archivos:** db/scheduled_messages.json

#### `schedulecancel.md` ❌ PENDIENTE
**Descripción:** Cancelar mensaje programado
**Permisos:** Admin Only
**Archivos:** db/scheduled_messages.json

---

### 4️⃣ PERFIL & CONFIGURACIÓN (17)

#### `setbio.md` ❌ PENDIENTE
**Descripción:** Cambiar biografía del bot
**Permisos:** Owner Only

#### `setpp.md` ❌ PENDIENTE
**Descripción:** Cambiar foto de perfil del bot
**Permisos:** Owner Only

#### `getpp.md` ❌ PENDIENTE
**Descripción:** Obtener foto de perfil de alguien
**Uso:** `.getpp @usuario`

#### `getfile.md` ❌ PENDIENTE
**Descripción:** Descargar archivo
**Permisos:** Owner Only

#### `settings.md` ❌ PENDIENTE
**Descripción:** Panel de configuración general
**Permisos:** Admin Only / Owner Only

#### `welcome.md` ❌ PENDIENTE
**Descripción:** Establecer mensaje de bienvenida
**Permisos:** Admin Only
**Archivos:** db/welcome_messages.json

#### `info.md` ❌ PENDIENTE
**Descripción:** Información general del bot y grupo
**Permisos:** Public

#### `menu.md` ❌ PENDIENTE
**Descripción:** Mostrar menú interactivo
**Permisos:** Public

#### `owner.md` ❌ PENDIENTE
**Descripción:** Información del propietario
**Permisos:** Public

#### `privacy.md` ❌ PENDIENTE
**Descripción:** Configurar privacidad
**Permisos:** Owner Only
**Archivos:** config.js

#### `mode.md` ❌ PENDIENTE
**Descripción:** Cambiar modo del bot (público/privado)
**Permisos:** Owner Only
**Archivos:** config.js

#### `pair.md` ❌ PENDIENTE
**Descripción:** Vincular nueva sesión
**Permisos:** Owner Only
**Archivos:** sessions/

#### `pmblocker.md` ❌ PENDIENTE
**Descripción:** Bloquear mensajes directos
**Permisos:** Owner Only
**Archivos:** db/pm_blocked.json

#### `goodbye.md` ❌ PENDIENTE
**Descripción:** Establecer mensaje de despedida
**Permisos:** Admin Only

#### `clear.md` ❌ PENDIENTE
**Descripción:** Limpiar mensajes del chat
**Permisos:** Admin Only

#### `clearchat.md` ❌ PENDIENTE
**Descripción:** Limpiar historial de chat
**Permisos:** Admin Only
**Archivos:** core/MessageHandler.js

#### `reload.md` ❌ PENDIENTE
**Descripción:** Recargar comandos dinámicamente
**Permisos:** Owner Only

---

### 5️⃣ SISTEMA DE MODERACIÓN (7)

#### `invo.md` ❌ PENDIENTE
**Descripción:** Sistema de invoicing/facturación
**Permisos:** Owner Only / Admin
**Archivos:** db/invoices.json

#### `rentbot.md` ❌ PENDIENTE
**Descripción:** Sistema de alquileres
**Permisos:** Owner Only / Admin
**Archivos:** db/rentals.json

#### `stoprent.md` ❌ PENDIENTE
**Descripción:** Detener alquiler
**Permisos:** Owner Only / Admin
**Archivos:** db/rentals.json

#### `clearsession.md` ❌ PENDIENTE
**Descripción:** Limpiar sesión de WhatsApp
**Permisos:** Owner Only
**Archivos:** sessions/

#### `update.md` ❌ PENDIENTE
**Descripción:** Actualizar el bot
**Permisos:** Owner Only

#### `pstalk.md` ❌ PENDIENTE
**Descripción:** Ver detalles de usuario (stalking)
**Permisos:** Public / Owner
**Nota:** Posible violación de privacidad

#### `readmore.md` ❌ PENDIENTE
**Descripción:** Leer más contenido de URL
**Permisos:** Public

---

## 📝 NOTAS IMPORTANTES

### Archivos de Base de Datos Necesarios
- `db/banned.json` - Lista de usuarios baneados
- `db/muted.json` - Usuarios silenciados
- `db/warnings.json` - Sistema de advertencias
- `db/autoreply.json` - Respuestas automáticas
- `db/banned.json` - Usuarios baneados del anticall
- `db/badwords.json` - Palabras prohibidas
- `db/custom_commands.json` - Comandos personalizados
- `db/group_settings.json` - Configuración por grupo
- `db/group_stats.json` - Estadísticas de grupo
- `db/scheduled_messages.json` - Mensajes programados
- `db/welcome_messages.json` - Mensajes de bienvenida
- `db/staff.json` - Lista de staff
- `db/pm_blocked.json` - PMs bloqueados
- `db/invoices.json` - Facturas
- `db/rentals.json` - Sistema de rentas

### Módulos del Core Necesarios
- `core/AdminChecker.js` - Validar admin
- `core/CommandHandler.js` - Manejo de comandos
- `core/MessageHandler.js` - Manejo de mensajes
- `core/spyEvent.js` - Espionaje de eventos
- `core/Deduplicator.js` - Anti-duplicados
- `core/SessionManager.js` - Manejo de sesiones
- `core/Database.js` - Utilidades de DB

### Estructura de Respuesta Estándar
Todos usan `Formatter.js` para respuestas formateadas:
```javascript
import { reply } from '../core/Formatter.js';

await sock.sendMessage(chatId, {
    text: reply('Mensaje aquí')
}, { quoted: message });
```

---

*Generado: 12 de Abril de 2026*
*Para crear los .md: copiar plantilla + personalizar con la información de la tabla*
