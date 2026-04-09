/**
 * ─── ERROR FORMATTER ───
 * Formats error messages for WhatsApp delivery
 */

import config from '../config.js';

/**
 * Extract key information from error stack
 */
function parseErrorStack(stack) {
    if (!stack) return { file: 'unknown', line: 'unknown' };
    
    const lines = stack.split('\n');
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('at ')) {
            // Try to extract file and line number
            const match = line.match(/\((.*?):(\d+):\d+\)|(.*?):(\d+):\d+/);
            if (match) {
                const file = match[1] || match[3] || 'unknown';
                const lineNum = match[2] || match[4] || 'unknown';
                return { 
                    file: file.split('/').pop().split('\\').pop(),
                    line: lineNum 
                };
            }
        }
    }
    
    return { file: 'unknown', line: 'unknown' };
}

/**
 * Get suggestion for common errors
 */
function getSuggestion(errorMsg, errorType) {
    const msg = errorMsg.toLowerCase();
    
    // Connection errors
    if (msg.includes('econnrefused')) {
        return '💡 Posible causa: Servidor no disponible. Reintentar conexión.';
    }
    if (msg.includes('timeout') || msg.includes('econnaborted')) {
        return '💡 Causa: Timeout de conexión. Verificar velocidad de internet.';
    }
    if (msg.includes('stream errored')) {
        return '💡 Causa: Conexión perdida con WhatsApp. Se intentará reconectar automáticamente.';
    }
    if (msg.includes('logged out') || msg.includes('conflict')) {
        return '💡 Causa: Sesión cerrada. Será necesario volver a escanear el QR.';
    }
    
    // Memory errors
    if (msg.includes('out of memory') || msg.includes('heap')) {
        return '💡 Causa: Consumo de RAM muy alto. Se reiniciará el bot.';
    }
    
    // Promise/async errors
    if (errorType === 'unhandledRejection') {
        return '💡 Posible causa: Promise sin manejo de error. Revisar logs para detalles.';
    }
    
    return null;
}

/**
 * Format timestamp nicely
 */
function formatTimestamp() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: config.timeZone || 'UTC'
    };
    return new Intl.DateTimeFormat('es-CO', options).format(now);
}

/**
 * Main function: Format error report
 */
export function formatErrorReport(errorMsg, errorType, sourceSessionIndex, targetSessionIndex, metadata = {}) {
    const { file, line } = parseErrorStack(errorMsg);
    const suggestion = getSuggestion(errorMsg, errorType);
    const timestamp = formatTimestamp();
    
    // Truncate long error messages
    let truncatedError = errorMsg;
    if (errorMsg.length > 800) {
        truncatedError = errorMsg.substring(0, 800) + '\n...[truncado]';
    }
    
    // Format error type nicely
    const typeLabels = {
        'uncaughtException': '🔥 EXCEPCIÓN NO CAPTURADA',
        'unhandledRejection': '⚠️ PROMISE RECHAZADO',
        'sessionDisconnection': '📵 DESCONEXIÓN DE SESIÓN',
        'criticalError': '🚨 ERROR CRÍTICO'
    };
    const typeLabel = typeLabels[errorType] || `❌ ${errorType}`;
    
    // Get session names
    const sourceName = config.deviceNames[sourceSessionIndex - 1] || `Sesión ${sourceSessionIndex}`;
    const targetName = config.deviceNames[targetSessionIndex - 1] || `Sesión ${targetSessionIndex}`;
    
    // Build message
    let report = `${typeLabel}\n`;
    report += `${'═'.repeat(35)}\n\n`;
    
    report += `📱 Origen: ${sourceName}\n`;
    report += `📋 ID: S${sourceSessionIndex}\n`;
    report += `🕐 Hora: ${timestamp}\n\n`;
    
    report += `📍 Ubicación del Error:\n`;
    report += `  • Archivo: ${file}\n`;
    report += `  • Línea: ${line}\n\n`;
    
    report += `📄 Detalle del Error:\n`;
    report += `${truncatedError}\n\n`;
    
    if (metadata.statusCode) {
        report += `🔢 Status Code: ${metadata.statusCode}\n`;
    }
    
    if (metadata.reconstructionAttempts !== undefined) {
        report += `🔄 Intentos de reconstrucción: ${metadata.reconstructionAttempts}\n`;
    }
    
    if (suggestion) {
        report += `\n${suggestion}\n`;
    }
    
    report += `\n${'═'.repeat(35)}\n`;
    report += `✅ Bot monitoreando...\n`;
    
    return report;
}
