/**
 * ─── QUICK START: ERROR REPORTER USAGE ───
 * Examples of how to use ErrorReporter from your modules
 */

import errorReporter from '../core/ErrorReporter.js';

// ───────────────────────────────────────────────────────────────
// 1. AUTOMATIC (Already integrated, you don't need to do anything)
// ───────────────────────────────────────────────────────────────

// These are automatically captured:
// - Uncaught exceptions
// - Unhandled promise rejections
// - Session disconnections
// No code needed!

// ───────────────────────────────────────────────────────────────
// 2. MANUAL CRITICAL ERRORS (Call from your code)
// ───────────────────────────────────────────────────────────────

// Example: Database connection failed
async function connectDatabase() {
    try {
        // ... your code
    } catch (error) {
        await errorReporter.handleCriticalError(
            'Database Connection Failed',
            `Could not connect to MongoDB: ${error.message}`,
            sessionIndex,  // Which session detected this (optional)
            { 
                database: 'MongoDB',
                attempts: 3,
                host: 'localhost:27017'
            }
        );
    }
}

// ───────────────────────────────────────────────────────────────
// 3. SEND CUSTOM ERROR REPORTS
// ───────────────────────────────────────────────────────────────

// Full low-level control
await errorReporter.sendErrorReport(
    `Custom error message\nWith stack trace`,
    'customErrorType',  // Error type
    sessionIndex,       // Source session (null = unknown)
    { 
        custom: 'metadata',
        canInclude: 'anything'
    }
);

// ───────────────────────────────────────────────────────────────
// 4. HANDLE UNCAUGHT ERRORS IN YOUR HANDLERS
// ───────────────────────────────────────────────────────────────

// In message handler
async function handleMessage(sock, message, sessionIndex) {
    try {
        // ... your processing
    } catch (error) {
        // Already caught! Optional: also log details
        await errorReporter.handleUncaughtException(error, sessionIndex);
    }
}

// For promises
async function someAsyncTask() {
    try {
        const result = await fetchData();
        return result;
    } catch (error) {
        // Already caught! Optional: also log
        await errorReporter.handleUnhandledRejection(error, null, sessionIndex);
    }
}

// ───────────────────────────────────────────────────────────────
// 5. COMMON PATTERNS
// ───────────────────────────────────────────────────────────────

// Pattern 1: Wrap risky operations
async function riskyOperation(sessionIndex) {
    try {
        // Something that might fail
        await someService.doSomething();
    } catch (err) {
        await errorReporter.handleCriticalError(
            'Service Operation Failed',
            `Service error: ${err.message}`,
            sessionIndex
        );
        throw err; // Re-throw if needed
    }
}

// Pattern 2: Report recovery attempts
async function reconnectWithRetry(sessionIndex, maxAttempts = 3) {
    for (let i = 1; i <= maxAttempts; i++) {
        try {
            await connect();
            return true; // Success
        } catch (err) {
            if (i === maxAttempts) {
                await errorReporter.handleCriticalError(
                    'Connection Failed After Retries',
                    `Failed to reconnect after ${maxAttempts} attempts: ${err.message}`,
                    sessionIndex,
                    { attempts: maxAttempts, lastError: err.message }
                );
            }
        }
    }
    return false;
}

// ───────────────────────────────────────────────────────────────
// 6. CHECK ERROR LOG
// ───────────────────────────────────────────────────────────────

// Access the error log file directly
import fs from 'fs';
const errorLog = JSON.parse(
    fs.readFileSync('./data/error_log.json', 'utf-8')
);

// Get last error
const lastError = errorLog[errorLog.length - 1];
console.log('Last error:', lastError);

// Get errors from session 1
const s1Errors = errorLog.filter(e => e.sourceSession === 1);
console.log(`Session 1 had ${s1Errors.length} errors`);

// Get failed deliveries
const failedSends = errorLog.filter(e => e.status !== 'SENT');
console.log('Undelivered reports:', failedSends);

// ───────────────────────────────────────────────────────────────
// 7. DISABLE ERROR REPORTING IF NEEDED
// ───────────────────────────────────────────────────────────────

// In index.js, comment this line:
// errorHandlerReady = true;  // ← Comment to disable reports

// Or conditionally:
// if (process.env.ENABLE_ERROR_REPORTS !== 'false') {
//     errorHandlerReady = true;
// }

// ───────────────────────────────────────────────────────────────
// 8. ERROR TYPES THAT AUTO-REPORT
// ───────────────────────────────────────────────────────────────

const autoReportedErrors = [
    'uncaughtException',           // process.on('uncaughtException')
    'unhandledRejection',          // process.on('unhandledRejection')
    'sessionDisconnection',        // Connection closed with error
    'criticalError',               // Manual handleCriticalError()
];

console.log('Automatically reported error types:', autoReportedErrors);

// ───────────────────────────────────────────────────────────────
// 9. SMART ERROR SUGGESTIONS
// ───────────────────────────────────────────────────────────────

// The system auto-generates helpful suggestions for:
// - ECONNREFUSED → "Server unavailable"
// - TIMEOUT → "Check internet speed"
// - Stream Errored → "Will auto-reconnect"
// - Logged Out → "Need to scan QR again"
// - Out of Memory → "Bot will restart"
// - And more...

export { errorReporter };
