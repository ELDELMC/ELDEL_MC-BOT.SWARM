# 🔍 Diagnóstico del Comando .INVO

## ✅ Estado del Comando

El comando `.invo` **se carga correctamente** y está listo para usar. Se ha validado:

- ✅ El archivo `plugins/invo.js` tiene sintaxis correcta
- ✅ El comando está registrado en la lista de comandos
- ✅ Los alias funcionan: `.invite`, `.invitar`, `.agregar`
- ✅ El handler es una función válida
- ✅ Se reconoce correctamente en todos los patrones

## ❓ ¿Por qué el bot no responde?

Si estás usando `.invo` y el bot no responde, es porque **falta cumplir una condición obligatoria**:

### 1️⃣ El comando SOLO funciona en **GRUPOS**

```
❌ Esto NO funciona (chat privado):
.invo

✅ Esto funciona (en un grupo):
.invo
```

**Solución:** Usa el comando en un grupo de WhatsApp, NO en un chat privado

---

### 2️⃣ El BOT debe ser **ADMINISTRADOR** del grupo

```
Requisito: El bot (@nombre del bot) debe ser admin del grupo
```

**Si el bot NO es admin, verás:**
```
❌ El bot necesita ser administrador para ejecutar este comando.
```

**Solución:** Hazle admin del grupo al bot

---

### 3️⃣ TÚ debes ser **ADMINISTRADOR** del grupo (o dueño del bot)

```
Requisito: Debes ser admin del grupo para poder invitar usuarios
```

**Si NO eres admin, verás:**
```
❌ Solo los administradores del grupo pueden usar este comando.
```

**Solución:** Pídele al admin del grupo que te haga admin también

---

### 4️⃣ Debe existir la carpeta `db/grupos_clonados/` con archivos `.json`

```
Estructura requerida:
db/
  └── grupos_clonados/
      ├── base1.json
      ├── base2.json
      └── ...
```

**Si no hay bases, verás:**
```
❌ No hay bases de datos disponibles.

Verifica que existan archivos .json en:
db/grupos_clonados/
```

**Solución:** Asegúrate de tener al menos un archivo `.json` en `db/grupos_clonados/`

---

## 🧪 Cómo Probar

Sigue estos pasos en orden:

### Paso 1: Verifica que estés en un GRUPO (no privado)
```
Abre un grupo en WhatsApp
```

### Paso 2: Verifica que el bot sea ADMIN
```
1. Abre la información del grupo
2. Mira "Administradores"
3. Verifica que el bot aparezca en la lista
Si no, pedile a un admin que lo haga
```

### Paso 3: Verifica que TÚ seas ADMIN (o dueño del bot)
```
1. Si eres dueño del bot, omite este paso
2. Si no, pídele a un admin que te haga admin
```

### Paso 4: Usa el comando
```
.invo
```

Deberías ver un menú mostrando las bases de datos disponibles.

---

## 📋 Checklist de Depuración

Copia y pega en tu grupo, paso a paso:

```
🔍 Checklist de depuración:
- [ ] Estoy en un GRUPO (no chat privado)
- [ ] El bot aparece como ADMINISTRADOR
- [ ] Yo soy ADMINISTRADOR (o dueño del bot)
- [ ] Existen archivos en db/grupos_clonados/
- [ ] Envié exactamente: .invo
```

---

## 🆘 Si aún no funciona

1. **Revisa los logs** del bot para ver si hay errores
2. **Reinicia el bot** completamente
3. **Verifica la conexión** de WhatsApp (que el bot esté "conectado")
4. **Prueba con otro grupo** para verificar que sea específico del grupo

---

## 📞 Soporte Rápido

```
Si el bot dice:
"❌ El bot necesita ser administrador"
→ Hazle admin al bot

Si dice:
"❌ Solo los administradores del grupo"
→ Pídele al admin que te haga admin

Si dice:
"❌ Este comando solo funciona en grupos"
→ Usa en un grupo, no en chat privado

Si dice:
"❌ No hay bases de datos disponibles"
→ Crea archivos .json en db/grupos_clonados/
```

---

**Fecha:** 9 de abril de 2026  
**Última actualización:** 17:18 GMT-5
