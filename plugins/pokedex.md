# 🔴 Comando POKEDEX

## Información General

**Comando:** `.pokedex`
**Aliases:** `poke`, `pokemon`, `pokemon-stats`
**Categoría:** Información / Entretenimiento
**Descripción:** Obtener información de Pokémon

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
Comando que obtiene información completa de cualquier Pokémon incluyendo estadísticas, habilidades, tipos y movimientos. Soporta búsqueda por nombre o número de Pokédex.

### Cómo Funciona
1. Usuario proporciona nombre o número de Pokémon
2. Bot consulta PokéAPI
3. Obtiene estadísticas completas
4. Devuelve tarjeta con imagen, tipos, stats y habilidades

---

## 🔧 Uso

### Sintaxis
```
.pokedex <nombre>
.pokedex <número>
.poke <nombre>
```

### Ejemplos
```
.pokedex pikachu         ← Información de Pikachu
.pokedex 25              ← Pikachu por número
.poke charizard          ← Información de Charizard
.pokedex 6               ← Charizard por número
.pokedex mewtwo          ← Información de Mewtwo
```

### Respuesta del Bot
✅ **Éxito:**
```
⚡ POKÉDEX - PIKACHU

🆔 Número: #25
🎯 Tipo: Eléctrico
📊 Generación: I (Kanto)

📈 Estadísticas:
  • HP: 35
  • Ataque: 55
  • Defensa: 40
  • Esp. Ataque: 50
  • Esp. Defensa: 50
  • Velocidad: 90

⚡ Habilidades:
  • Estática (Natural)
  • Pararayo (Oculta)

🔄 Evolución: Ratattatak (nivel 36)

[Imagen de Pikachu]
```

❌ **Error:**
```
❌ Pokémon no encontrado: "asdasd"
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
| **API Externa** | PokéAPI (pokeapi.co) |
| **Requiere API Key** | No |

---

## 🔗 Dependencias

- `axios` - Para llamadas HTTP a API
- `Formatter.js` - Formateo de respuestas

---

## 🔴 Pokémon Soportados

- ✅ Todas las generaciones (I-IX)
- ✅ ~1025 Pokémon diferentes
- ✅ Formas alternativas
- ✅ Pokémon regionales
- ✅ Mega Evolutions
- ✅ Dinamax

---

## 📊 Información Mostrada

```json
{
  "id": 25,
  "name": "pikachu",
  "types": ["electric"],
  "stats": {
    "hp": 35,
    "attack": 55,
    "defense": 40,
    "sp_atk": 50,
    "sp_def": 50,
    "speed": 90
  },
  "abilities": ["static", "lightning-rod"],
  "image": "https://raw.githubusercontent.com/PokeAPI...",
  "evolution": "raichu"
}
```

---

## 🎮 Estadísticas Incluidas

- HP (Puntos de Salud)
- Ataque
- Defensa
- Ataque Especial
- Defensa Especial
- Velocidad

---

## 🏆 Características Especiales

- Soporta búsqueda por nombre español e inglés
- Reconoce números de Pokédex
- Muestra habilidades naturales y ocultas
- Información de evoluciones
- Datos de tipos y debilidades
- Imagen oficial de Pokémon

---

## 📝 Notas Adicionales

- Base de datos completa de todos los Pokémon
- API pública y gratuita
- Datos precisos y actualizados
- Perfecto para fans de Pokémon
- Información de todos los juegos
- Sin límites de búsquedas
