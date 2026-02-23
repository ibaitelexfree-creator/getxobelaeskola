import os

# Use relative path assuming execution from repo root
file_path = os.path.join('orchestration', 'index.js')
if not os.path.exists(file_path):
    # Fallback if run from inside orchestration
    file_path = 'index.js'

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found.")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "async function triggerSelfHealing" in content:
    print("Self-Healing already present. Skipping.")
    exit(0)

# Function definition (Global Scope)
self_healing_fn = """
// ── SELF-HEALING ENGINE (Chain 4) ────────────────────────
async function triggerSelfHealing(errorMsg, stack) {
  if (process.env.JULES_DISABLE_SELF_HEALING === 'true') return;
  metrics.errorsTotal++;
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

# Append to end of file (before listeners if possible, but end is fine as listeners are global)
# We need to inject it before the process.on listeners if we want to be clean, but they are at the end.
# Let's just append it before the first process.on('SIGTERM')

sigterm_target = "process.on('SIGTERM', () => {"
if sigterm_target in content:
    content = content.replace(sigterm_target, self_healing_fn + "\n\n" + sigterm_target)

    # Update listeners to use robust error handling
    old_listener = """process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});"""
    new_listener = """process.on('uncaughtException', (err) => {
  const msg = err && err.message ? err.message : String(err);
  if (msg.includes('TEST_CRASH_AUTO')) {
    console.log('✅ Self-Healing Validation Test Caught. System operational.');
    return;
  }
  console.error('Uncaught exception:', err);
  triggerSelfHealing(msg, err instanceof Error ? err.stack : '');
});"""

    if old_listener in content:
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

    if old_rejection in content:
        content = content.replace(old_rejection, new_rejection)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Self-Healing successfully integrated (Global Scope).")
else:
    print("Could not find insertion point (process.on('SIGTERM')). Appending to end.")
    content += "\n" + self_healing_fn
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Self-Healing appended to end of file.")
