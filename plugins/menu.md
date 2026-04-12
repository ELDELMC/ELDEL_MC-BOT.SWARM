# 📖 Comando MENU

## Información General

**Comando:** `.menu`
**Aliases:** `help`, `ayuda`, `comandos`
**Categoría:** General
**Descripción:** Muestra todos los comandos disponibles del bot organizados por categoría

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
El comando `.menu` genera un listado visual de todos los comandos disponibles en el bot, organizados por categorías (General, Administración, Moderación, Owner, Otros).

### Cómo Funciona
1. Obtiene todos los comandos del `CommandHandler`
2. Los agrupa por categoría
3. Ordena las categorías en un orden predefinido:
   - General
   - Administración
   - Moderación
   - Owner
   - Otros
4. Genera un mensaje formateado con:
   - Información del bot
   - Sesión actual
   - Prefijos disponibles
   - Número total de comandos
   - Listado de comandos por categoría con aliases
5. Envía el mensaje formateado

### Archivos Afectados
- No modifica archivos (es solo información)

---

## 🔧 Uso

### Sintaxis
```
.menu
.help
.ayuda
.comandos
```

### Ejemplos
```
.menu                ← Muestra el menú completo
.help                ← Alias en inglés
.ayuda               ← Alias en español
```

---

## 📊 Estructura de Respuesta

El menú muestra:

```
═══════════════════════════════════════
📖 MENU
  Bot: [Bot Name]
  Sesion: S1
  Prefijos: . !
  Comandos: 12

⭐───── GENERAL ────⭐
  .menu (help, ayuda) - Mostrar todos comandos
  .ping (p) - Verificar latencia del bot
  ...

⭐─ ADMINISTRACION ─⭐
  .ban (banear) - Banear usuario
  .kick (remove) - Expulsar usuario
  ...

═══════════════════════════════════════
```

---

## 📋 Categorías Soportadas

| Categoría | Descripción |
|-----------|-------------|
| **General** | Comandos para usuarios comunes |
| **Administración** | Comandos para admins del grupo |
| **Moderación** | Comandos de gestión |
| **Owner** | Comandos solo para creador del bot |
| **Otros** | Comandos sin categoría definida |

---

## 📈 Cambios y Actualizaciones

### v1.0 - Versión Inicial
- Implementación del menú de comandos
- Organización por categorías
- Formateo visual con decoradores
- Soporte para múltiples prefijos

---

## ℹ️ Información Adicional

- **Cooldown:** 5 segundos
- **Uso:** Disponible para todos los usuarios
- **Grupos y Privados:** Funciona en ambos
- **Comandos Dinámicos:** El menú se actualiza automáticamente cuando se agregan nuevos comandos
