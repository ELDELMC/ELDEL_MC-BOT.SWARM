# 🌤️ Comando WEATHER

## Información General

**Comando:** `.weather`
**Aliases:** `clima`, `weather-now`, `temp`
**Categoría:** Información
**Descripción:** Obtener información del clima y temperatura actual

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
Comando que obtiene información de clima en tiempo real para cualquier ciudad del mundo. Incluye temperatura, humedad, velocidad del viento y pronóstico.

### Cómo Funciona
1. Usuario proporciona nombre de ciudad
2. Bot consulta API de clima (OpenWeatherMap)
3. Obtiene datos actuales y pronóstico
4. Devuelve formateado con emojis de clima

---

## 🔧 Uso

### Sintaxis
```
.weather <ciudad>
```

### Ejemplos
```
.weather Madrid              ← Clima de Madrid
.weather New York            ← Clima de Nueva York
.weather Tokyo               ← Clima de Tokio
```

### Respuesta del Bot
✅ **Éxito:**
```
🌦️ CLIMA ACTUAL - MADRID

🌡️ Temperatura: 18°C
💨 Sensación: 16°C
💧 Humedad: 65%
🌪️ Viento: 12 km/h
☁️ Cobertura: Parcialmente nublado

🌅 Próximas horas:
14:00 - 19°C, Templado
17:00 - 17°C, Viento ligero
20:00 - 14°C, Frío
```

❌ **Error:**
```
❌ No encontré ciudad: "Asdasdasd"
Usa: .weather <nombre_ciudad>
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
| **API Externa** | OpenWeatherMap API |
| **Requiere API Key** | Sí |

---

## 🔗 Dependencias

- `axios` - Para llamadas HTTP a API
- `Formatter.js` - Formateo de respuestas
- **API Key:** Configurar en `config.js` (weatherKey)

---

## ⚙️ Configuración Requerida

```javascript
// config.js
export default {
    weatherKey: "TU_API_KEY_AQUI", // OpenWeatherMap
    // ... resto de config
}
```

---

## 📊 Datos Incluidos en Respuesta

```json
{
  "city": "Madrid",
  "country": "ES",
  "temperature": 18,
  "feels_like": 16,
  "humidity": 65,
  "wind_speed": 12,
  "description": "Partly Cloudy",
  "icon": "02d",
  "forecast": [...]
}
```

---

## 📍 Ciudades Soportadas

- Todas las ciudades del mundo con datos de OpenWeatherMap
- Incluye ciudades pequeñas y grandes
- Actualización en tiempo real

---

## ⚠️ Limitaciones

- Requiere API Key gratuita de OpenWeatherMap
- Límite: 1000 llamadas/día en versión gratuita
- Para ciudades con espacios, usa comillas: ".weather 'New York'"

---

## 📝 Notas Adicionales

- Perfecto para saber si llevar paraguas
- Útil antes de salir de casa
- Pronóstico extendido disponible
- Compatible con ciudades internacionales
- Datos precisos y actualizados
