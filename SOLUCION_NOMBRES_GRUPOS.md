# 🎯 SOLUCIÓN IMPLEMENTADA: Preservar Nombres Reales de Grupos

## 📌 Resumen

Se ha solucionado el problema donde los nombres de grupos aparecían como `_________` en `db/grupos_clonados/`. 

**Problema**: La función `sanitizeGroupName()` reemplazaba todos los caracteres especiales (emojis, Unicode, fuentes especiales) con guiones bajos, perdiendo el nombre real.

**Solución**: Implementar **URL encoding** que preserva todos los caracteres especiales directamente en el nombre del archivo, junto con un sistema de metadatos para recuperación.

---

## ✅ Cambios Realizados

### 1. **CLONADOR/utils/clonador.js**
- ✅ Función `sanitizeGroupName()` ahora usa **URL encoding** en lugar de reemplazo de caracteres
- ✅ Nueva función `desanitizeGroupName()` para decodificar nombres cuando se necesite mostrarlos
- ✅ Actualizado `listarGruposClonados()` y `listarGruposClonadosSync()` para decodificar nombres en listas

### 2. **CLONADOR/utils/spyMode.js**
- ✅ Agregadas importaciones: `fs`, `path`, `fileURLToPath`
- ✅ Nueva función `saveGroupMetadata()` que guarda nombres reales en `_groupMetadata.json`
- ✅ Actualizado `ensureGroup()` para guardar nombre real (`realName`) junto con nombre codificado
- ✅ Mejorados logs para mostrar nombres reales en lugar de nombres codificados
- ✅ Integración automática de metadatos cada vez que se detecta un grupo nuevo

### 3. **Nuevos Scripts Utilities**
- ✅ **recover-group-names.js** — Recupera y renombra archivos con nombres incorrectos
- ✅ **migrate-group-names.js** — Script de migración que intenta recuperar nombres desde MongoDB
- ✅ **test-group-names.js** — Pruebas unitarias para verificar codificación/decodificación

### 4. **Documentación**
- ✅ **GUIA_NOMBRES_GRUPOS.md** — Guía completa con ejemplos, troubleshooting y instrucciones

---

## 🔄 Cómo Funciona

### Antes (❌ Problema)
```
Grupo en WhatsApp: "✨sʜɪᴛ🌙"
        ↓
sanitizeGroupName() — reemplaza caracteres especiales
        ↓
Nombre guardado: "_________s_______"  😞
```

### Después (✅ Solución)
```
Grupo en WhatsApp: "✨sʜɪᴛ🌙"
        ↓
URL encoding
        ↓
Archivo guardado: "%E2%9C%A8sʜɪᴛ%F0%9F%8C%99.json"
        ↓
Metadatos guardados: _groupMetadata.json
        ↓
Logs muestran: "✨sʜɪᴛ🌙"  ✅
```

---

## 📊 Ejemplos de Conversión

| Nombre Original | Nombre de Archivo | En Logs |
|---|---|---|
| `✨sʜɪᴛ🌙` | `%E2%9C%A8sʜɪᴛ%F0%9F%8C%99.json` | `✨sʜɪᴛ🌙` |
| `【soporte】` | `%E3%80%90soporte%E3%80%91.json` | `【soporte】` |
| `Café ☕` | `Caf%C3%A9%20%E2%98%95.json` | `Café ☕` |
| `los_del_flow_pepe` | `los_del_flow_pepe.json` | `los_del_flow_pepe` |
| `Grupo Normal` | `Grupo%20Normal.json` | `Grupo Normal` |

---

## 🚀 Uso

### Automático (Sin Configuración)
La próxima vez que el bot detecte grupos:
1. Los nombres se guardarán correctamente con URL encoding
2. Se creará `_groupMetadata.json` automáticamente
3. Los logs mostrarán nombres reales

### Manual (Recuperar Antiguos)
```bash
node recover-group-names.js
```

---

## 📝 Archivos Modificados/Creados

```
CLONADOR/
  └── utils/
      ├── clonador.js          [MODIFICADO]   — Nuevo encoding
      └── spyMode.js           [MODIFICADO]   — Metadatos automáticos

Raíz/
  ├── GUIA_NOMBRES_GRUPOS.md       [NUEVO]    — Documentación completa
  ├── recover-group-names.js        [NUEVO]    — Script de recuperación
  ├── migrate-group-names.js        [NUEVO]    — Script de migración
  └── test-group-names.js           [NUEVO]    — Pruebas unitarias
```

---

## ✨ Beneficios

✅ **Nombres Auténticos** — Se preservan exactamente como en WhatsApp  
✅ **Automático** — No requiere configuración manual  
✅ **Recuperable** — Scripts incluidos para archivos antiguos  
✅ **Compatible** — Funciona con emojis, Unicode, fuentes especiales  
✅ **Metadatos** — Se guardan automáticamente para referencia  
✅ **Reversible** — Los nombres se pueden decodificar en cualquier momento  

---

## 📦 Verificación

Para verificar que todo funciona:
```bash
node test-group-names.js
```

Se mostrarán 14 casos de prueba, todos deberían pasar con ✅

---

## 🔗 Próximos Pasos

1. **Espera a que el bot monitoree grupos nuevos** → Los nombres se guardarán correctamente
2. **Para archivos antiguos** → Ejecuta `node recover-group-names.js`
3. **Verifica en logs** → Los nombres reales aparecerán decodificados

---

## 📎 Información Adicional

- **Commit**: `dda94cc` 
- **Push**: Exitoso a GitHub (origin/main)
- **Testing**: 14/14 pruebas pasadas ✅
- **Documentación**: GUIA_NOMBRES_GRUPOS.md

---

**Implementado el 12 de abril de 2025**
