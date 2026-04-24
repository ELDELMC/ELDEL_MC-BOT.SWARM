// Proxy a la implementación de Modo Espía en la carpeta CLONADOR
// Este archivo simplemente reexporta las funciones del módulo CLONADOR/utils/spyMode.js
// De esta forma el resto del proyecto sigue importando './core/spyMode.js' sin cambios.

import { processSpyMessage, triggerForceFlush, getSpyStats, startFlushCycle } from '../CLONADOR/utils/spyMode.js';

export { processSpyMessage, triggerForceFlush, getSpyStats, startFlushCycle };
