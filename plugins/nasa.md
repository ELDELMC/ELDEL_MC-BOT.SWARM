# 🚀 Comando NASA

## Información General

**Comando:** `.nasa`
**Aliases:** `space`, `apod`, `astronomy-pic`
**Categoría:** Información / Ciencia
**Descripción:** Obtener imagen astronómica del día de NASA

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
Comando que obtiene la "Astronomy Picture of the Day" (APOD) de NASA. Incluye imagen espectacular junto con descripción científica del fenómeno astronómico.

### Cómo Funciona
1. Consulta API de APOD de NASA
2. Obtiene imagen o vídeo del día
3. Descarga la imagen
4. Envía junto con título y descripción detallada

---

## 🔧 Uso

### Sintaxis
```
.nasa
.nasa today      ← Imagen de hoy
.nasa yesterday  ← Imagen de ayer
```

### Ejemplos
```
.nasa                ← Imagen astronómica del día
.nasa today          ← Igual a .nasa
.nasa yesterday      ← Imagen de ayer
```

### Respuesta del Bot
✅ **Éxito:**
```
🚀 NASA - ASTRONOMY PICTURE OF THE DAY

📷 Título:
"Nebulosa de Orión: Creador de Estrellas"

📝 Descripción:
La Nebulosa de Orión es una nube de gas y polvo 
interestelar ubicada a 1,400 años luz de la Tierra. 
En su interior se forman miles de nuevas estrellas...

📅 Fecha: 15 de Enero de 2024
🔬 Fuente: NASA / Hubble Space Telescope

[Imagen enviada]
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
| **API Externa** | NASA APOD API |
| **Requiere API Key** | Sí (gratuita) |

---

## 🔗 Dependencias

- `axios` - Para llamadas HTTP a API
- `fs` - Para guardar imágenes
- `Formatter.js` - Formateo de respuestas
- **API Key:** Configurar en `config.js` (nasaKey)

---

## ⚙️ Configuración Requerida

```javascript
// config.js
export default {
    nasaKey: "TU_API_KEY_AQUI", // NASA API Key (gratuita)
    // ... resto de config
}
```

**Obtener API Key:**
1. Ir a https://api.nasa.gov/
2. Llenar formulario simple
3. Recibir API Key por email inmediatamente
4. Es gratuita y sin límites prácticos

---

## 📊 Datos Incluidos

```json
{
  "date": "2024-01-15",
  "title": "Nebulosa de Orión",
  "explanation": "Descripción científica detallada...",
  "url": "https://apod.nasa.gov/apod/image/...",
  "hdurl": "https://apod.nasa.gov/apod/hdimage/...",
  "media_type": "image" // o "video"
}
```

---

## 🌌 Tipos de Contenido

- 🖼️ Imágenes astronómicas de telescopios
- 📹 Vídeos espaciales
- 🌠 Fenómenos cósmicos
- 🔭 Observaciones de satélites
- 🪐 Planetas y lunas
- ⭐ Galaxias y nebulosas

---

## 💾 Limpieza de Imágenes

El bot descarga imágenes temporalmente. Se recomenda limpiar la carpeta `temp/` regularmente:

```bash
rm -rf temp/nasa_*.jpg
```

---

## ⚠️ Limitaciones

- Una imagen por día disponible
- Historiales disponibles desde 1995
- Imágenes de alta resolución pueden ser pesadas (5-10MB)

---

## 📝 Notas Adicionales

- Contenido educativo y científico
- Historias fascinantes detrás de cada imagen
- Perfecto para amantes del espacio
- Fuente confiable (NASA)
- Nueva imagen cada día
- Archivo histórico desde 1995
