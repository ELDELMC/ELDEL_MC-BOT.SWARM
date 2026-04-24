# 📲 Comando ORDER

## Información General

**Comando:** `.order`
**Categoría:** Utilidad
**Descripción:** Activa modo de recolección de números en tiempo real

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
El comando `.order` activa un modo especial donde el bot automáticamente extrae y guarda números de WhatsApp que el usuario envía en los mensajes. Los números se validan y se almacenan en `db/grupos_clonados/recupera2.json`.

### Cómo Funciona

#### Activación del Modo
```
.order
```
- Define al usuario como "en modo ORDER"
- Activa el procesamiento automático de números
- Establece timeout de 5 minutos sin actividad
- Responde con confirmación

#### Procesamiento Automático
Mientras esté en modo ORDER:
- **Cada mensaje** que escriba el usuario se analiza automáticamente
- Se extraen números telefónicos (formatos diversos)
- Se validan números (9-15 dígitos)
- Se evitan duplicados
- Se guardan en `db/grupos_clonados/recupera2.json`

#### Desactivación
- Automática: Después de 5 minutos sin enviar mensajes
- Manual: Ejecutar `.order` nuevamente para toggle
- Se notifica al usuario cuando se alcanza timeout

### Régex de Extracción de Números

El comando reconoce formatos como:
- `+506 7101 3229`
- `+51 907 749 476`
- `+54 9 3525 61-6630`
- `573001234567`
- Números con espacios, guiones, paréntesis

### Archivos Afectados
- `db/grupos_clonados/recupera2.json` - Almacena números recolectados

---

## 🔧 Uso

### Sintaxis
```
.order                  ← Activa/desactiva modo ORDER
```

### Flujo Típico

**Paso 1: Activar**
```
Usuario: .order
Bot: 📡 Modo ORDER activado ✓
     Esperando textos con números 📲
     (5 min de timeout o envía .order para apagar)
```

**Paso 2: Enviar textos con números**
```
Usuario: Estos son los números: +506 7101 3229 y +51 907 749 476

Bot: ✅ 2 nuevos números guardados
```

**Paso 3: Apagar (opcional)**
```
Usuario: .order
Bot: 📴 Modo ORDER desactivado.
```

### Soporte para Respuestas (Reply)

Puedes responder a un mensaje con números usando `.order`:
```
(responder a un mensaje que contiene números)
.order

Bot: ✅ Se extrajeron X números del mensaje citado
```

---

## 💾 Almacenamiento de Datos

**Archivo:** `db/grupos_clonados/recupera2.json`
**Formato:** Array de JIDs

```json
[
  "573001234567@s.whatsapp.net",
  "573009876543@s.whatsapp.net",
  "573015551234@s.whatsapp.net"
]
```

---

## 📊 Ejemplo de Uso Completo

```
Usuario: .order
Bot: 📡 Modo ORDER activado ✓

Usuario: Tengo estos contactos:
         +506 7101 3229
         +51 907 749 476
         +54 9 3525 6165
Bot: ✅ 3 nuevos números guardados en recupera2

Usuario: Más números:
         +506 7101 7890
         +506 7101 3229 (este ya existe)
Bot: ✅ 1 nuevo, 1 duplicado

(Usuario inactivo por 5 minutos)
Bot: ⏰ [Timeout] 42 números procesados
```

---

## ⚠️ Consideraciones Importantes

- **Timeout Automático:** 5 minutos sin enviar mensajes desactiva el modo
- **Análisis Automático:** CADA mensaje mientras esté activo se procesa
- **Deduplicación:** No guarda números que ya existen en recupera2
- **Validación:** Solo acepta números con 9-15 dígitos
- **Privado y Grupo:** Funciona en ambos entornos
- **Estadísticas:** Registra cuántos números procesó cada usuario
- **Limpieza de Memoria:** Los usuarios inactivos se limpian cada 30 segundos
- **Cooldown:** 2 segundos entre activaciones

---

## 📈 Cambios y Actualizaciones

### v1.0 - Versión Inicial
- Implementación del modo ORDER
- Extracción de números con regex
- Almacenamiento en recupera2.json
- Sistema de timeout de 5 minutos
- Limpieza automática de usuarios inactivos

### v1.1 - Soporte para Replies (2026-04-09 16:00)
**🤖 IA responsable:** Google Antigravity AI
- Capacidad de analizar mensajes citados con `.order`
- Mejor manejo de contexto en replies
- Independencia de estado de ORDER para procesar replies
- **Implementación de Load Balancing:** Distribución de tareas entre sesiones (50/50 por hash de ID de mensaje)

---

## 🔗 Relación con Otros Componentes

- **MessageHandler** - Llama a `processOrderModeMessage()` para cada mensaje cuando user está en modo ORDER
- **SharedData** - Lee/escribe en `db/grupos_clonados/recupera2.json`
- **Logger** - Registra eventos y errores

---

## 💡 Casos de Uso

1. **Recolección de Contactos:** Copiar contactos de documentos, redes sociales, etc.
2. **Migración de Números:** Pasar números de un grupo a otro
3. **Compilación de Listas:** Crear bases de datos de contactos desde conversaciones
4. **Recuperación:** Recuperar números de grupos clonados
