# ✅ Comando UNBAN

## Información General

**Comando:** `.unban`
**Aliases:** `desbanear`, `unblock`
**Categoría:** Administración
**Descripción:** Desbanea a un usuario del bot, permitiéndole usar los comandos nuevamente

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
El comando `.unban` permite a los administradores del grupo remover a un usuario de la lista de baneados, permitiéndole usar los comandos del bot nuevamente.

### Cómo Funciona
1. Extrae el JID del usuario a desbanear desde:
   - Un usuario mencionado con `@`
   - El usuario del que se está respondiendo (reply)
2. Busca el JID en `db/banned.json`
3. Elimina el JID de la lista si existe
4. Envía confirmación del desbaneo

### Archivos Afectados
- `db/banned.json` - Base de datos de usuarios baneados

---

## 🔧 Uso

### Sintaxis
```
.unban @usuario
```

### Ejemplos
```
.unban @Juan         ← Desbanea al usuario Juan
.unban @Maria        ← Desbanea a María

(responder a un mensaje)
.unban               ← Desbanea al autor del mensaje citado
```

---

## 💾 Almacenamiento de Datos

**Archivo:** `db/banned.json`
**Formato:** Array de JIDs (el usuario se elimina de esta lista)

---

## 📈 Cambios y Actualizaciones

### v1.0 - Versión Inicial
- Implementación del sistema de desbaneo
- Soporte para menciones individuales
- Validación correcta de usuarios existentes en la lista

---

## 🔗 Relación con Otros Comandos

- **ban.js** - Necesario leer primero para entender el sistema de baneo
- Trabaja con la misma base de datos: `db/banned.json`
