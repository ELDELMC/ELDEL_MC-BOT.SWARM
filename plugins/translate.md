# 🗣️ Comando TRANSLATE

## Información General

**Comando:** `.translate`
**Aliases:** `trad`, `traducir`, `translate-to`
**Categoría:** Utilidad
**Descripción:** Traducir texto a diferentes idiomas

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
Comando versátil de traducción que permite convertir texto de cualquier idioma a otro. Utiliza tecnología de traducción profesional con soporte para más de 100 idiomas.

### Cómo Funciona
1. Usuario proporciona código de idioma destino y texto
2. Bot detecta idioma original automáticamente
3. Realiza traducción
4. Devuelve texto traducido con indicadores de idioma

---

## 🔧 Uso

### Sintaxis
```
.translate <idioma> <texto>
.translate <código_idioma> <texto>
```

### Ejemplos
```
.translate en Hello, how are you   ← Detecta español, traduce a inglés
.translate es Good morning         ← Detecta inglés, traduce a español
.translate fr The quick brown fox  ← Traduce a francés
.translate de Como estás           ← Traduce a alemán
.translate ja Hello world          ← Traduce a japonés
```

### Respuesta del Bot
✅ **Éxito:**
```
🗣️ TRADUCCIÓN

Idioma Original: Español
📝 Texto: "Hola, ¿cómo estás?"

Idioma Destino: Inglés
✅ Traducción: "Hello, how are you?"
```

❌ **Error:**
```
❌ Idioma no válido: "xx"
Usa código de 2 letras: en, es, fr, de, ja, etc.
```

---

## ⚙️ Configuración Técnica

| Propiedad | Valor |
|-----------|-------|
| **Cooldown** | 2000ms (2 segundos) |
| **Group Only** | No |
| **Admin Only** | No |
| **Owner Only** | No |
| **Requiere DB** | No |
| **API Externa** | Google Translate o MyMemory |
| **Requiere API Key** | No |

---

## 🔗 Dependencias

- `axios` - Para llamadas HTTP a API
- `Formatter.js` - Formateo de respuestas

---

## 🌍 Idiomas Soportados

```
Códigos de idioma (ISO 639-1):
en  → Inglés
es  → Español
fr  → Francés
de  → Alemán
it  → Italiano
pt  → Portugués
ja  → Japonés
zh  → Chino (Mandarín)
ru  → Ruso
ko  → Coreano
ar  → Árabe
hi  → Hindi
nl  → Holandés
pl  → Polaco
tr  → Turco
... más de 100 idiomas
```

---

## 📊 Ejemplo de Uso Avanzado

```
.translate es "Hello, I hope you have a great day!" 
→ Hola, ¡espero que tengas un excelente día!

.translate ja こんにちは
→ Hola (detección automática del idioma)

.translate kr 안녕하세요
→ Hola (coreano a español)
```

---

## 📝 Notas Adicionales

- Detección automática de idioma origen
- Soporte para más de 100 idiomas
- Traducciones profesionales y precisas
- Sin límite de caracteres (hasta cierto punto)
- Mantiene emojis y puntuación
- Útil para comunicación multiidioma
- Perfecto para grupos internacionales
