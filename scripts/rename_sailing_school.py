import os
import re

def replace_in_file(file_path, replacements):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = content
        for old, new in replacements.items():
            new_content = re.sub(re.escape(old), new, new_content, flags=re.IGNORECASE if old.islower() else 0)

        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated: {file_path}")
    except Exception as e:
        pass # Skip binaries or errors

replacements = {
    "Getxo Bela Eskola": "Getxo Bela Eskola",
    "Clases de vela": "Clases de vela",
    "Experiencia de Vela": "Experiencia de Vela",
    "getxobelaeskola": "getxobelaeskola",
    "getxo-bela-eskola": "getxo-bela-eskola"
}

target_dirs = ['src', 'scripts', 'orchestration', 'infra', 'supabase/migrations']
exclude_dirs = ['node_modules', '.git', '.next', 'backups']

for target_dir in target_dirs:
    target_path = os.path.join(r'C:\Users\User\Desktop\getxobelaeskola', target_dir)
    if not os.path.exists(target_path): continue

    for root, dirs, files in os.walk(target_path):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.sql', '.yml', '.yaml', '.sh', '.ps1', '.py', '.txt', '.env', '.example')):
                file_path = os.path.join(root, file)
                replace_in_file(file_path, replacements)
