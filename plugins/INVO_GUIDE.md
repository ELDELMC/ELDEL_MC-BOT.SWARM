# 📖 COMANDO INVO - GUÍA COMPLETA

## ¿Qué es?
El comando `.invo` permite agregar usuarios masivamente a un grupo de WhatsApp desde bases de datos guardadas en `db/grupos_clonados/`.

---

## 📋 Requisitos
- ✅ Solo **administradores del grupo** pueden usar este comando
- ✅ Debe escribirse en un **grupo** (no en privado)
- ✅ Las bases de datos deben existir en `db/grupos_clonados/`
- ✅ Ambas sesiones (bots) pueden usarlo

---

## 🚀 USO

### 1️⃣ Ver bases de datos disponibles
```
.invo
```
Muestra un menú con todas las bases de datos disponibles y la cantidad de usuarios en cada una.

**Ejemplo de respuesta:**
```
═══ INVITATION MANAGER ═══

📊 Bases Disponibles:

1️⃣ caraota - 150 usuarios
2️⃣ general - 320 usuarios
3️⃣ los del flow - 89 usuarios
4️⃣ panadería jane doe - 45 usuarios
5️⃣ the group - 200 usuarios

─────────────────────────
Total de usuarios: 804

💡 Uso:
  .invo 1 - Agregar desde primera base
  .invo 2 - Agregar desde segunda base
  etc...

⚠️ Nota: Los intervalos son aleatorios (3-8s) para evitar baneo.
```

---

### 2️⃣ Seleccionar una base de datos y confirmar
```
.invo 1
```
Muestra un mensaje de confirmación con la información de la base seleccionada.

**Ejemplo de respuesta:**
```
╔══ ⚠️ CONFIRMACIÓN ══╗

✓ Base seleccionada: caraota
✓ Usuarios a agregar: 150
✓ Intervalo: 3-8 segundos (aleatorio)

Uso:
  .invo 1 si - Confirmar y comenzar
  .invo - Ver bases nuevamente
```

---

### 3️⃣ Confirmar e iniciar el proceso
```
.invo 1 si
```
Inicia el proceso de agregar todos los usuarios de la base seleccionada.

**Ejemplo de respuesta:**
```
╔══ 🚀 INICIANDO INVITACIÓN ══╗

✓ Base: caraota
✓ Total: 150 usuarios
✓ Intervalo: 3-8 segundos (aleatorio)

⏳ Proceso iniciado. Esto puede tomar varios minutos...
```

Después de completar:
```
╔══ 📊 RESULTADO FINAL ══╗

✅ Agregados: 142
❌ Errores: 3
⏭️  Ya en grupo: 5
```

---

## 🛡️ Protecciones contra baneo

El comando implementa varias protecciones:

| Protección | Descripción |
|-----------|-------------|
| **Intervalos aleatorios** | Espera entre 3-8 segundos entre cada invitación |
| **Validación de números** | Solo acepta números de 10-15 dígitos válidos |
| **Evita duplicados** | No agrega usuarios que ya están en el grupo |
| **Manejo de errores** | Si un número no existe, sigue con el siguiente |

---

## 🗂️ Estructura de bases de datos

Las bases de datos pueden estar en dos formatos:

### Formato Array (recomendado)
```json
[
  "573001234567@s.whatsapp.net",
  "573009876543@s.whatsapp.net",
  "584245583273@s.whatsapp.net"
]
```

### Formato Object
```json
{
  "user_1": "573001234567",
  "user_2": "573009876543",
  "user_3": "584245583273"
}
```

O con propiedades:
```json
{
  "user_1": {
    "name": "Juan",
    "phone": "573001234567"
  },
  "user_2": {
    "name": "Maria",
    "number": "573009876543"
  }
}
```

---

## ⚙️ Cómo agregar números a una base de datos

1. **Accede a la carpeta** `db/grupos_clonados/`
2. **Abre o crea** un archivo `.json`
3. **Agrega los números** en uno de los formatos anteriores
4. **Guarda el archivo**

Ejemplo: `db/grupos_clonados/nuevos_usuarios.json`
```json
[
  "573001234567@s.whatsapp.net",
  "573009876543@s.whatsapp.net"
]
```

---

## ⚠️ Consideraciones importantes

1. **Tiempo de ejecución**: El proceso puede tomar mucho tiempo
   - 150 usuarios × 5 segundos promedio = 12 minutos aprox.
   - 1000 usuarios = 80 minutos aprox.

2. **Baneo de WhatsApp**: Los intervalos aleatorios ayudan a evitar baneo, pero:
   - No agregar más de 200-300 usuarios por día
   - Espaciar las invitaciones en diferentes horas
   - No hacer múltiples procesos simultáneamente

3. **Acceso**: Solo administradores pueden ejecutar el comando

4. **Ambas sesiones**: Podem usar el comando en ambas sesiones simultáneamente en diferentes grupos

---

## 📝 Ejemplos completos

### Ejemplo 1: Agregar 50 usuarios rápidamente
```
.invo
→ Ver que hay 50 usuarios en "general"
.invo 2
→ Confirmar la selección
.invo 2 si
→ Inicia el proceso
```

### Ejemplo 2: Cambiar de base a mitad del proceso
```
.invo
→ Ver bases disponibles
.invo 1 si
→ Inicia proceso en "caraota"
(después que termine)
.invo 3 si
→ Inicia proceso en "los del flow"
```

---

## 🐛 Solución de problemas

| Problema | Solución |
|----------|----------|
| "Número inválido" | Verifica que la base tenga números en formato correcto |
| "La base de datos está vacía" | Agrega números a la base de datos |
| "Error: jid does not exist" | El número no existe en WhatsApp (contabilizado) |
| No aparece en el menú | El archivo no está en `db/grupos_clonados/` o no es .json |

---

## 📊 Estado del comando

```
Comando: .invo
Aliases: invite, invitar, agregar
Categoría: admin
Requisito: Grupo + Admin
Cool-down: 5 segundos
Estado: ✅ FUNCIONAL
```
