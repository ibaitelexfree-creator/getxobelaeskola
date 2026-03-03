import os

def fix_workflow(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Fix paths from mission-control to apps/mission-control-ui
    new_content = content.replace('mission-control/', 'apps/mission-control-ui/')
    new_content = new_content.replace('mission-control ', 'apps/mission-control-ui ')
    new_content = new_content.replace('cd mission-control', 'cd apps/mission-control-ui')

    if content != new_content:
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"Fixed {file_path}")

# List of workflows to check
workflows = [
    '.github/workflows/fast-lane.yml',
    '.github/workflows/mission-control-web.yml',
    '.github/workflows/mission-control-apk.yml'
]

for wf in workflows:
    if os.path.exists(wf):
        fix_workflow(wf)

# Fix inmobiliaria-demo imports by pointing them to local components
# The issue is that @/ points to root src/, but these apps have their own src/
# In inmobiliaria-demo/tsconfig.json, @/* is already mapped to ./src/*
# However, if tsc is run from root, it might be using root's tsconfig.

# Let's fix the imports in inmobiliaria-demo to use relative paths for now to be safe,
# or ensure they can resolve their own components.
# Actually, the error "Cannot find module '@/components/layout/Header'" suggests
# it's looking in the wrong place.

def fix_imports(dir_path):
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r') as f:
                    content = f.read()

                # Replace @/ with relative paths or fix the @/ to point to app-local src
                # Wait, if @/ is used in apps/inmobiliaria-demo/src/app/page.tsx,
                # it should resolve via apps/inmobiliaria-demo/tsconfig.json.
                # If CI runs 'npx tsc --noEmit' from root, it uses root tsconfig.

                # The fast-lane.yml runs 'npx tsc --noEmit' from root.
                # This is WRONG for monorepo apps.
                pass

# Fix fast-lane.yml to not typecheck apps from root or skip them
fix_lane = '.github/workflows/fast-lane.yml'
if os.path.exists(fix_lane):
    with open(fix_lane, 'r') as f:
        content = f.read()

    # Root TSC should probably exclude apps/
    # But wait, root tsconfig already excludes some things.

    # The error "Cannot find module '@/components/layout/Header'" in apps/inmobiliaria-demo/src/app/page.tsx
    # happens because root tsconfig's @/ points to root src/.

    # We should add a step in fast-lane to typecheck each app properly.

    new_content = content.replace(
        'run: npx tsc --noEmit && echo "✅ Root TypeScript Passed"',
        'run: npx tsc --noEmit --excludeDirectories apps && echo "✅ Root TypeScript Passed"'
    )
    # Actually tsc doesn't have --excludeDirectories like that.

    # Better: update root tsconfig.json to exclude apps/

    if content != new_content:
        # with open(fix_lane, 'w') as f:
        #    f.write(new_content)
        pass
