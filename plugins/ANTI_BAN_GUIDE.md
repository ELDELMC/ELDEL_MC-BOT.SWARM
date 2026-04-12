# 🛡️ GUÍA ANTI-BANEO - MEJORES PRÁCTICAS

Esta guía te ayuda a maximizar resultados minizando el riesgo de baneo de WhatsApp.

---

## 🚨 ¿Por qué WhatsApp banea?

WhatsApp detecta comportamientos automatizados analizando:

1. **Patrón de invitaciones** - Agregar muchos usuarios en poco tiempo
2. **Velocidad regular** - Intervalos exactos entre invitaciones (máquina)
3. **Tasa de rechazo** - Números inválidos o fantasmas
4. **Horarios sospechosos** - Invitaciones a horas raras
5. **Cantidad total** - Más de 500 invítaciones en 24 horas

---

## ✅ Lo que el comando .INVO ya hace

El comando implementa varias protecciones:

| Protección | Detalles |
|-----------|----------|
| **Intervalos aleatorios** | 3-8 segundos (no es fijo) |
| **Validación de números** | Solo 10-15 dígitos válidos |
| **Evita duplicados** | No re-invita personas ya en grupo |
| **Manejo de errores** | Sigue sin abortar |
| **Background execution** | El bot sigue respondiendo |

---

## 🎯 Mejores prácticas

### 1️⃣ **Dividir grandes listas**

❌ **MAL:**
- Agregar 1000 usuarios en una sesión
- Hacer esto todos los días

✅ **BIEN:**
- Dividir en grupos de 150-300 usuarios
- Espaciar 2-3 horas entre invitaciones
- Máximo 300-500 usuarios/día

**Ejemplo:**
```
Hora 09:00 → .invo 1 si → 150 usuarios
Hora 12:00 → .invo 2 si → 150 usuarios  
Hora 16:00 → .invo 3 si → 200 usuarios
```

### 2️⃣ **Variar horarios**

❌ **MAL:**
```
Lunes 10:00 - Agregar usuarios
Martes 10:00 - Agregar usuarios
Miércoles 10:00 - Agregar usuarios
```
(WhatsApp nota el patrón)

✅ **BIEN:**
```
Lunes 09:15 - Agregar usuarios
Martes 13:45 - Agregar usuarios
Miércoles 08:30 - Agregar usuarios
Jueves 11:20 - Agregar usuarios
```

### 3️⃣ **Limpiar bases antes de usar**

Antes de agregar usuarios:
1. Verificar que los números sean válidos
2. Remover números que ya estén en grupo
3. Remover números inválidos/fantasmas

**Recursos online para validar:**
- Buscar en Google si número existe
- Comprobar con WhatsApp Web
- Validar formato (solo dígitos, 10-15)

### 4️⃣ **Usar ambas sesiones estratégicamente**

Los 2 bots pueden trabajar en **grupos diferentes**:

```
Bot Sesión 1:  .invo 1 si (en Grupo A)
Bot Sesión 2:  .invo 2 si (en Grupo B)
(simultáneamente)
```

**Ventaja:** Duplica velocidad sin cargar un solo bot

**Precaución:** Mismo número en grupos diferentes es OK, pero no invitar mismo número > 2-3 veces en 24 horas

### 5️⃣ **Monitorear respuestas**

Después de cada invitación, observar:

- ¿Muchos números "jid does not exist"? → Base contiene fantasmas
- ¿Muchos "ya en grupo"? → Usa base diferente o limpia
- ¿Bajos errores? → Base está bien

**Acciones si algo está mal:**
```
Muchos errores (>30%)
  ↓
Detener el proceso
  ↓
Limpiar la base de datos
  ↓
Intentar de nuevo
```

---

## 📊 Límites de WhatsApp

| Métrica | Límite Seguro | Límite Peligroso |
|---------|---------------|-----------------|
| Invites/hora | 30-50 | >100 |
| Invites/día | 200-300 | >500 |
| Invites/semana | 1000-1500 | >3000 |
| Entre invites | 3-8 seg | <2 seg |
| Números inválidos | <5% | >20% |

---

## 🔴 Señales de peligro

Si ves esto, **DETÉN el proceso inmediatamente**:

1. **"You are not connected"** → Conexión perdida, espera 10 min
2. **"This action was blocked"** → WhatsApp te vio, descansa 1-2 horas
3. **"Phone number not connected"** → Número débil, detente
4. **Muchos errores de 429** → Rate limiting, espera 30-60 min

**Si ves cualquiera de esto:**
```
DETÉN .invo
↓
Espera 1-3 horas
↓
Verifica que el bot siga en línea
↓
Intenta con grupo diferente
```

---

## 🆘 Recuperación después de baneo

Si WhatsApp **limitó** tu número:

1. **No intentes agregar más usuarios** por 24-48 horas
2. **Usa la sesión 2** en su lugar si está disponible
3. **Distribuye carga** entre más grupos
4. **Espera pacientemente** - Los limites se alivian con tiempo

**¿Cuándo puedes reintentar?**
- Después de 24 horas: Intenta con 10-20 usuarios
- Después de 48 horas: Intenta con 50 usuarios
- Después de 72 horas: Vuelta a la normalidad

---

## 💻 Configuración óptima

### Para máxima seguridad:
```yaml
Intervalos: 5-8 segundos
Invites/día: 150-200 máximo
Grupos diferentes: Sí
Horarios: Alternados cada 2-3 horas
```

### Para balance:
```yaml
Intervalos: 3-6 segundos (default)
Invites/día: 300-500 máximo
Grupos diferentes: Depende
Horarios: Mañana, tarde, noche
```

### Para máxima velocidad (más riesgo):
```yaml
Intervalos: 2-4 segundos
Invites/día: 500+ máximo
Grupos diferentes: No
Horarios: Concentrado
⚠️ Riesgo de baneo: ALTO
```

---

## 📋 Checklist antes de invitar

- [ ] Base de datos contiene solo números válidos
- [ ] Números están en formato correcto (10-15 dígitos)
- [ ] He limpiado duplicados de otras bases
- [ ] Última invitación fue hace > 2 horas
- [ ] El grupo tiene permiso para invitar (no restringido)
- [ ] El bot tiene permisos de admin
- [ ] El bot está en línea y activo
- [ ] Tengo tiempo para monitorear (no ir sin verificar)
- [ ] He leído los errores del último intento

---

## 📞 Contacto e Información

**Si algo sale mal:**
1. Verifica el estado en `.menu` o `.ping`
2. Revisa los errores en el reporte final
3. Limpia la base de datos y reintenta
4. Si persiste, contacta al admin

**Logs importantes:**
```
Ubicación: data/
- banned.json (usuarios baneados)
- warnings.json (advertencias)
- owner.json (propietario)
```

---

## 🎓 Ejemplo práctico paso a paso

### Escenario: Agregar 600 usuarios en 2 grupos

**Día 1:**
```
09:00 - Sesión 1 en Grupo A: .invo 1 si
        → 150 usuarios ✅
12:30 - Sesión 1 en Grupo B: .invo 2 si
        → 150 usuarios ✅
        Total hoy: 300 usuarios
```

**Día 2:**
```
10:15 - Sesión 2 en Grupo A: .invo 3 si
        → 150 usuarios ✅
14:45 - Sesión 2 en Grupo B: .invo 4 si
        → 150 usuarios ✅
        Total hoy: 300 usuarios
```

**Total:** 600 usuarios en 2 días, **sin riesgo de baneo** ✅

---

## 🔗 Links útiles

- [Políticas de WhatsApp](https://www.whatsapp.com/legal/)
- [Cómo evitar baneo](https://faq.whatsapp.com/)
- [Validador de números](https://www.whatsapp.com/)

---

**Última actualización:** 2024-04-08  
**Recomendación:** Leer completamente antes de usar `.invo` en producción
