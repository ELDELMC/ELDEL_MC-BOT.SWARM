# 📢 Comando HIDETAG

## Información General

**Comando:** `.hidetag`
**Aliases:** `tagall`, `todos`, `everyone`
**Categoría:** Administración
**Descripción:** Menciona a todos los miembros del grupo en un mensaje

---

## 👥 Permisos Requeridos

| Rol | Puede Ejecutar |
|-----|---|
| **Usuarios Comunes** | ❌ No |
| **Administradores del Grupo** | ✅ Sí |
| **Creador del Bot** | ✅ Sí |

---

## 📋 Funcionalidad Técnica

### Descripción Detallada
El comando `.hidetag` permite a los administradores del grupo mencionar a todos los miembros del grupo en un solo mensaje. Las menciones se envían de forma "oculta" (sin que aparezcan visiblemente en el formato de mención directo).

### Cómo Funciona
1. Extrae el mensaje personalizado de los argumentos del comando
2. Si no hay mensaje, usa el texto predeterminado: "Atencion a todos!"
3. Obtiene los metadatos del grupo mediante `groupMetadata()`
4. Extrae la lista de **todos los participantes** del grupo
5. Envía el mensaje con menciones incluidas a través de las opciones de `sendMessage`

### Archivos Afectados
- No modifica archivos (es solo una acción de envío)

---

## 🔧 Uso

### Sintaxis
```
.hidetag [mensaje personalizado]
```

### Ejemplos
```
.hidetag             ← Menciona a todos con el mensaje predeterminado
.hidetag Atencion urgente! ← Menciona a todos con mensaje personalizado
.hidetag Reunion en 5 minutos ← Menciona a todos con otro mensaje
```

---

## 📋 Comportamiento

| Aspecto | Detalle |
|--------|--------|
| **Menciones Incluidas** | Todos los participantes del grupo (excepto casos especiales) |
| **Formato** | Las menciones se envían pero pueden no ser visibles en ciertos clientes |
| **Notificaciones** | Todos los miembros reciben notificación |
| **Mensaje** | Personalizable, con fallback a "Atencion a todos!" |

---

## ⚠️ Consideraciones Importantes

- Menciona a **TODOS** los miembros del grupo
- Puede causar spam de notificaciones en grupos grandes
- Ideal para anuncios urgentes o importantes
- Cooldown de 10 segundos (mayor que otros comandos)
- Requiere que el bot tenga permisos de admin en el grupo

---

## 📈 Cambios y Actualizaciones

### v1.0 - Versión Inicial
- Implementación del sistema de tagall
- Soporte para mensajes personalizados
- Extracción automática de participantes del grupo
