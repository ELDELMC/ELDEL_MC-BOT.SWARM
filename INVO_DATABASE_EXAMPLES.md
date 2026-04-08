# 📚 Ejemplos de Bases de Datos para el Comando INVO

Aquí encontrarás ejemplos de cómo estructurar tus bases de datos en `db/grupos_clonados/` para usarlas con el comando `.invo`.

---

## ✅ Formato 1: Array Simple (RECOMENDADO)

La forma más simple y eficiente. Solo una lista de números.

**Archivo:** `db/grupos_clonados/mi_grupo.json`
```json
[
  "573001234567@s.whatsapp.net",
  "573009876543@s.whatsapp.net",
  "573015555666@s.whatsapp.net",
  "573021111222@s.whatsapp.net",
  "573037777888@s.whatsapp.net",
  "584245583273@s.whatsapp.net",
  "584109999000@s.whatsapp.net"
]
```

**Ventajas:**
- ✅ Simple y limpio
- ✅ Fácil de agregar números manualmente
- ✅ Bajo consumo de espacio
- ✅ Máxima compatibilidad

---

## ✅ Formato 2: Array sin @s.whatsapp.net

El comando normalizará automáticamente los números sin el sufijo.

**Archivo:** `db/grupos_clonados/colegas.json`
```json
[
  "573001234567",
  "573009876543",
  "573015555666",
  "573021111222",
  "584245583273"
]
```

---

## ✅ Formato 3: Objeto con números

Útil si quieres asociar IDs a cada número.

**Archivo:** `db/grupos_clonados/clientes.json`
```json
{
  "cliente_001": "573001234567",
  "cliente_002": "573009876543",
  "cliente_003": "573015555666",
  "cliente_004": "573021111222",
  "cliente_005": "584245583273",
  "cliente_006": "584109999000"
}
```

---

## ✅ Formato 4: Objeto con objetos (Propiedades)

Ideal si quieres guardar información adicional de cada usuario.

**Archivo:** `db/grupos_clonados/equipo.json`
```json
{
  "juan": {
    "phone": "573001234567",
    "name": "Juan Pérez",
    "role": "Administrador"
  },
  "maria": {
    "phone": "573009876543",
    "name": "María García",
    "role": "Editor"
  },
  "carlos": {
    "phone": "573015555666",
    "name": "Carlos López",
    "role": "Miembro"
  },
  "sofia": {
    "number": "573021111222",
    "name": "Sofía Martínez",
    "date_added": "2024-01-15"
  }
}
```

**Nota:** El comando busca automáticamente las propiedades `phone` o `number`.

---

## ✅ Formato 5: Array Mixto

Combinar strings simples con el sufijo completo.

**Archivo:** `db/grupos_clonados/contactos_mixtos.json`
```json
[
  "573001234567@s.whatsapp.net",
  "573009876543",
  "573015555666@s.whatsapp.net",
  "573021111222",
  "584245583273@s.whatsapp.net"
]
```

El comando automáticamente normalizará todos a `@s.whatsapp.net`.

---

## 🔴 Formatos NO Soportados (❌ Evitar)

### ❌ Inválido: Números de diferentes países sin indicativo
```json
[
  "1234567",          // ← MUY CORTO
  "9876543210",       // ← Falta indicativo de país
  "12345678901234567" // ← MUY LARGO
]
```

### ❌ Inválido: Caracteres especiales sin limpiar
```json
[
  "+57 300 123 4567",     // ← No se puede, espacios y +
  "(573) 001-234-567",    // ← Símbolos especiales
  "57-300-123-4567"       // ← Guiones
]
```
**Solución:** Quitar todo excepto números: `573001234567`

### ❌ Inválido: JID sin número
```json
[
  "@s.whatsapp.net",
  "573001234567@g.us"  // ← Es formato grupo, no usuario
]
```

---

## 📝 Cómo crear una nueva base de datos

### Paso 1: Abrir editor de texto
- VS Code
- Notepad
- Cualquier editor que soporte JSON

### Paso 2: Escribir en formato JSON
```json
[
  "valor1",
  "valor2",
  "valor3"
]
```

### Paso 3: Guardar como JSON
- Ubicación: `db/grupos_clonados/`
- Nombre: Lo que quieras (ej: `mis_numeros.json`)
- Extensión: **DEBE ser `.json`**

### Paso 4: Probar en el comando
```
.invo
```
Verifica que tu nueva base aparezca en la lista.

---

## 🎯 Ejemplos de uso real

### Ejemplo 1: Base pequeña para pruebas
**Archivo:** `db/grupos_clonados/test.json`
```json
[
  "573001234567",
  "573009876543",
  "573015555666"
]
```

### Ejemplo 2: Lista de clientes
**Archivo:** `db/grupos_clonados/clientes_2024.json`
```json
[
  "573001111111",
  "573002222222",
  "573003333333",
  "573004444444",
  "573005555555",
  "573006666666",
  "573007777777",
  "573008888888"
]
```

### Ejemplo 3: Equipo de trabajo
**Archivo:** `db/grupos_clonados/equipo_ventas.json`
```json
{
  "gerente": {
    "phone": "573001234567",
    "name": "Director de Ventas"
  },
  "vendedor_1": {
    "phone": "573009876543",
    "name": "Vendedor 1"
  },
  "vendedor_2": {
    "phone": "573015555666",
    "name": "Vendedor 2"
  },
  "soporte": {
    "phone": "573021111222",
    "name": "Soporte Técnico"
  }
}
```

---

## 🔧 Validación de formato

Para verificar que tu JSON es válido:

1. **Opción 1:** Usar validador online
   - Visita: [jsonlint.com](https://www.jsonlint.com)
   - Pega tu contenido
   - Si da error, hay un problema en el formato

2. **Opción 2:** Usar VS Code
   - Abre el archivo
   - Si no sale rojo, está bien formado

**Errores comunes:**
- Falta una `,` entre elementos
- Falta el `]` o `}`
- Comillas sin cerrar `"`
- Espacios o caracteres inválidos

---

## 📊 Análisis de tamaño

La cantidad de usuarios determina el tiempo:

| Usuarios | Base 58xx | Base 584x | Promedio | Tiempo estimado |
|----------|----------|----------|---------|-----------------|
| 50       | ✅ OK    | ✅ OK    | 5.5s    | 4.5 min         |
| 150      | ✅ OK    | ✅ OK    | 5.5s    | 13 min          |
| 300      | ✅ OK    | ✅ OK    | 5.5s    | 27 min          |
| 500      | ⚠️ Lento | ⚠️ Lento | 5.5s    | 45 min          |
| 1000     | ❌ MUY   | ❌ MUY   | 5.5s    | 90 min          |

**Recomendación:** Dividir en bases de máximo 200-300 usuarios

---

## 🚨 Importante

✅ **Guarda números sin caracteres especiales**
- ❌ `+57 300 123 4567`
- ✅ `573001234567`

✅ **Verifica que sean válidos antes de agregar**
- Números que no existan causan errores (pero el proceso continúa)

✅ **Haz backup de tus bases importantes**
- Copia el archivo antes de hacer cambios grandes

✅ **Una base de datos por grupo objetivo**
- Mejor organización y control
