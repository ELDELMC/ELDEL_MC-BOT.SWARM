# 📖 Comando WIKIPEDIA

## Información General

**Comando:** `.wikipedia`
**Aliases:** `wiki`, `buscar-wiki`, `search-wiki`
**Categoría:** Información / Educación
**Descripción:** Buscar información en Wikipedia

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
Comando que consulta Wikipedia directamente para obtener información sobre cualquier tema. Devuelve resumen de artículos junto con enlace.

### Cómo Funciona
1. Usuario proporciona tema a buscar
2. Bot consulta API de Wikipedia
3. Obtiene resumen del artículo más relevante
4. Devuelve con enlace al artículo completo

---

## 🔧 Uso

### Sintaxis
```
.wikipedia <tema>
.wiki <tema>
```

### Ejemplos
```
.wikipedia Albert Einstein      ← Buscar a Einstein
.wiki Python programming        ← Buscar sobre Python
.wikipedia Machine Learning     ← Buscar Machine Learning
```

### Respuesta del Bot
✅ **Éxito:**
```
📚 WIKIPEDIA - Albert Einstein

Albert Einstein fue un físico teórico alemán, 
nacido en 1879. Desarrolló la teoría de la 
relatividad, uno de los dos pilares de la 
física moderna...

[Leer más en Wikipedia]
https://en.wikipedia.org/wiki/Albert_Einstein
```

❌ **Error:**
```
❌ No encontré artículos sobre: "asdasdasd"
Intenta con otro tema.
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
| **API Externa** | Wikipedia API |
| **Requiere API Key** | No |

---

## 🔗 Dependencias

- `axios` - Para llamadas HTTP a API
- `Formatter.js` - Formateo de respuestas

---

## 📊 Temas Soportados

- **Personas:** Científicos, políticos, artistas, celebridades
- **Historia:** Eventos, épocas, civilizaciones
- **Ciencia:** Física, química, biología, astronomía
- **Tecnología:** Programación, IA, electrónica
- **Lugares:** Ciudades, países, monumentos
- **Conceptos:** Matemática, filosofía, economía
- Y literalmente cualquier tema en Wikipedia

---

## 🌍 Idiomas Soportados

- Inglés (en.wikipedia.org)
- Español (es.wikipedia.org)
- Otros idiomas configurables

---

## 📝 Notas Adicionales

- Busca automáticamente el artículo más relevante
- Devuelve resumen limpio del artículo
- Incluye enlace directo a Wikipedia
- Sin límite de búsquedas
- Datos siempre actualizados
- Excelente para investigación rápida
