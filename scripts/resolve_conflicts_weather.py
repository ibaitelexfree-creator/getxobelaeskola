import os

def resolve_conflict(file_path, strategy='ours'):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    in_marker = False
    buffer_ours = []
    buffer_theirs = []
    current_buffer = None
    
    for line in lines:
        if line.startswith('<<<<<<<'):
            in_marker = True
            current_buffer = buffer_ours
        elif line.startswith('======='):
            current_buffer = buffer_theirs
        elif line.startswith('>>>>>>>'):
            in_marker = False
            if strategy == 'ours':
                new_lines.extend(buffer_ours)
            elif strategy == 'theirs':
                new_lines.extend(buffer_theirs)
            buffer_ours = []
            buffer_theirs = []
        elif in_marker:
            if current_buffer is not None:
                current_buffer.append(line)
        else:
            new_lines.append(line)
            
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

# Resolution Plan for weather-tests merge:
resolve_conflict('src/lib/weather.test.ts', 'theirs')
resolve_conflict('src/lib/weather.ts', 'theirs')

# Manual merge for GLOBAL_STATE.md
global_state_path = 'project_memory/GLOBAL_STATE.md'
if os.path.exists(global_state_path):
    with open(global_state_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Combined version of the tasks section
    combined_tasks = """| T-006 | Antigravity | NotebookLM Report Automation (Orchestrator + n8n + Evolution) | 2026-02-23 | completado |
| T-007 | Antigravity | Notion Premium Dashboard Refactor & Update | 2026-02-23 | completado |
| T-008 | Jules | Strengthen edge-case coverage for fetchWeatherData | 2026-02-24 | completado |
| T-009 | Jules | Optimize Dashboard Stats API | 2026-02-23 | completado |"""
    
    import re
    # Match the whole conflict block and replace it
    new_content = re.sub(r'<<<<<<< HEAD.*?>>>>>>> remotes/origin/feature/jules-weather-tests-10505488549723216955', combined_tasks, content, flags=re.DOTALL)
    
    with open(global_state_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
