import os

file_path = r'c:\Users\User\Desktop\Saili8ng School Test\orchestration\index.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix module imports and function calls
content = content.replace("./lib/dev-task-scanner.js", "./lib/suggested-tasks.js")
content = content.replace("generateSuggestedTaskFixPrompt", "generateFixPrompt")

# Fix potential double escape in telegram message (from previous injection)
content = content.replace("\\\\`{task.location}\\\\`", "`{task.location}`")
content = content.replace("\\\\n", "\\n")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("References in index.js updated successfully.")
