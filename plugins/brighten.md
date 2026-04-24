# ☀️ Comando BRIGHTEN

## Información General

**Comando:** `.brighten`
**Aliases:** `brillo`, `aumentar-brillo`, `bright`
**Categoría:** Herramientas / Edición de Imágenes
**Descripción:** Aumentar brillo de imagen

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

Aumenta la luminosidad general de una imagen manteniendo los colores. Útil para fotos oscuras o efecto de luz.

---

## 🔧 Uso

### Sintaxis
```
Responder a imagen con:
.brighten
.brighten <nivel>     # 1-10 (opcional)
```

### Ejemplos
```
[Usuario envía imagen]
.brighten              ← Aumento normal
.brighten 3            ← Aumento suave
.brighten 8            ← Aumento fuerte
```

---

## ⚙️ Configuración Técnica

| Propiedad | Valor |
|-----------|-------|
| **Cooldown** | 3000ms |
| **Group Only** | No |
| **Tiempo Proceso** | 2-5 segundos |
| **Máximo tamaño** | 10MB |

---

## 🔗 Dependencias

- `sharp` - Procesamiento de imágenes
- `Formatter.js`

---

## 📷 Formatos Soportados

- ✅ JPG/JPEG, PNG, WebP, GIF

---

## 💡 Casos de Uso

- Corregir fotos subexpuestas
- Efecto de claridad
- Destacar detalles oscuros
- Edición artística

---

## 📝 Notas Adicionales

- Preserva estructura de color
- Procesamiento rápido
- Ajuste escalable
