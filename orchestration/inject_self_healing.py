import os

<<<<<<< HEAD
# Use relative path for portability
file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'index.js')
=======
# Use relative path assuming execution from repo root
file_path = os.path.join('orchestration', 'index.js')
if not os.path.exists(file_path):
    # Fallback if run from inside orchestration
    file_path = 'index.js'

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found.")
    exit(1)
>>>>>>> origin/fix/orchestration-self-healing-scope-1674567216437366258

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

<<<<<<< HEAD
# Function definition (Global Scope - No indentation)
=======
if "async function triggerSelfHealing" in content:
    print("Self-Healing already present. Skipping.")
    exit(0)

# Function definition (Global Scope)
>>>>>>> origin/fix/orchestration-self-healing-scope-1674567216437366258
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

<<<<<<< HEAD
# Check if already injected
if "async function triggerSelfHealing" in content:
    print("Self-Healing function already present. Skipping injection.")
else:
    # Insertion before SIGTERM handler (Global Scope)
    target = "process.on('SIGTERM', () => {"
    replacement = self_healing_fn + "\n" + target

    if target in content:
        content = content.replace(target, replacement)
        print("Injected triggerSelfHealing function.")
    else:
        print("Could not find target for self-healing injection (SIGTERM handler).")

# Update Listeners (Robust Version)
old_uncaught = """process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});"""

new_uncaught = """process.on('uncaughtException', (err) => {
  const msg = (err && err.message) || String(err);
  // Robust check for test crash
  if (msg.includes('TEST_CRASH_AUTO') || msg.toLowerCase().includes('test_crash')) {
=======
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
>>>>>>> origin/fix/orchestration-self-healing-scope-1674567216437366258
    console.log('✅ Self-Healing Validation Test Caught. System operational.');
    return;
  }
  console.error('Uncaught exception:', err);
<<<<<<< HEAD
  triggerSelfHealing(msg, err.stack || '');
});"""

if old_uncaught in content:
    content = content.replace(old_uncaught, new_uncaught)
    print("Updated uncaughtException listener.")
elif new_uncaught not in content:
    print("Could not find standard uncaughtException listener to update.")

old_rejection = """process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});"""

new_rejection = """process.on('unhandledRejection', (reason, promise) => {
=======
  triggerSelfHealing(msg, err instanceof Error ? err.stack : '');
});"""

    if old_listener in content:
        content = content.replace(old_listener, new_listener)

    old_rejection = """process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});"""
    new_rejection = """process.on('unhandledRejection', (reason, promise) => {
>>>>>>> origin/fix/orchestration-self-healing-scope-1674567216437366258
  const message = reason instanceof Error ? reason.message : String(reason);
  // Robust check for test crash
  if (message.includes('TEST_CRASH_AUTO') || message.toLowerCase().includes('test_crash')) {
    console.log('✅ Self-Healing Validation Test Caught (Rejection). System operational.');
    return;
  }
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  triggerSelfHealing(message, reason instanceof Error ? reason.stack : '');
});"""

<<<<<<< HEAD
if old_rejection in content:
    content = content.replace(old_rejection, new_rejection)
    print("Updated unhandledRejection listener.")
elif new_rejection not in content:
    print("Could not find standard unhandledRejection listener to update.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Self-Healing integration check complete.")
=======
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
>>>>>>> origin/fix/orchestration-self-healing-scope-1674567216437366258
