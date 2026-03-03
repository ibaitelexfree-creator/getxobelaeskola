import re

with open('.github/workflows/fast-lane.yml', 'r') as f:
    content = f.read()

# Fix double NODE_OPTIONS
content = content.replace('NODE_OPTIONS="--max_old_space_size=4096" NODE_OPTIONS="--max_old_space_size=4096"', 'NODE_OPTIONS="--max_old_space_size=4096"')

with open('.github/workflows/fast-lane.yml', 'w') as f:
    f.write(content)
