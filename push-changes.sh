#!/bin/bash

# Script para hacer commit y push de los cambios
cd "$(dirname "$0")" || exit 1

echo "══════════════════════════════════════════"
echo "  🚀 Subiendo cambios al repositorio"
echo "══════════════════════════════════════════"
echo ""

# Verificar estado
echo "📊 Estado actual del repositorio:"
git status

echo ""
echo "📝 Agregando cambios..."
git add .

echo ""
echo "💬 Creando commit..."
git commit -m "fix: Resolver Error 428 - Backoff exponencial y límite de reintentos

- Implementar backoff exponencial para pairing (120s → 216s → 388s → ... máx 10min)
- Agregar límite de reintentos: máximo 8 intentos de pairing antes de pausar
- Limpiar locks residuales automáticamente al iniciar (>10 min)
- Agregar documentación completa: DIAGNOSTICO_ERROR_428.md
- Agregar script de diagnóstico: diagnose-428.js

Cambios en SessionManager.js:
- Nueva función: _cleanupStaleLocks() - elimina locks viejos
- Nueva función: _calculateBackoffForPairing() - backoff exponencial para pairing
- Modificada: _getReconnectDelay() - ahora usa backoff para ambos casos
- Agregado límite de reintentos (máx 8) con alerta"

echo ""
echo "🔼 Haciendo push al repositorio..."
git push origin main

echo ""
echo "✅ ¡Actualización completada!"
echo ""
echo "Cambios subidos:"
echo "  ✅ core/SessionManager.js (mejorada)"
echo "  ✅ DIAGNOSTICO_ERROR_428.md (nuevo)"
echo "  ✅ diagnose-428.js (nuevo)"
echo ""
