# 🎨 Comando BLUR

## Información General

**Comando:** `.blur`
**Aliases:** `desenfoque`, `blur-image`
**Categoría:** Herramientas / Edición de Imágenes
**Descripción:** Desenfocar imagen en nivel variable

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
Comando que aplica efecto de desenfoque (blur) a imágenes. Permite control de intensidad del efecto para crear desde desenfoque suave hasta efecto artístico.

### Cómo Funciona
1. Usuario responde a imagen con comando
2. Bot descarga la imagen
3. Aplica filtro de desenfoque
4. Devuelve imagen procesada

### Archivos Afectados
- `temp/` - Almacenamiento temporal de imágenes

---

## 🔧 Uso

### Sintaxis
```
Responder a imagen con:
.blur
.blur <intensidad>     # 1-10 (opcional)
```

### Ejemplos
```
[Usuario envía imagen]
.blur              ← Desenfoque normal (nivel 5)

[Usuario envía imagen]
.blur 2            ← Desenfoque suave
.blur 8            ← Desenfoque fuerte
```

### Respuesta del Bot
✅ **Éxito:**
```
✅ Imagen desenfocada correctamente
Intensidad: Nivel 5
Tiempo: 2 segundos

[Imagen procesada]
```

❌ **Error:**
```
❌ Responde a una imagen primero
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
| **Tiempo Proceso** | 2-5 segundos |

---

## 🔗 Dependencias

- `sharp` - Procesamiento de imágenes
- `Formatter.js` - Formateo de respuestas

---

## 🎛️ Parámetros de Intensidad

| Nivel | Intensidad | Uso |
|-------|-----------|-----|
| 1 | Muy Suave | Efecto artístico leve |
| 2-3 | Suave | Privacidad parcial |
| 4-6 | Normal | Desenfoque estándar |
| 7-9 | Fuerte | Privacidad máxima |
| 10 | Muy Fuerte | Efecto abstracto |

---

## 📷 Formatos Soportados

- ✅ JPG/JPEG
- ✅ PNG
- ✅ WebP
- ✅ GIF (primer frame)
- ✅ Máximo 10MB

---

## 💡 Casos de Uso

- Proteger privacidad en fotos
- Efecto artístico para diseño
- Ocultar detalles sensibles
- Crear efectos visuales
- Fotografía experimental

---

## 📊 Información Técnica

```
Algoritmo: Gaussian Blur (Desenfoque Gaussiano)
Radio de kernel: Escalable según intensidad
Preserva transparencia: Sí (PNG)
```

---

## ⚠️ Limitaciones

- Máximo 10MB por imagen
- Procesamiento puede tomar 2-5 segundos
- No funciona con vídeos/animaciones
- GIFs se procesan solo como imagen estática

---

## 📝 Notas Adicionales

- Excelente para privacidad en fotos
- Efecto gaussiano profesional
- Retiene calidad del nombre original
- Ideal para proteger identidades
- Procesamiento rápido
