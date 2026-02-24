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

# Resolution Plan for explorer-parallel merge:
resolve_conflict('src/app/api/admin/explorer/route.ts', 'theirs')
resolve_conflict('src/app/api/admin/explorer/route.test.ts', 'theirs')
resolve_conflict('src/app/api/logbook/upload-track/route.test.ts', 'theirs')
resolve_conflict('src/components/academy/nomenclature/3d/Components.test.tsx', 'theirs')
resolve_conflict('src/lib/auth-guard.test.ts', 'ours')
resolve_conflict('src/lib/geospatial/water-check.test.ts', 'ours')
resolve_conflict('src/lib/geospatial/water-check.ts', 'ours')
resolve_conflict('src/lib/stripe.ts', 'theirs')
