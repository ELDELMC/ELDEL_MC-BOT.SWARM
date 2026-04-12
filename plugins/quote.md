# 🎤 Comando QUOTE

## Información General

**Comando:** `.quote`
**Aliases:** `frase`, `cita`, `quote-of-day`
**Categoría:** Información / Inspiración
**Descripción:** Obtener frase célebre o cita inspiradora

**Estado:** ✅ Implementado

---

## 👥 Permisos Requeridos

| Rol | Puede Ejecutar |
|-----|---|
| **Usuarios Comunes** | ✅ Sí |
| **Administradores** | ✅ Sí |
| **Propietario** | ✅ Sí |

---

## 📋 Funcionalidad Técnica

### Descripción Detallada
Comando que obtiene frases célebres y citas inspiradoras de personajes famosos. Incluye autor y contexto cuando está disponible.

### Cómo Funciona
1. Solicita cita de API de frases
2. Obtiene frase aleatoria
3. Incluye autor/personaje
4. Formatea con emojis ilustrativos

---

## 🔧 Uso

### Sintaxis
```
.quote
```

### Ejemplos
```
.quote              ← Obtener cita aleatoria
```

### Respuesta del Bot
✅ **Éxito:**
```
✨ FRASE DEL DÍA

"The only way to do great work is to 
love what you do."

— Steve Jobs
```

❌ **Error:**
```
❌ No pude obtener la frase en este momento.
```

---

## ⚙️ Configuración Técnica

| Propiedad | Valor |
|-----------|-------|
| **Cooldown** | 3000ms (3 segundos) |
| **Group Only** | No |
| **Admin Only** | No |
| **Owner Only** | No |
| **Requiere DB** | No |
| **API Externa** | api.quotable.io |

---

## 🔗 Dependencias

- `axios` - Para llamadas HTTP a API
- `Formatter.js` - Formateo de respuestas

---

## 📊 Autores Famosos Incluidos

- Steve Jobs
- Albert Einstein
- Mahatma Gandhi
- Nelson Mandela
- Walt Disney
- Y más de 1000 autores

---

## 📝 Notas Adicionales

- Completamente aleatorio - nueva frase cada vez
- Ideal para inspiración diaria
- Autores internacionales y diversos
- Perfecto para compartir en grupos
- Base de datos actualizada regularmente
