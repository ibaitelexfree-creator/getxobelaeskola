import os
import yaml

workflows_dir = '.github/workflows'
concurrency_tpl = """
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
"""

for filename in os.listdir(workflows_dir):
    if filename.endswith('.yml') or filename.endswith('.yaml'):
        filepath = os.path.join(workflows_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Add concurrency if missing
        if 'concurrency:' not in content:
            # Insert after name: or on:
            if 'name:' in content:
                content = content.replace('name:', f'name:', 1)
                # Find the end of name line
                name_end = content.find('\n', content.find('name:'))
                content = content[:name_end+1] + concurrency_tpl.strip() + '\n' + content[name_end+1:]
            elif 'on:' in content:
                # Insert before on:
                content = concurrency_tpl.strip() + '\n' + content
        
        # 2. Add workflow_dispatch if missing
        if 'workflow_dispatch:' not in content and 'on:' in content:
            # Check indentation and format
            if 'push:' in content:
                # Add workflow_dispatch as a sibling to push
                content = content.replace('on:', 'on:\n  workflow_dispatch: {}', 1)
            else:
                # Add to on: block
                content = content.replace('on:', 'on:\n  workflow_dispatch: {}', 1)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Workflows updated with concurrency and workflow_dispatch")
