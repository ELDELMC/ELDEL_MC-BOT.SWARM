# 📰 Comando FACT

## Información General

**Comando:** `.fact`
**Aliases:** `dato`, `curiosidad`, `trivia`
**Categoría:** Información / Educación
**Descripción:** Obtener dato curioso o dato interesante aleatorio

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
Comando que obtiene datos curiosos aleatorios sobre animales, historia, ciencia y más de una API externa confiable.

### Cómo Funciona
1. Solicita dato de API externa
2. Selecciona categoría aleatoria (si aplica)
3. Devuelve dato formateado
4. Puede incluir imagen relacionada

---

## 🔧 Uso

### Sintaxis
```
.fact
```

### Ejemplos
```
.fact              ← Obtener dato curioso aleatorio
```

### Respuesta del Bot
✅ **Éxito:**
```
🧠 DATO CURIOSIDAD

¿Sabías que los gatos tienen más de 
20 músculos para mover sus orejas?

📌 Categoría: Animales
```

❌ **Error:**
```
❌ No pude obtener el dato en este momento.
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
| **API Externa** | uselessfacts.jsoup.com o similar |

---

## 🔗 Dependencias

- `axios` - Para llamadas HTTP a API
- `Formatter.js` - Formateo de respuestas

---

## 📊 Categorías de Hechos

- 🐾 Animales
- 🏛️ Historia
- 🔬 Ciencia
- 🌍 Geografía
- 📚 Educación
- 🎓 Trivia General

---

## 📝 Notas Adicionales

- Totalmente aleatorio, distinto cada vez
- Excelente para aprender cosas nuevas
- Perfecto en grupos para conversación
- API sin autenticación requerida
- Respuestas rápidas y confiables
