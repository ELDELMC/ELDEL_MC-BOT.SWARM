/**
 * ─── ERROR REPORTER ───
 * Captures, logs, and reports critical errors and disconnections.
 * 
 * Rules:
 * - Never report an error to the session that generated it
 * - Always report to the alternate session
 * - If one session is disconnected, the other session will report
 * - If both are disconnected, log locally only
 */

import { log } from './Logger.js';
import sessionManager from './SessionManager.js';
import config from '../config.js';
import { formatErrorReport } from './ErrorFormatter.js';
import fs from 'fs';
import path from 'path';

class ErrorReporter {
    constructor() {
        // Track which errors were already reported to avoid duplicates
        this.reportedErrors = new Set();
        
        // Session that reported error → don't send error back to it
        this.errorSourceSession = null;
        
        // Error log file
        this.errorLogPath = path.join(process.cwd(), 'data', 'error_log.json');
        this.ensureErrorLogFile();
    }

    /**
     * Ensure error log file exists
     */
    ensureErrorLogFile() {
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        if (!fs.existsSync(this.errorLogPath)) {
            fs.writeFileSync(this.errorLogPath, JSON.stringify([], null, 2));
        }
    }

    /**
     * Log error to file for persistence
     */
    _logErrorToFile(errorData) {
        try {
            const logs = JSON.parse(fs.readFileSync(this.errorLogPath, 'utf-8'));
            
            // Keep only last 500 errors
            if (logs.length > 500) {
                logs.shift();
            }
            
            logs.push({
                timestamp: new Date().toISOString(),
                ...errorData
            });
            
            fs.writeFileSync(this.errorLogPath, JSON.stringify(logs, null, 2));
        } catch (err) {
            console.error(`[ErrorReporter] Failed to log error to file: ${err.message}`);
        }
    }

    /**
     * Get the session that should report this error
     * @param {number} sourceSessionIndex - Session that generated the error (can be null)
     * @returns {number|null} - Session index to use for reporting, or null if none available
     */
    _getReportingSession(sourceSessionIndex = null) {
        const status = sessionManager.getStatus();
        const connectedSessions = status.filter(s => s.connected);
        
        // If only one session is connected, use it (even if it's the source)
        if (connectedSessions.length === 1) {
            return parseInt(connectedSessions[0].session.substring(1));
        }
        
        // If multiple sessions connected, pick one that's NOT the source
        if (connectedSessions.length > 1 && sourceSessionIndex !== null) {
            for (const session of connectedSessions) {
                const idx = parseInt(session.session.substring(1));
                if (idx !== sourceSessionIndex) {
                    return idx;
                }
            }
        }
        
        // Fallback to first connected session
        if (connectedSessions.length > 0) {
            return parseInt(connectedSessions[0].session.substring(1));
        }
        
        return null;
    }

    /**
     * Get phone number for a given session index
     */
    _getSessionPhone(sessionIndex) {
        const status = sessionManager.getStatus();
        const session = status.find(s => s.session === `S${sessionIndex}`);
        return session?.phone || `session-${sessionIndex}`;
    }

    /**
     * Send error report via WhatsApp
     * @param {string} errorMsg - Error message
     * @param {string} errorType - Type of error (uncaughtException, unhandledRejection, disconnection, etc)
     * @param {number} sourceSessionIndex - Which session generated the error
     * @param {object} metadata - Additional metadata
     */
    async sendErrorReport(errorMsg, errorType, sourceSessionIndex = null, metadata = {}) {
        try {
            // Generate unique error ID for deduplication
            const errorHash = `${errorType}-${Date.now()}-${sourceSessionIndex}`;
            if (this.reportedErrors.has(errorHash)) {
                return; // Already reported
            }
            this.reportedErrors.add(errorHash);
            
            // Clean old entries if set is too large
            if (this.reportedErrors.size > 100) {
                const arr = Array.from(this.reportedErrors);
                this.reportedErrors = new Set(arr.slice(-50));
            }

            // Determine reporting session
            const reportingSessionIndex = this._getReportingSession(sourceSessionIndex);
            
            if (!reportingSessionIndex) {
                log('warn', '❌ No connected sessions available to send error report');
                this._logErrorToFile({
                    errorType,
                    message: errorMsg.substring(0, 200),
                    sourceSession: sourceSessionIndex,
                    reportingSession: null,
                    status: 'NO_SESSIONS_AVAILABLE',
                    metadata
                });
                return;
            }

            const reportingSession = sessionManager.sockets.get(reportingSessionIndex);
            if (!reportingSession) {
                log('warn', `⚠️ Session ${reportingSessionIndex} socket not found`);
                return;
            }

            // Get the target phone (the other session's number)
            const targetSessionIndex = sourceSessionIndex && sourceSessionIndex !== reportingSessionIndex 
                ? sourceSessionIndex 
                : (reportingSessionIndex === 1 ? 2 : 1);
            
            const targetPhone = this._getSessionPhone(targetSessionIndex);
            
            // Skip if target session doesn't have a valid phone
            if (!targetPhone || targetPhone.includes('N/A') || targetPhone.includes('unknown')) {
                log('warn', `⚠️ Cannot send error: target phone (S${targetSessionIndex}: ${targetPhone}) not available`);
                return;
            }

            // Format the error message
            const report = formatErrorReport(errorMsg, errorType, sourceSessionIndex, targetSessionIndex, metadata);
            const jid = targetPhone.includes('@') ? targetPhone : `${targetPhone}@s.whatsapp.net`;
            
            // Send the message
            log('info', `📤 Sending error report to S${targetSessionIndex} (${targetPhone})`);
            
            try {
                await reportingSession.sendMessage(jid, { text: report });
                
                log('success', `✅ Error report sent successfully`);
                
                this._logErrorToFile({
                    errorType,
                    message: errorMsg.substring(0, 200),
                    sourceSession: sourceSessionIndex,
                    reportingSession: reportingSessionIndex,
                    targetSession: targetSessionIndex,
                    targetPhone,
                    status: 'SENT',
                    metadata
                });
            } catch (sendErr) {
                log('error', `Failed to send error report via WhatsApp: ${sendErr.message}`);
                
                this._logErrorToFile({
                    errorType,
                    message: errorMsg.substring(0, 200),
                    sourceSession: sourceSessionIndex,
                    reportingSession: reportingSessionIndex,
                    targetSession: targetSessionIndex,
                    status: 'SEND_FAILED',
                    sendError: sendErr.message,
                    metadata
                });
            }
        } catch (err) {
            log('error', `[ErrorReporter] Critical error in sendErrorReport: ${err.message}`);
        }
    }

    /**
     * Handle global uncaught exception
     */
    async handleUncaughtException(err, sourceSessionIndex = null) {
        const errorMsg = err?.stack || err?.message || String(err);
        
        log('error', `🔥 UNCAUGHT EXCEPTION: ${err.message}`);
        
        await this.sendErrorReport(
            errorMsg,
            'uncaughtException',
            sourceSessionIndex,
            { name: err.name }
        );
    }

    /**
     * Handle unhandled promise rejection
     */
    async handleUnhandledRejection(reason, promise, sourceSessionIndex = null) {
        const errorMsg = typeof reason === 'object' 
            ? (reason?.stack || reason?.message || JSON.stringify(reason))
            : String(reason);
        
        log('error', `⚠️ UNHANDLED REJECTION: ${errorMsg.substring(0, 100)}`);
        
        await this.sendErrorReport(
            errorMsg,
            'unhandledRejection',
            sourceSessionIndex,
            { reason: typeof reason === 'object' ? reason.constructor.name : typeof reason }
        );
    }

    /**
     * Handle session disconnection
     */
    async handleSessionDisconnection(sessionIndex, error, reconnectAttempts = 0) {
        const statusCode = error?.output?.statusCode || 0;
        const errorMsg = error?.message || error?.toString?.() || `Unknown error (code: ${statusCode})`;
        
        log('error', `📵 SESSION ${sessionIndex} DISCONNECTED: ${errorMsg}`);
        
        await this.sendErrorReport(
            errorMsg,
            'sessionDisconnection',
            sessionIndex,
            { 
                statusCode,
                reconnectAttempts,
                sessionName: config.deviceNames[sessionIndex - 1] || `Session ${sessionIndex}`
            }
        );
    }

    /**
     * Handle critical error that requires attention
     */
    async handleCriticalError(title, description, sourceSessionIndex = null, details = {}) {
        log('error', `🚨 CRITICAL ERROR: ${title}`);
        
        const fullError = `${title}\n\n${description}`;
        
        await this.sendErrorReport(
            fullError,
            'criticalError',
            sourceSessionIndex,
            { title, ...details }
        );
    }
}

export default new ErrorReporter();
