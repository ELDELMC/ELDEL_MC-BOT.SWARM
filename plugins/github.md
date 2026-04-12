# 🐙 Comando GITHUB

## Información General

**Comando:** `.github`
**Aliases:** `git`, `github-user`, `gh-profile`
**Categoría:** Información / Desarrollo
**Descripción:** Obtener información de perfiles de GitHub

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
Comando que obtiene información de perfiles de GitHub incluyendo bio, repositorios, estadísticas de contribuciones y enlaces a proyectos.

### Cómo Funciona
1. Usuario proporciona nombre de usuario de GitHub
2. Bot consulta API de GitHub
3. Obtiene datos completos del perfil
4. Devuelve información formateada con enlace al perfil

---

## 🔧 Uso

### Sintaxis
```
.github <usuario>
```

### Ejemplos
```
.github torvalds              ← Perfil de Linus Torvalds
.github gvanrossum           ← Perfil del creador de Python
.github octocat               ← Usuario de prueba de GitHub
```

### Respuesta del Bot
✅ **Éxito:**
```
🐙 GITHUB PROFILE - TORVALDS

👤 Nombre: Linus Torvalds
📝 Bio: Linux creator
📍 Ubicación: Portland, OR

📊 Estadísticas:
  • Repositorios Públicos: 42
  • Seguidores: 180k
  • Siguiendo: 5
  • Contribuciones (este año): 1,250

🔗 https://github.com/torvalds
📅 Miembro desde: 2011
```

❌ **Error:**
```
❌ Usuario de GitHub no encontrado: "asdasdasd"
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
| **API Externa** | GitHub API v3 |
| **Requiere API Key** | Opcional (mejor con token para más límites) |

---

## 🔗 Dependencias

- `axios` - Para llamadas HTTP a API
- `Formatter.js` - Formateo de respuestas

---

## 📊 Información Mostrada

```json
{
  "login": "torvalds",
  "name": "Linus Torvalds",
  "bio": "Linux creator",
  "location": "Portland, OR",
  "public_repos": 42,
  "followers": 180000,
  "following": 5,
  "created_at": "2011-08-04",
  "updated_at": "2024-01-15",
  "profile_url": "https://github.com/torvalds"
}
```

---

## 📈 Datos Incluidos

- Nombre completo y usuario
- Descripción / Bio
- Ubicación
- Número de repositorios públicos
- Contadores de seguidores y siguiendo
- Año de creación de cuenta
- Enlace directo al perfil

---

## 📝 Notas Adicionales

- Funciona con cualquier usuario público de GitHub
- Sin autenticación requerida (pero limitado a 60 req/hora)
- Con token GitHub: 5000 req/hora
- Ideal para developers y comunidad tech
- Perfecto para compartir perfiles interesantes
- Información siempre actualizada
