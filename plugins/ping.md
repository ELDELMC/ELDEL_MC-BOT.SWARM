# 🏓 Comando PING

## Información General

**Comando:** `.ping`
**Aliases:** `p`, `pong`
**Categoría:** General
**Descripción:** Verifica la latencia (respuesta) del bot

---

## 👥 Permisos Requeridos

| Rol | Puede Ejecutar |
|-----|---|
| **Usuarios Comunes** | ✅ Sí |
| **Administradores del Grupo** | ✅ Sí |
| **Creador del Bot** | ✅ Sí |

---

## 📋 Funcionalidad Técnica

### Descripción Detallada
El comando `.ping` verifica la latencia del bot midiendo el tiempo que tarda en enviar una respuesta. Es útil para diagnosticar problemas de conexión o rendimiento.

### Cómo Funciona
1. Registra la hora actual en milisegundos (`Date.now()`)
2. Envía un mensaje inicial: "Calculando latencia..."
3. Calcula el tiempo transcurrido desde el envío
4. Edita el mensaje anterior con la latencia real
5. También incluye información sobre la sesión actual

### Archivos Afectados
- No modifica archivos (es solo una acción de envío y edición)

---

## 🔧 Uso

### Sintaxis
```
.ping
.p
.pong
```

### Ejemplos
```
.ping                ← Verifica la latencia
.p                   ← Alias corto
.pong                ← Alias alternativo
```

---

## 📊 Información Retornada

El comando responde con:
- **Latencia:** Tiempo en milisegundos (ms) que tardó el envío
- **Sesión Actual:** Número de sesión del bot (S1, S2, etc.)

Ejemplo de respuesta:
```
Pong!
Latencia: 245ms
Sesion: S1
```

---

## 📈 Cambios y Actualizaciones

### v1.0 - Versión Inicial
- Implementación del sistema de ping
- Medición de latencia en tiempo real
- Soporte para edición de mensajes
- Inclusión de información de sesión

---

## ℹ️ Información Adicional

- **Cooldown:** 3 segundos
- **Uso:** Disponible para todos los usuarios
- **Grupos y Privados:** Funciona en ambos
- **Latencia Normal:** 100-500ms dependiendo de la conexión a internet
