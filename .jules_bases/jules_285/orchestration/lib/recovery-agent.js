import { startAutoFix as startRenderAutoFix } from './render-autofix.js';
import { sendTelegramMessage } from './telegram.js';

/**
 * Recovery Agent
 * Handles inbound error signals from Firebase, GitHub, or direct API calls
 * and orchestrates automatic repair sessions.
 */
export async function handleRecoverySignal(payload, createSessionFn, sendMessageFn) {
    console.log('[RecoveryAgent] Processing inbound alarm:', JSON.stringify(payload, null, 2));

    const { type, error, stack, source, metadata } = payload;
    const correlationId = `fix_${Date.now()}`;

    // Log to Telegram
    await sendTelegramMessage(`🛠️ *Auto-Healing Triggered*\n\n*Error:* ${error || 'Unknown'}\n*Source:* ${source || 'CI/CD'}\n*Action:* Analyzing codebase for fix...`);

    // Simple logic to generate a prompt for Jules based on the error
    const repairPrompt = `System has detected a failure in ${source || 'the application'}.
  
Error: ${error}
Stack Trace: ${stack || 'Not provided'}
Metadata: ${JSON.stringify(metadata || {})}

Please analyze the codebase, identify the root cause of this error, and implement a fix. 
Focus on ${type === 'crash' ? 'stability and null checks' : 'build environment and dependencies'}.
Create a PR with the fix.`;

    try {
        const session = await createSessionFn({
            prompt: repairPrompt,
            source: metadata?.repoSource || 'sources/github/ibaitelexfree-creator/getxobelaeskola',
            title: `Auto-Fix: ${error?.substring(0, 50) || 'Unresolved Error'}`,
            automationMode: 'AUTO_CREATE_PR',
            branch: metadata?.branch || 'main'
        });

        return {
            success: true,
            sessionId: session.name?.split('/').pop() || session.id,
            message: 'Repair session started successfully'
        };
    } catch (err) {
        console.error('[RecoveryAgent] Failed to initiate repair:', err.message);
        await sendTelegramMessage(`❌ *Auto-Healing Failed*\n\nReason: ${err.message}`);
        return { success: false, error: err.message };
    }
}
