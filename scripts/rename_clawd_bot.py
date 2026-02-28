import os

def rename_clawd_bot():
    root_dir = r"c:\Users\User\Desktop\getxobelaeskola"
    excludes = ["node_modules", ".git", ".next", "package-lock.json", "backups", ".jar", ".pdf", ".mp3", ".png", ".jpg", ".log"]
<<<<<<< HEAD
    
=======

>>>>>>> origin/jules/fix-lint-errors-17071256425989174302
    transformations = {
        "ClawdeBot": "ClawdeBot",
        "ClawdeBot": "ClawdeBot",
        "Clawde": "Clawde",
        "ClawdeBot": "ClawdeBot",
        "Clawdebot": "Clawdebot",
        "clawdebot": "clawdebot",
        "Clawde-": "Clawde-",
        "clawde-": "clawde-",
        "CLAWDEBOT": "CLAWDEBOT"
    }
<<<<<<< HEAD
    
=======

>>>>>>> origin/jules/fix-lint-errors-17071256425989174302
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in ["node_modules", ".git", ".next"]]
        for file in files:
            if file.endswith((".png", ".jpg", ".jpeg", ".ico", ".db", ".mp3", ".log", ".pdf", ".jar", ".zip")):
                continue
<<<<<<< HEAD
                
            file_path = os.path.join(root, file)
            
=======

            file_path = os.path.join(root, file)

>>>>>>> origin/jules/fix-lint-errors-17071256425989174302
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except Exception as e:
                continue

            new_content = content
            for old, new in transformations.items():
                if old in new_content:
                    new_content = new_content.replace(old, new)
<<<<<<< HEAD
            
=======

>>>>>>> origin/jules/fix-lint-errors-17071256425989174302
            if new_content != content:
                try:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Modified: {file_path}")
                except Exception as e:
                    print(f"Failed to write: {file_path}")

if __name__ == "__main__":
    rename_clawd_bot()
