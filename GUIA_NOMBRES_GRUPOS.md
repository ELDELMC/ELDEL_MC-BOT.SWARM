# 🔒 Corrección: Preservar Nombres de Grupos con Caracteres Especiales

## 📋 El Problema

Los nombres de grupos con caracteres especiales (emojis, fuentes especiales Unicode, acentos no latinos, etc.) aparecían como `_________` en los archivos de `db/grupos_clonados/`.

Esto ocurría porque la función `sanitizeGroupName()` reemplazaba **todos los caracteres especiales** con guiones bajos (`_`), perdiendo información valiosa del nombre real del grupo.

### Antes ❌
```javascript
function sanitizeGroupName(subject) {
  return subject
    .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s-]/g, '_')  // ← Elimina emojis y caracteres Unicode especiales
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase();
}

// Resultado: "✨sʜɪᴛ🌙" → "_______s_______" 😞
```

---

## ✅ La Solución

Se implementó **URL encoding** para preservar todos los caracteres especiales en el nombre del archivo, mientras se mantiene compatibilidad con los filesystems:

### Después ✅
```javascript
function sanitizeGroupName(subject) {
  // Usar URL encoding para preservar caracteres especiales
  const encoded = encodeURIComponent(subject);
  return encoded;  // "✨sʜɪᴛ🌙" → "%E2%9C%A8sʜɪᴛ%F0%9F%8C%99"
}
```

### Metadatos Automáticos 

Se creó un archivo `_groupMetadata.json` que guarda:
- ✅ Nombre original del grupo (con caracteres especiales)
- ✅ ID del grupo (JID)
- ✅ Fecha de primer registro

```json
{
  "%E2%9C%A8sʜɪᴛ%F0%9F%8C%99": {
    "realName": "✨sʜɪᴛ🌙",
    "groupJid": "120363023654234567-1234567890@g.us",
    "savedAt": "2025-04-12T03:45:22.123Z"
  }
}
```

---

## 🚀 Cómo Usar

### Opción 1: Dejar que el Bot Corrija Automáticamente

1. **Solo espera** — La próxima vez que el bot se conecte y reciba mensajes de grupos:
   - Los nombres se guardarán correctamente con URL encoding
   - El archivo `_groupMetadata.json` se creará automáticamente
   - Los nuevos grupos tendrán nombres preservados

2. **Verificar en logs**:
   ```
   🕵️ [SPY AUTO] 📡 Radar ENCENDIDO en: ✨sʜɪᴛ🌙
   🕵️ [SPY AUTO] 💾 Archivo: %E2%9C%A8sʜɪᴛ%F0%9F%8C%99.json
   ```

### Opción 2: Recuperar Nombres Existentes

Si tienes archivos antiguos con nombres incorrectos como `_________s_______.json`:

```bash
# Ejecutar script de recuperación
node recover-group-names.js
```

**Qué hace:**
- Lee el archivo `_groupMetadata.json`
- Renombra archivos antiguos al nombre correcto con URL encoding
- Muestra reportedetallado de recuperaciones

**Ejemplo:**
```
🔄 RENOMBRADO
   📝 Nombre real: ✨sʜɪᴛ🌙
   ❌ Viejo: _________s_______.json
   ✅ Nuevo: %E2%9C%A8sʜɪᴛ%F0%9F%8C%99.json
```

---

## 🔄 Migración de Archivos Antiguos

Si tienes archivos con nombres sobre-sanitizados (muchos `_`), sigue estos pasos:

### Paso 1: Activar Nuevos Registros
1. Abre WhatsApp
2. Ve a cada grupo que necesites
3. El bot capturará el nombre real en metadatos

### Paso 2: Ejecutar Recuperación
```bash
node recover-group-names.js
```

### Paso 3: Verificar
```bash
# Ver archivos guardados (con nombres preservados)
ls -la db/grupos_clonados/
# Verás: %E2%9C%A8sʜɪᴛ%F0%9F%8C%99.json
# En lugar de: _________s_______.json
```

---

## 📖 Cómo los Nombres se Usan

### En Archivos
Los nombres se codifican con URL encoding para seguridad del filesystem:
```
db/grupos_clonados/%E2%9C%A8sʜɪᴛ%F0%9F%8C%99.json
```

### En Logs del Bot
El bot siempre mostrará el **nombre real** en los logs (decodificado):
```
💾 ✨sʜɪᴛ🌙: 50 contactos → [573001234567, 573009876543, ...]
```

### En MongoDB
Se guarda también el nombre original:
```javascript
Contact {
  phoneNumber: "573001234567",
  groupName: "✨sʜɪᴛ🌙",        // ← Nombre original preservado
  groupJid: "120363023654234567-1234567890@g.us"
}
```

---

## 🔑 Funciones Técnicas

### En CLONADOR/utils/clonador.js

```javascript
// Codificar (para nombres de archivo)
function sanitizeGroupName(subject) {
  return encodeURIComponent(subject);
}

// Decodificar (para mostrar al usuario)
function desanitizeGroupName(encoded) {
  return decodeURIComponent(encoded);
}
```

### En CLONADOR/utils/spyMode.js

```javascript
// Guarda metadatos mientras monitorea
async function saveGroupMetadata(sanitizedName, realName, groupJid) {
  // Escribe a _groupMetadata.json
  // presevando nombre original
}

// Se llama en ensureGroup() cuando detecta un grupo nuevo
await saveGroupMetadata(groupName, metadata.subject, groupJid);
```

---

## ⚙️ Configuración (Sin Cambios Requeridos)

**No requiere configuración adicional.** El sistema es automático:

- ✅ Los nuevos grupos se guardan con nombres correctos
- ✅ Metadatos se crean automáticamente
- ✅ Logs muestran nombres legibles
- ✅ MongoDB preserva caracteres especiales

---

## 🐛 Troubleshooting

### Los archivos aún muestran `_________` 

**Causa**: Archivos viejos creados antes de esta actualización.

**Solución**:
```bash
node recover-group-names.js
```

### El archivo `_groupMetadata.json` no se crea

**Causa**: El bot no ha registrado nuevos grupos aún.

**Solución**: Espera a que el bot monitoree un grupo nuevo y reciba un mensaje.

### Los nombres en .invo aún salen incorrectos

**Causa**: El archivo `.json` tiene un nombre incorrecto.

**Solución**: Ejecuta `recover-group-names.js` para renombrar archivos.

---

## 📝 Archivos Modificados

```
CLONADOR/utils/clonador.js          ← Nueva función desanitizeGroupName()
CLONADOR/utils/spyMode.js            ← Nueva función saveGroupMetadata()
recover-group-names.js               ← Nuevo script de recuperación
migrate-group-names.js               ← Script de migración (backup)
```

---

## ✨ Resultado Final

Ahora los grupos aparecen con sus nombres **auténticos y completos**:

```
ANTES ❌
_________s_______.json
________________-_______.json
_________________________.json

DESPUÉS ✅
%E2%9C%A8sʜɪᴛ%F0%9F%8C%99.json        (✨sʜɪᴛ🌙)
%F0%9F%98%8Egroups-name%F0%9F%98%8E.json  (😎groups-name😎)
%E3%80%90custom%E3%80%91.json          (【custom】)
```

Con sus metadatos para referencia:
```json
{
  "%E2%9C%A8sʜɪᴛ%F0%9F%8C%99": {
    "realName": "✨sʜɪᴛ🌙",
    "groupJid": "120363023654234567-1234567890@g.us",
    "savedAt": "2025-04-12T03:45:22.123Z"
  }
}
```

---

## 🎉 Beneficios

✅ **Precisión**: Nombres idénticos a WhatsApp  
✅ **Preservación**: Ningún carácter se pierde  
✅ **Automatización**: No requiere configuración  
✅ **Compatibilidad**: Funciona con todos los caracteres Unicode  
✅ **Recuperable**: Scripts de recuperación incluidos  

---

**Implementado el 12 de abril de 2025 — Versión 1.0**
