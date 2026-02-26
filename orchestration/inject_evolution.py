import os

file_path = os.path.join(os.path.dirname(__file__), 'index.js')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = "  console.log('[AutoDispatch] Loop scheduled — will check for pending Jules tasks every 90s');\n});"
replacement = """  console.log('[AutoDispatch] Loop scheduled — will check for pending Jules tasks every 90s');

  // ── CHAIN 3/4: NIGHTLY EVOLUTION & SELF-HEALING ────────────────────────
  let lastEvolutionDay = -1;
  async function runNightlyCodeEvolution() {
    try {
      if (process.env.JULES_DISABLE_AUTO_EVOLUTION === 'true') return;
      const now = new Date();
      // Asegurar que la hora es la de Getxo, Bizkaia (Europe/Madrid)
      const getxoHour = parseInt(now.toLocaleString('en-US', { timeZone: 'Europe/Madrid', hour: 'numeric', hour12: false }), 10);
      
      if (getxoHour !== 3) return; // Silent unless 3 AM Getxo
      if (now.getDate() === lastEvolutionDay) return;
      lastEvolutionDay = now.getDate();

      console.log('[Code Evolution] 🌙 3 AM en Getxo. Iniciando turno de evolución autónoma...');
      const { getSuggestedTasks, generateFixPrompt } = await import('./lib/suggested-tasks.js');
      const parentDir = path.resolve(process.cwd(), '..');
      const result = getSuggestedTasks(parentDir, { limit: 50 });
      
      const codeTasks = result.tasks.filter(t => !t.location.includes('.agent') && !t.location.includes('docs') && !t.location.includes('.github') && !t.location.includes('.md'));
      if (codeTasks.length === 0) return;
      
      const task = codeTasks[0];
      const prompt = generateFixPrompt(task, parentDir);
      
      await createJulesSession({
        prompt,
        source: process.env.JULES_DEFAULT_SOURCE || 'sources/github/ibaitelexfree-creator/getxobelaeskola',
        title: `Auto-Evolve: Fix ${task.type}`,
        automationMode: 'AUTO_CREATE_PR'
      });
      
      sendTelegramMessage(`🦇 *Autonomía Nocturna (Getxo 03:00)*\\nEjecutando mejora en: \\`${task.location}\\``);
    } catch (err) {
      console.error('[Evolution] Error:', err.message);
    }
  }

  setInterval(runNightlyCodeEvolution, 60 * 60 * 1000);
  console.log('[Chain 4] Nightly-Watch (Getxo 3 AM) & Self-Healing Registry ACTIVE');
});"""

if target in content:
    new_content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully injected Code Evolution.")
else:
    # Try normalized approach
    print("Target not found exactly. Trying line-by-line match.")
    lines = content.splitlines()
    found = False
    for i in range(len(lines)-1):
        if "[AutoDispatch] Loop scheduled" in lines[i] and lines[i+1].strip() == "});":
            lines[i] = replacement
            lines[i+1] = ""
            found = True
            break
    if found:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write("\\n".join(lines))
        print("Injected via line-by-line match.")
    else:
        print("Could not find target even with line-by-line.")
