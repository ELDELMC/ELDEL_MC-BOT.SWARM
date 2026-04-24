# 👤 Comando OWNER

## Información General

**Comando:** `.owner`
**Aliases:** `creator`
**Categoría:** Información
**Descripción:** Obtener contacto del propietario del bot

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
El comando `.owner` envía el contacto del propietario del bot en la forma de una tarjeta de contacto de WhatsApp (vCard). Esto permite a los usuarios contactar directamente al owner.

### Cómo Funciona
1. Obtiene información del propietario desde `config.js`
2. Crea una tarjeta vCard estándar de WhatsApp
3. Envía el contacto como mensaje de WhatsApp
4. El usuario puede guardar el contacto directamente

### Archivos Afectados
- `config.js` - Información del propietario (botOwner, ownerNumber)

---

## 🔧 Uso

### Sintaxis
```
.owner
```

### Ejemplos
```
.owner              ← Envía contacto del propietario
```

### Respuesta del Bot
✅ **Éxito:**
Envía una tarjeta de contacto vCard con el número del propietario

❌ **Error:**
```
❌ Failed to fetch owner contact.
```

---

## ⚙️ Configuración Técnica

| Propiedad | Valor |
|-----------|-------|
| **Cooldown** | No especificado |
| **Group Only** | No |
| **Admin Only** | No |
| **Owner Only** | No |
| **Requiere DB** | No |

---

## 🔗 Dependencias

- `config.js` - Configuración del bot (botOwner, ownerNumber)

---

## 📊 Estructura de Datos

Usa información de config:
```javascript
{
    botOwner: "Nombre del Propietario",
    ownerNumber: "XXXXXXXXXXXXX"
}
```

---

## 📝 Notas Adicionales

- Muy útil para que usuarios contacten al propietario
- Envía tarjeta vCard estándar (compatible con todos los clientes WhatsApp)
- Sin cooldown, se puede usar libremente
- Información sensible - asegura que ownerNumber sea correcto
