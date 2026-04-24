#!/usr/bin/env node

/**
 * ─── TEST ERROR REPORTER ───
 * Quick test to verify error reporting is working
 * 
 * Usage:
 *   node test-error-reporter.js
 */

import sessionManager from './core/SessionManager.js';
import errorReporter from './core/ErrorReporter.js';
import { log } from './core/Logger.js';
import fs from 'fs';

async function testErrorReporter() {
    console.log('\n═════════════════════════════════════════════════');
    console.log('  🧪 TESTING ERROR REPORTER');
    console.log('═════════════════════════════════════════════════\n');

    // Check if sessions are running
    const status = sessionManager.getStatus();
    const connectedCount = status.filter(s => s.connected).length;
    
    console.log('📊 Session Status:');
    status.forEach(s => {
        const icon = s.connected ? '✅' : '❌';
        console.log(`  ${icon} ${s.session}: ${s.connected ? 'Connected' : 'Disconnected'} (${s.phone})`);
    });
    
    if (connectedCount === 0) {
        console.log('\n⚠️  WARNING: No sessions connected!');
        console.log('   Error reports will be logged locally only.\n');
    } else {
        console.log(`\n✅ ${connectedCount}/${status.length} sessions connected.\n`);
    }

    console.log('─────────────────────────────────────────────────');
    console.log('📤 Sending Test Error Report...\n');

    try {
        // Simulate a critical error
        await errorReporter.handleCriticalError(
            'TEST ERROR - Connection Timeout',
            'Connection to WhatsApp server timed out after 30 seconds.\nServer might be temporarily unavailable.\nBot will retry automatically in 15 seconds.',
            1,  // Source: Session 1
            {
                testError: true,
                timestamp: new Date().toISOString(),
                service: 'WhatsApp',
                timeout: '30s',
                retryIn: '15s'
            }
        );

        console.log('\n✅ Error report sent successfully!');
        console.log('   Check WhatsApp on your alternate session number.\n');

    } catch (err) {
        console.log(`\n❌ Error sending test report: ${err.message}\n`);
    }

    // Show error log
    console.log('─────────────────────────────────────────────────');
    console.log('📋 Error Log Status:\n');
    
    try {
        const errorLog = JSON.parse(fs.readFileSync('./data/error_log.json', 'utf-8'));
        console.log(`  Total errors logged: ${errorLog.length}`);
        console.log(`  Log file: ./data/error_log.json`);
        
        if (errorLog.length > 0) {
            const lastError = errorLog[errorLog.length - 1];
            console.log(`\n  📌 Most Recent Error:`);
            console.log(`     Type: ${lastError.errorType}`);
            console.log(`     Status: ${lastError.status}`);
            console.log(`     Time: ${lastError.timestamp}`);
            
            if (lastError.status === 'SENT') {
                console.log(`     ✅ Delivered to: ${lastError.targetPhone || 'N/A'}`);
            } else if (lastError.status === 'NO_SESSIONS_AVAILABLE') {
                console.log(`     ⚠️  No sessions available to send`);
            } else if (lastError.status === 'SEND_FAILED') {
                console.log(`     ❌ Send failed: ${lastError.sendError || 'Unknown'}`);
            }
        }
    } catch (err) {
        console.log(`  ⚠️  Could not read error log: ${err.message}`);
    }

    console.log('\n═════════════════════════════════════════════════');
    console.log('  ✨ Test Complete!\n');
    
    console.log('Next Steps:');
    console.log('  1. Check the target WhatsApp session for the error message');
    console.log('  2. Review ./data/error_log.json for details');
    console.log('  3. Run: cat ./data/error_log.json | jq');
    console.log('  4. Or run: node test-error-reporter.js again to send another test\n');
}

// Run the test
testErrorReporter().catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
});
