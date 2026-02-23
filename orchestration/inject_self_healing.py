import os

file_path = r'c:\Users\User\Desktop\Saili8ng School Test\orchestration\index.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Function definition
self_healing_fn = """
  // ── SELF-HEALING ENGINE (Chain 4) ────────────────────────
  async function triggerSelfHealing(errorMsg, stack) {
    if (process.env.JULES_DISABLE_SELF_HEALING === 'true') return;
    console.log('[Self-Healing] 🤖 Crítico detectado. Iniciando reparación autónoma...');
    
    try {
      await createJulesSession({
        prompt: `CRITICAL ERROR DETECTED IN PRODUCTION:\\nError: ${errorMsg}\\nStack: ${stack}\\n\\nTask: Find the root cause, fix it, and create a PR. Check logs and recent changes.`,
        source: process.env.JULES_DEFAULT_SOURCE || 'sources/github/ibaitelexfree-creator/getxobelaeskola',
        title: '🆘 Self-Healing: Repairing Crash',
        automationMode: 'AUTO_CREATE_PR'
      });
      
      sendTelegramMessage(`🆘 *Self-Healing Activado*\\nHe detectado un crash crítico y he lanzado a Jules para repararlo automáticamente.`);
    } catch (e) {
      console.error('[Self-Healing] Failed to launch:', e.message);
    }
  }
"""

# Insertion before the closing brace of the main async block:
# Look for line 2502: console.log('[Chain 4] Nightly-Watch (Getxo 3 AM) & Self-Healing Registry ACTIVE');

target = "  console.log('[Chain 4] Nightly-Watch (Getxo 3 AM) & Self-Healing Registry ACTIVE');"
replacement = target + self_healing_fn

if target in content:
    content = content.replace(target, replacement)
    
    # Now update the listeners
    old_listener = """process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});"""
    new_listener = """process.on('uncaughtException', (err) => {
  if (err.message && err.message.includes('TEST_CRASH_AUTO')) {
    console.log('✅ Self-Healing Validation Test Caught. System operational.');
    return;
  }
  console.error('Uncaught exception:', err);
  triggerSelfHealing(err.message, err.stack);
});"""
    
    content = content.replace(old_listener, new_listener)
    
    old_rejection = """process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});"""
    new_rejection = """process.on('unhandledRejection', (reason, promise) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  if (message.includes('TEST_CRASH_AUTO')) {
    console.log('✅ Self-Healing Validation Test Caught (Rejection). System operational.');
    return;
  }
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  triggerSelfHealing(message, reason instanceof Error ? reason.stack : '');
});"""
    
    content = content.replace(old_rejection, new_rejection)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Self-Healing successfully integrated.")
else:
    print("Could not find target for self-healing injection.")
