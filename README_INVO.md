# 🤖 COMANDO .INVO - INVITACIONES MASIVAS

## 🎯 ¿Qué es?
Comando para agregar automáticamente cientos de usuarios a grupos de WhatsApp usando bases de datos guardadas localmente, con **intervalos aleatorios para evitar baneo**.

---

## ⚡ Uso rápido
```
.invo                    # Ver bases disponibles
.invo 1                  # Seleccionar base 1
.invo 1 si               # Confirmar e iniciar
```

---

## 📊 Features

✅ **Intervalos variables (3-8 seg)** para evitar detección  
✅ **Múltiples formatos de base de datos** soportados  
✅ **Validación de números** (solo números válidos)  
✅ **Evita duplicados** automáticamente  
✅ **Manejo de errores** sin interrumpir el proceso  
✅ **Reporte final** con estadísticas  
✅ **Funciona en ambas sesiones** simultáneamente  

---

## 📁 Dónde están las bases?
```
db/
└── grupos_clonados/
    ├── caraota.json
    ├── general.json
    ├── los_del_flow_______.json
    ├── panadería_jane_doe.json
    ├── the_group.json
    └── ...
```

---

## 📖 Documentación

- **[INVO_GUIDE.md](INVO_GUIDE.md)** ← Guía completa de usuario
- **[INVO_TECHNICAL.md](INVO_TECHNICAL.md)** ← Documentación técnica
- **[INVO_DATABASE_EXAMPLES.md](INVO_DATABASE_EXAMPLES.md)** ← Cómo estructurar bases

---

## 🚨 IMPORTANTE

1. **Solo grupo + admin**: Necesitas permisos de administrador
2. **Tiempo variable**: 150 usuarios ≈ 12-15 minutos
3. **Anti-baneo**: Los intervalos aleatorios previenen bloqueos
4. **Máximo recomendado**: 200-300 usuarios/día por sesión

---

## 💡 Ejemplos

### Ejemplo 1: Ver bases disponibles
```
.invo
```
**Respuesta:**
```
═══ INVITATION MANAGER ═══
📊 Bases Disponibles:
1️⃣ caraota - 150 usuarios
2️⃣ general - 320 usuarios
3️⃣ los del flow - 89 usuarios
...
```

### Ejemplo 2: Agregar desde base 1
```
.invo 1 si
```
**Respuesta:**
```
🚀 INICIANDO INVITACIÓN
Base: caraota
Total: 150 usuarios
Intervalo: 3-8 segundos (aleatorio)
⏳ Proceso iniciado...
```

Después:
```
📊 RESULTADO FINAL
✅ Agregados: 142
❌ Errores: 3
⏭️ Ya en grupo: 5
```

---

## 🔧 Estructura de bases de datos

### Formato simple (recomendado)
```json
[
  "573001234567",
  "573009876543",
  "584245583273"
]
```

### Formato con detalles
```json
{
  "usuario_1": {
    "phone": "573001234567",
    "name": "Juan"
  },
  "usuario_2": {
    "phone": "573009876543"
  }
}
```

Ver [INVO_DATABASE_EXAMPLES.md](INVO_DATABASE_EXAMPLES.md) para más ejemplos.

---

## ⏱️ Estimación de tiempo

| Usuarios | Tiempo aprox |
|----------|--------------|
| 50       | 4 min        |
| 150      | 13 min       |
| 300      | 27 min       |
| 500      | 45 min       |

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| "Número inválido" | Verifica formato: `573001234567` |
| "Base está vacía" | Agrega números al JSON |
| No aparece en menú | Archivo no está en `db/grupos_clonados/` |
| Solo en privado | Comando solo funciona en grupos |
| "No eres admin" | Necesitas permisos de admin |

---

## 📝 Comandos relacionados

```
.invo                    # Comando principal
.menu                    # Ver todos los comandos
.help                    # Ayuda general
```

---

## 🔐 Permisos requeridos

- ✅ Grupo (no privado)
- ✅ Admin del grupo
- ✅ Bot con permisos de admin

---

**Creado:** 2024-04-08  
**Estado:** ✅ FUNCIONAL  
**Autor:** Sistema de Bots JUANCHOTE-SWARM
