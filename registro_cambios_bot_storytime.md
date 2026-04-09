# 📋 REGISTRO OFICIAL DE CAMBIOS - JUANCHOTE-SWARM
================================================

Este archivo es la bitácora técnica y memoria compartida del proyecto. 

> [!NOTE]
> Se ha migrado el registro de `.txt` a `.md` para mejorar la legibilidad, estabilidad y soporte de formato enriquecido.

---

## 🚀 CAMBIOS RECIENTES

### 📌 CAMBIO #5 - 2026-04-09 17:50 (GMT-5)
**🤖 IA responsable:** Google Antigravity AI
**🔧 Archivos afectados:**
- `plugins/invo.js` → Robustez en la detección de bases de datos y unificación de rutas.
- `registro_cambios_bot_storytime.md` → Creación del nuevo formato de registro.

**🧩 Storytime Técnico:**
Se detectó un error `ENOENT` en el comando `.invo` cuando se ejecutaba en entornos Docker (Pterodactyl). Aunque la ruta existía, el comando fallaba al intentar escanear el directorio.
1. **Unificación Total:** Se eliminó la definición local de `DB_PATH` en `invo.js` y ahora se importa directamente desde `CLONADOR/utils/clonador.js` para asegurar que el radar de SPY y el cargador de INVO miren exactamente al mismo sitio.
2. **Robustez:** Se añadió un bloque `fs.existsSync` y `mkdirSync` antes del escaneo para prevenir crashes si la carpeta no existe al inicio.
3. **Migración de Log:** Se creó este archivo `.md` para evitar la corrupción por tamaño del archivo `.txt` anterior.

---

### 📌 CAMBIO #4 - 2026-04-09 16:00 (GMT-5)
**🤖 IA responsable:** Google Antigravity AI
**🔧 Archivos afectados:**
- `plugins/order.js` → Soporte para respuestas (reply) y detección de números en texto citado.
- `core/Deduplicator.js` → Implementación de Load Balancing por Hash.
- `core/SharedData.js` → Unificación de ruta base 'db'.

**🧩 Storytime Técnico:**
1. **Balanceo de Carga (Swarm):** Se implementó una asignación por Hash del ID del mensaje para que las sesiones se repartan el trabajo 50/50 de forma natural.
2. **Mejora en .order:** Ahora el comando puede analizar mensajes citados (replies), permitiendo capturar números de textos enviados previamente.
3. **Unificación:** Se movieron todos los datos a la raíz `/db/`.

---

### 📌 CAMBIO #3 - 2026-04-09 14:40 (GMT-5)
**🤖 IA responsable:** Google Antigravity AI
**🔧 Archivos afectados:**
- `core/ActivityTracker.js` → Seguimiento de mensajes por grupo.
- `plugins/top.js` → Comando `.top activos`.

**🧩 Storytime Técnico:**
Implementación del sistema de "Top activos" para fomentar la interacción en los grupos, guardando estadísticas en `db/activity.json`.

---

## 🔍 ÚLTIMAS REVISIONES

### 🔍 REVISIÓN #4 - 2026-04-09 17:55 (GMT-5)
**🤖 IA revisora:** Google Antigravity AI
**✅ Lo revisado:**
- Consistencia de rutas en todo el proyecto.
- Estabilidad del archivo de registro (Migración a Markdown).
**❌ Problemas encontrados:**
- El archivo `.txt` anterior presentaba caracteres basura (`??`) y riesgo de corrupción.
- `invo.js` tenía una redundancia de código al definir su propia ruta de DB.
**✨ Mejoras realizadas:**
- Refactorización de `invo.js` para importar constantes globales.
- Creación de este documento `.md`.

---

## 🗺️ PRÓXIMOS PASOS
1. **Pruebas en Docker:** Verificar si el error `ENOENT` persiste después de la exportación de `DB_DIR`.
2. **Monitor de RAM:** Ajustar el watchdog si el bot consume más de lo esperado en servidores limitados.
3. **Auto-Update de Bases:** Implementar una función para que INVO refresque la lista de archivos sin necesidad de reiniciar (vía validación de caché).
