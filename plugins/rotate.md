# 🔄 Comando ROTATE

## Información General

**Comando:** `.rotate`
**Aliases:** `girar`, `rotar`, `turn`
**Categoría:** Herramientas / Edición de Imágenes
**Descripción:** Rotar imagen ciertos grados

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

Rota la imagen el ángulo especificado. Soporta rotaciones en cualquier dirección.

---

## 🔧 Uso

### Sintaxis
```
Responder a imagen con:
.rotate <grados>
```

### Ejemplos
```
[Usuario responde a imagen]
.rotate 90             ← Girar 90° a la derecha
.rotate 180            ← Girar 180° (voltear)
.rotate -90            ← Girar 90° a la izquierda
.rotate 45             ← Girar 45°
```

---

## ⚙️ Configuración Técnica

| Propiedad | Valor |
|-----------|-------|
| **Cooldown** | 2000ms |
| **Angulo Min** | -360° |
| **Angulo Max** | 360° |
| **Tiempo Proceso** | 1-3 segundos |

---

## 📷 Formatos Soportados

- ✅ JPG, PNG, WebP

---

## 💡 Casos de Uso

- Corregir foto al revés
- Efecto artístico
- Composición diagonal
- Ajuste de orientación

---

## 📝 Notas Adicionales

- Ángulos positivos = sentido horario
- Ángulos negativos = sentido antihorario
