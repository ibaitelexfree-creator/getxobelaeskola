import os

file_path = os.path.join(os.path.dirname(__file__), 'index.js')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = "  console.log('[Chain 4] Nightly-Watch (Getxo 3 AM) & Self-Healing Registry ACTIVE');"

replacement = """  console.log('[Chain 4] Nightly-Watch (Getxo 3 AM) & Self-Healing Registry ACTIVE');
  
  // ── SAILING GHOST (QA Robot - 4 AM Getxo) ────────────────────────
  async function runNightlyQARobot() {
    try {
      if (process.env.JULES_DISABLE_QA_ROBOT === 'true') return;
      const now = new Date();
      // Ensure time is retrieved in Getxo, Bizkaia (Europe/Madrid)
      const getxoHour = parseInt(now.toLocaleString('en-US', { timeZone: 'Europe/Madrid', hour: 'numeric', hour12: false }), 10);
      
      if (getxoHour !== 4) return; // Trigger 1 hour after Code Evolution
      
      console.log('[QA Robot] ⛵ Desplegando Sailing Ghost (QA E2E)...');
      
      await createJulesSession({
        prompt: `MISSION: SAILING GHOST QA AUDIT
        1. Access the web app.
        2. Create a NEW test user account.
        3. Navigate to a course or membership page.
        4. Use Stripe Test Card (4242 4242 4242 4242) to perform a fake purchase.
        5. Verify the purchase is reflected in the user dashboard and membership is ACTIVE.
        6. Capture screenshots of every step. 
        7. Record a video of the interaction if possible.
        8. If any step FAILS, identify the reason and create a PR with the fix.
        9. Generate a nightly-qa-report branch with all media and a summary.md.`,
        source: process.env.JULES_DEFAULT_SOURCE || 'sources/github/ibaitelexfree-creator/getxobelaeskola',
        title: '⛵ Sailing Ghost: Nightly QA Audit',
        automationMode: 'AUTO_CREATE_PR'
      });
      
      sendTelegramMessage(`⛵ *Sailing Ghost: Zarpa la patrulla de QA (04:00 Getxo)*\\nEl robot está recorriendo la web y verificando pagos Stripe...`);
    } catch (err) {
      console.error('[QA Robot] Error:', err.message);
    }
  }

  setInterval(runNightlyQARobot, 60 * 60 * 1000);
  console.log('[Chain 4] Nightly-Watch (Getxo 3 AM) & Self-Healing & QA Robot ACTIVE');"""

if target in content:
    new_content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully injected Sailing Ghost QA Robot.")
else:
    print("Target tag not found in index.js")
