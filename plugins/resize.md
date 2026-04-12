# 📏 Comando RESIZE

## Información General

**Comando:** `.resize`
**Aliases:** `redimensionar`, `scale`, `tamaño`
**Categoría:** Herramientas / Edición de Imágenes
**Descripción:** Cambiar tamaño de imagen

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

Redimensiona imagen a ancho y alto especificados manteniendo calidad.

---

## 🔧 Uso

### Sintaxis
```
Responder a imagen con:
.resize <ancho> <alto>
```

### Ejemplos
```
[Usuario responde a imagen]
.resize 400 300        ← 400x300 píxeles
.resize 800 600        ← 800x600 píxeles
.resize 200 200        ← Cuadrado 200x200
```

---

## ⚙️ Configuración Técnica

| Propiedad | Valor |
|-----------|-------|
| **Cooldown** | 2000ms |
| **Máximo tamaño** | 4000x4000 |
| **Mínimo tamaño** | 50x50 |

---

## 📷 Formatos Soportados

- ✅ JPG, PNG, WebP

---

## 💡 Casos de Uso

- Comprimir tamaño
- Ajustar para redes sociales
- Crear iconos
- Optimizar imágenes

---

## 📝 Notas Adicionales

- Mantiene proporciones si solo da un valor
- Podría distorsionar si no respeta proporción
