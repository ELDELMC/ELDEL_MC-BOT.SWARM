# 📊 Comando STATUS

## Información General

**Comando:** `.status`
**Aliases:** `estatus`, `serverinfo`, `info`
**Categoría:** Información
**Descripción:** Ver estado de servicios y APIs online

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
Comando que muestra el estado de disponibilidad de todos los servicios y APIs que usa el bot. Incluye estados de APIs de clima, pokédex, GitHub, noticias y criptomonedas.

### Cómo Funciona
1. Verifica el estado de cada servicio/API
2. Compila un resumen de estado (en línea/fuera)
3. Envía al usuario el reporte formateado
4. Usa marcas de verificación para mostrar disponibilidad

### Archivos Afectados
- Ninguno (información de lectura únicamente)

---

## 🔧 Uso

### Sintaxis
```
.status
```

### Ejemplos
```
.status              ← Ver estado de todos los servicios
```

### Respuesta del Bot
✅ **Éxito:**
```
📊 ESTADO DE SERVICIOS

✅ API de Clima: En línea
✅ API de Pokédex: En línea
✅ API de GitHub: En línea
✅ API de Noticias: En línea
✅ API de Criptomonedas: En línea
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

---

## 🔗 Dependencias

- `axios` - Para verificar APIs externas

---

## 🔍 APIs Monitoreadas

1. **API de Clima** - OpenWeatherMap
2. **API de Pokédex** - PokéAPI
3. **API de GitHub** - GitHub API
4. **API de Noticias** - NewsAPI
5. **API de Criptomonedas** - CoinGecko

---

## 📝 Notas Adicionales

- Útil para diagnosticar problemas de conectividad
- Cooldown de 5 segundos evita spam
- Muestra solo servicios activos en el bot
- Ideal para usuarios que reportan errores de comandos
