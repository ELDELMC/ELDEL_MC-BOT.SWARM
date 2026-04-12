# ✅ INSTALACIÓN Y VERIFICACIÓN - COMANDO .INVO

## 📦 ¿Qué se instaló?

Se ha creado el comando `.invo` que permite agregar masivamente usuarios a grupos con intervalos aleatorios para evitar baneo de WhatsApp.

**Archivos creados:**
- ✅ `plugins/invo.js` - Comando principal
- ✅ `README_INVO.md` - Guía rápida
- ✅ `INVO_GUIDE.md` - Manual completo
- ✅ `INVO_TECHNICAL.md` - Documentación técnica
- ✅ `INVO_DATABASE_EXAMPLES.md` - Ejemplos de bases
- ✅ `ANTI_BAN_GUIDE.md` - Mejores prácticas
- ✅ `INSTALLATION_VERIFICATION.md` - Este archivo

---

## 🚀 Verificación

### Paso 1: Reinicia el bot
```bash
# Si está corriendo, detén con Ctrl+C
# Luego reinicia
npm start
```

### Paso 2: Verifica que cargó el comando
```
En el grupo, escribe: .menu
```

**Deberías ver:**
```
✓ invitar (aliases: invite, invitar, agregar) - Invitar usuarios...
```

O escribe:
```
.help invo
```

### Paso 3: Verifica que la carpeta de bases existe
```bash
# Debería tener estos archivos:
db/grupos_clonados/
├── caraota.json
├── general.json
├── los_del_flow_______.json
├── panadería_jane_doe.json
├── the_group.json
└── ... (más bases)
```

### Paso 4: Test en un grupo
```
En el grupo (DEBES ser ADMIN):
.invo
```

**Respuesta esperada:**
```
═══ INVITATION MANAGER ═══

📊 Bases Disponibles:

1️⃣ caraota - 150 usuarios
2️⃣ general - 320 usuarios
...

💡 Uso:
  .invo 1 - Agregar desde primera base
  .invo 2 - Agregar desde segunda base
```

Si ves esto → ✅ **FUNCIONA**

---

## 🔧 Configuración (Opcional)

El comando usa configuración predeterminada:
- **Intervalo mínimo:** 3 segundos
- **Intervalo máximo:** 8 segundos
- **Requisito:** Admin del grupo + grupo

Para personalizar, edita `plugins/invo.js`:

```javascript
function getRandomInterval() {
    // Cambiar estos valores:
    // Mínimo: 3000 ms (3 segundos)
    // Máximo: 8000 ms (8 segundos)
    return Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;
}
```

**Ejemplos de cambios:**
```javascript
// Para ir más lento (más seguro):
return Math.floor(Math.random() * (12000 - 5000 + 1)) + 5000; // 5-12 seg

// Para ir más rápido (más riesgo):
return Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000; // 2-5 seg

// Intervalo fijo (no recomendado):
return 5000; // Siempre 5 segundos
```

---

## 📝 Próximos pasos

1. **Lectura recomendada:**
   - [README_INVO.md](README_INVO.md) - Resumen rápido
   - [INVO_GUIDE.md](INVO_GUIDE.md) - Guía completa
   - [ANTI_BAN_GUIDE.md](ANTI_BAN_GUIDE.md) - Seguridad

2. **Preparar bases de datos:**
   - Crear archivos `.json` en `db/grupos_clonados/`
   - Usar formatos de [INVO_DATABASE_EXAMPLES.md](INVO_DATABASE_EXAMPLES.md)
   - Validar que números sean válidos

3. **Primer uso:**
   - Usar en grupo pequeño primero
   - Probar con pocos usuarios (10-20)
   - Observar resultados
   - Luego escalar a bases más grandes

---

## 🆘 Troubleshooting

### El comando no aparece en `.menu`

**Causa:** Bot no se reinició después de crear el archivo

**Solución:**
```bash
# Detén el bot (Ctrl+C)
# Reinicia
npm start

# Espera a que cargue los comandos
# Deberías ver: "Loaded X commands from Y plugin files"
```

### Comando carga pero da error

**Verifica:**
1. ¿Estás en un grupo? → Sí = ✓
2. ¿Eres admin? → Sí = ✓
3. ¿El bot es admin? → Sí = ✓
4. ¿Hay bases en `db/grupos_clonados/`? → Sí = ✓

Si todo es sí, ejecuta:
```
.invo
```

### Mensajes de error comunes

| Error | Causas posibles | Solución |
|-------|-----------------|----------|
| "No hay bases de datos" | Carpeta vacía o mal ubicada | Agrega JSON en `db/grupos_clonados/` |
| "Número inválido" | Argumento no es número | Usa `.invo 1` (solo número) |
| "Base está vacía" | JSON sin usuarios | Agrega números al archivo |
| "No eres admin" | Usuario sin permisos | Solo admins pueden usar |
| "Solo en grupos" | Usado en privado | Usa en un grupo |

---

## 📊 Status Check

Ejecuta estos comandos para verificar:

```bash
# Ver todos los comandos
.menu

# Ver información del bot
.info

# Verificar latencia
.ping

# Ver la sesión actual
# Tu mensaje debería mostrar qué sesión respondió
```

---

## 🎯 Primeros pasos recomendados

### 1. Prueba rápida (5 minutos)
```
.invo
→ Lee el menú
.invo 1
→ Ve el mensaje de confirmación
```

### 2. Creación de base de prueba (10 minutos)
```
1. Crea archivo: db/grupos_clonados/test_invo.json
2. Contenido:
   ["573001234567", "573009876543", "573015555666"]
3. Guarda y espera 5 segundos
4. Ejecuta .invo nuevamente
5. Deberías ver tu nueva base en el menú
```

### 3. Primer invitación real (30+ minutos)
```
1. Selecciona grupo destino
2. Eres admin? ✓
3. Ejecuta: .invo 1 si
4. Observa el proceso
5. Lee el reporte final
```

---

## ⚠️ Warnings y Precauciones

1. **No pruebes en grupos importantes** hasta estar seguro
2. **Empieza con pocos usuarios** (10-50)
3. **Lee [ANTI_BAN_GUIDE.md](ANTI_BAN_GUIDE.md) completamente**
4. **No ejecutes en múltiples grupos simultáneamente** si es primera vez
5. **Monitorea después de ejecutar** - Revisa que todo esté bien

---

## 🔍 Verificación Final

✅ **Checklist de instalación exitosa:**

- [ ] Archivo `plugins/invo.js` existe
- [ ] Bot se reinició correctamente
- [ ] `.menu` muestra el comando "invitar"
- [ ] `.invo` en un grupo muestra menú
- [ ] Carpeta `db/grupos_clonados/` es accesible
- [ ] Puedes ver at least una base de datos
- [ ] Documentación está en la carpeta raíz

Si todos están marcados → ✅ **INSTALACIÓN EXITOSA**

---

## 🚀 Ready to Go!

Estás listo para usar el comando `.invo`. 

**Recomendación:**
1. Lee [README_INVO.md](README_INVO.md) (5 min)
2. Lee [ANTI_BAN_GUIDE.md](ANTI_BAN_GUIDE.md) (10 min)
3. Prepara tus bases de datos
4. ¡Comienza!

---

**Fecha de instalación:** 2024-04-08  
**Versión:** 1.0  
**Estado:** ✅ PRODUCTIVO

Para preguntas o problemas, consulta la documentación en la carpeta raíz del proyecto.
