import json
import os

def categorize_prs(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        prs = json.load(f)
    
    clusters = {
        "Performance & Backend": [],
        "Refactoring & UI": [],
        "Testing & Logic": [],
        "Orchestration & System": [],
        "Other": []
    }
    
    for pr in prs:
        title = pr['title'].lower()
        num = pr['number']
        
        if any(kw in title for kw in ['optimize', 'performance', 'n+1', 'db-level', 'join', 'queries', 'query', '⚡']):
            clusters["Performance & Backend"].append(f"PR #{num}: {pr['title']}")
        elif any(kw in title for kw in ['refactor', 'component', 'ui', 'view', 'layout', 'css', '🧹', '♻️']):
            clusters["Refactoring & UI"].append(f"PR #{num}: {pr['title']}")
        elif any(kw in title for kw in ['test', 'coverage', 'edge-case', '🧪']):
            clusters["Testing & Logic"].append(f"PR #{num}: {pr['title']}")
        elif any(kw in title for kw in ['jules', 'orchestration', 'workflow', 'autofix', 'session']):
            clusters["Orchestration & System"].append(f"PR #{num}: {pr['title']}")
        else:
            clusters["Other"].append(f"PR #{num}: {pr['title']}")
            
    return clusters

if __name__ == "__main__":
    # Path to the large output file from step 750
    # Note: Use the absolute path provided in the previous turn
    input_file = r"C:\Users\User\.gemini\antigravity\brain\609a9eee-5979-42a4-a3b5-3fe3d3450e94\.system_generated\steps\750\output.txt"
    if os.path.exists(input_file):
        results = categorize_prs(input_file)
        print(json.dumps(results, indent=2))
    else:
        print(f"File not found: {input_file}")
