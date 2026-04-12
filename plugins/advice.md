# 🎲 Comando ADVICE

## Información General

**Comando:** `.advice`
**Aliases:** `aconsejar`, `consejo`, `tip`
**Categoría:** Utilidad / Información
**Descripción:** Obtener un consejo aleatorio del día

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
Comando que obtiene un consejo aleatorio de una API externa de consejos. Perfecta para romper el hielo o inspiración diaria.

### Cómo Funciona
1. Realiza una solicitud a API de consejos
2. Obtiene texto aleatorio de consejo
3. Devuelve formateado con emoji
4. Sin parámetros requeridos

---

## 🔧 Uso

### Sintaxis
```
.advice
```

### Ejemplos
```
.advice              ← Obtener consejo aleatorio
```

### Respuesta del Bot
✅ **Éxito:**
```
💡 CONSEJO DEL DÍA

"Never give up on what you really want. 
It's difficult to wait but it's more difficult 
to regret."
```

❌ **Error:**
```
❌ No pude obtener el consejo en este momento.
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
| **API Externa** | adviceslip.com |

---

## 🔗 Dependencias

- `axios` - Para llamadas HTTP a API
- `Formatter.js` - Formateo de respuestas

---

## 📊 Datos de Respuesta

```json
{
  "slip_id": 12345,
  "advice": "Texto del consejo aquíaquí",
  "date": "2024-01-15"
}
```

---

## 📝 Notas Adicionales

- Comandos completamente aleatorio
- Sin límite de uso (excepto cooldown)
- Funciona en privado y grupos
- Bueno para motivación diaria
- Ideal para conversaciones casuales
