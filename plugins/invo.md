# 👥 Comando INVO

## Información General

**Comando:** `.invo`
**Categoría:** General/Utilidad
**Descripción:** Invita usuarios desde bases de datos del bot al grupo

---

## 👥 Permisos Requeridos

| Rol | Puede Ejecutar |
|-----|---|
| **Usuarios Comunes** | ✅ Sí (puede ver bases de datos) |
| **Administradores del Grupo** | ✅ Sí |
| **Creador del Bot** | ✅ Sí |

**Nota:** Aunque usuarios comunes pueden ejecutar el comando, solo administradores deberían invitar usuarios a grupos.

---

## 📋 Funcionalidad Técnica

### Descripción Detallada
El comando `.invo` permite invitar múltiples usuarios desde bases de datos almacenadas en el sistema. Las invitaciones se distribuyen entre sesiones activas para evitar sobrecargar una sola conexión.

### Cómo Funciona

#### 1. **Listar Bases de Datos** (Modo Lectura)
```
.invo
```
- Lee la carpeta `db/grupos_clonados/`
- Extrae archivos JSON
- Muestra índice con nombre de base, cantidad de números
- Formatea nombres reemplazando `_` por espacios

#### 2. **Iniciar Invitaciones** (Modo Ejecución)
```
.invo <número>
```
- Obtiene la base de datos seleccionada
- Lee la lista de números telefónicos
- Distribuye usuarios entre sesiones activas
- Ejecuta invitaciones en paralelo (50/50 entre sesiones)
- Espera intervals aleatorios (3-8 segundos) entre invitaciones para evitar baneo

### Proceso Técnico Detallado

1. **Obtención de Datos:**
   - Lee archivos JSON de `db/grupos_clonados/`
   - Calcula cantidad de números en cada base

2. **Normalización de Números:**
   - Extrae solo dígitos
   - Valida longitud (10-15 dígitos)
   - Convierte a formato WhatsApp: `{número}@s.whatsapp.net`

3. **Distribución entre Sesiones:**
   - Obtiene sesiones activas del LoadBalancer
   - Divide usuarios en chunks iguales
   - Cada sesión procesa su chunk en paralelo

4. **Invitaciones con Seguridad:**
   - Verifica miembros actuales del grupo
   - Evita duplicados (skip si está en grupo)
   - Ignora números inválidos
   - Espera 3-8 segundos entre intentos

5. **Reportes:**
   - Cuenta usuarios añadidos exitosamente
   - Registra fallos y razones
   - Identifica duplicados

### Archivos Afectados
- `db/grupos_clonados/*.json` - Bases de datos de números
- `CLONADOR/utils/clonador.js` - Importa ruta unificada DB_DIR

---

## 🔧 Uso

### Sintaxis
```
.invo                 ← Muestra lista de bases disponibles
.invo <número>        ← Inicia invitaciones desde base seleccionada
```

### Ejemplos
```
.invo                 ← Lista todas las bases de datos
.invo 1               ← Invita números de la base #1
.invo 2               ← Invita números de la base #2
```

---

## 📊 Estructura de Bases de Datos

**Ubicación:** `db/grupos_clonados/`
**Formato:** Archivos JSON

**Ejemplo: `caraota.json`**
```json
[
  "573001234567@s.whatsapp.net",
  "573009876543@s.whatsapp.net",
  "573015551234@s.whatsapp.net"
]
```

**Alternativa - Formato de Objeto:**
```json
{
  "user1": { "phone": "573001234567", "name": "Juan" },
  "user2": { "phone": "573009876543", "name": "María" }
}
```

---

## 💾 Proceso de Invitación

### Ejemplo de Respuesta
```
📋 Bases de Datos Disponibles:

1. caraota             (342 números)
2. general             (1,245 números)
3. panadería jane     (156 números)
4. the_group          (892 números)

Usa: .invo <número>
```

### Respuesta Durante Invitación
```
[S1] 573001234567 - ✅
[S2] 573009876543 - ✅
[S1] 573015551234 - ⏭️ Ya en grupo
[S2] 573021111111 - ❌ Número inválido

Resultado Final:
- Agregados: 45
- Fallidos: 3
- Duplicados: 5
```

---

## ⚠️ Consideraciones Importantes

- **Protección Contra Baneo:** Los intervals aleatorios (3-8 segundos) evitan que WhatsApp marque spam
- **Distribución de Carga:** Las sesiones trabajan en paralelo para acelerar el proceso
- **Validación:** Números inválidos se saltan automáticamente
- **Deduplicación:** No invita usuarios que ya están en el grupo
- **Base Unificada:** Usa la ruta constante `DB_DIR` desde `CLONADOR/utils/clonador.js`
- **Múltiples Sesiones:** Requiere al menos 1 sesión activa
- **Creación Automática:** Si la carpeta no existe, se crea automáticamente

---

## 📈 Cambios y Actualizaciones

### v1.0 - Versión Inicial
- Sistema básico de invitaciones
- Lectura de bases de datos
- Validación de números

### v1.1 - Mejoras de Estabilidad (2026-04-09 17:50)
**🤖 IA responsable:** Google Antigravity AI
- **Unificación de Rutas:** Se importa `DB_DIR` desde `CLONADOR/utils/clonador.js` para evitar inconsistencias
- **Robustez Mejorada:** Se agregó validación `fs.existsSync()` y `mkdirSync()` para prevenir errores `ENOENT` en Docker
- **Razonamiento:** Se detectó que el comando fallaba en entornos Pterodactyl aunque la ruta existiera
- **Solución:** El radar de SPY y el cargador de INVO ahora miran exactamente al mismo sitio
- **Multi-Sesión:** Implementación de distribución de tareas entre sesiones activas (50/50)

---

## 🔗 Relación con Otros Componentes

- **LoadBalancer** - Obtiene sesiones activas y fragmenta el trabajo
- **CLONADOR/utils/clonador.js** - Proporciona la ruta unificada `DB_DIR`
- **MessageHandler** - Integración con el flujo general de comandos
