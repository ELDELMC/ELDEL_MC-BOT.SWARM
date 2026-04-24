# 📰 Comando NEWS

## Información General

**Comando:** `.news`
**Aliases:** `noticias`, `news-today`, `headlines`
**Categoría:** Información
**Descripción:** Obtener noticias actuales del mundo

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
Comando que obtiene las noticias más recientes del mundo de fuentes confiables. Incluye titulares, descripción breve, fuente y enlace al artículo completo.

### Cómo Funciona
1. Consulta API de noticias
2. Obtiene titulares más recientes
3. Filtra por país/idioma (configurable)
4. Devuelve top 5-10 noticias formateadas

---

## 🔧 Uso

### Sintaxis
```
.news              ← Noticias mundiales
.news <categoría>  ← Noticias de categoría (opcional)
```

### Ejemplos
```
.news                  ← Últimas noticias mundiales
.news technology       ← Noticias de tecnología
.news sports          ← Noticias de deportes
.news business        ← Noticias de negocios
```

### Respuesta del Bot
✅ **Éxito:**
```
📰 NOTICIAS RELEVANTES

1️⃣ Nueva IA revolucionaria presentada
   Por: TechCrunch
   "El nuevo modelo de IA supera expectativas..."
   🔗 Leer más

2️⃣ Cambio climático acelera en 2024
   Por: BBC News
   "Nuevos datos confirman tendencia preocupante..."
   🔗 Leer más

3️⃣ Descubrimiento científico importante
   Por: Nature
   "Investigadores encuentran nueva partícula..."
   🔗 Leer más
```

---

## ⚙️ Configuración Técnica

| Propiedad | Valor |
|-----------|-------|
| **Cooldown** | 5000ms (5 segundos) |
| **Group Only** | No |
| **Admin Only** | No |
| **Owner Only** | No |
| **Requiere DB** | No |
| **API Externa** | NewsAPI.org |
| **Requiere API Key** | Sí |

---

## 🔗 Dependencias

- `axios` - Para llamadas HTTP a API
- `Formatter.js` - Formateo de respuestas
- **API Key:** Configurar en `config.js` (newsKey)

---

## ⚙️ Configuración Requerida

```javascript
// config.js
export default {
    newsKey: "TU_API_KEY_AQUI", // NewsAPI.org
    newsCountry: "es", // País (es, us, gb, etc)
    newsLanguage: "es",
    // ... resto de config
}
```

---

## 📰 Categorías Disponibles

- 🔬 Technology (tecnología)
- 💼 Business (negocios)
- 🏃 Sports (deportes)
- 🎮 Entertainment (entretenimiento)
- 🏥 Health (salud)
- 🌍 General (general)
- 🔴 Emergency (emergencias)

---

## 🌍 Países Soportados

- 🇺🇸 Estados Unidos (us)
- 🇬🇧 Reino Unido (gb)
- 🇪🇸 España (es)
- 🇲🇽 México (mx)
- 🇦🇷 Argentina (ar)
- 🇮🇹 Italia (it)
- 🇫🇷 Francia (fr)
- Y más de 50 países...

---

## ⚠️ Limitaciones

- Requiere API Key gratuita de NewsAPI.org
- Límite: 100 solicitudes/día en versión gratuita
- Máximo 10 noticias por solicitud

---

## 📝 Notas Adicionales

- Noticias actualizadas cada hora
- Incluye enlaces directos a fuentes
- Compatible con múltiples idiomas y países
- Perfecto para mantenerse informado
- Sin costo en versión gratuita
- Fuentes confiables y reconocidas
