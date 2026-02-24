
import re

file_path = 'src/components/academy/logbook/Logbook.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Remove unused imports
content = content.replace(', ChevronRight', '').replace(', Smile', '')

# 2. Add Interfaces
interfaces = """
interface WindConditions {
    nudos: string;
    direccion: string;
}

interface DiaryEntry {
    id: string;
    fecha: string;
    marina_salida?: string;
    tripulacion?: string;
    condiciones_viento?: WindConditions;
    maniobras?: string[];
    observaciones?: string;
    contenido?: string;
    tags?: string[];
}

interface Session {
    id: string;
    fecha: string;
    tipo: string;
    embarcacion: string;
    duracion_h: number;
    verificado: boolean;
}

interface Statistics {
    horas_totales: number;
}

interface UserProfile {
    full_name: string;
}

interface OfficialData {
    horas: Session[];
    estadisticas: Statistics;
    user: UserProfile;
    habilidades?: any[];
}

interface Skill {
    id: string;
    nombre_es: string;
    descripcion_es: string;
    icono: string;
    categoria: string;
    obtenida?: boolean;
    fecha_obtencion?: string;
}
"""

# Insert interfaces after imports
import_end_idx = content.find('// Direct dynamic import')
content = content[:import_end_idx] + interfaces + '\n' + content[import_end_idx:]

# 3. Replace useState<any> with typed versions
content = content.replace('useState<any>(null)', 'useState<OfficialData | null>(null)')
content = content.replace('useState<any[]>([])', 'useState<DiaryEntry[]>([])', 1) # First one is diaryEntries
content = content.replace('useState<any[]>([])', 'useState<Skill[]>([])', 1) # Second one is allSkills

# 4. Fix other any usages
# sessions map
content = content.replace('sessions.map((session: any)', 'sessions.map((session: Session)')

# diaryEntries map
content = content.replace('diaryEntries.map((entry: any)', 'diaryEntries.map((entry: DiaryEntry)')

# skills map
# The skills mapping is a bit complex: (allSkills.length > 0 ? allSkills : (officialData?.habilidades || [])).map((h: any)
# We can try to replace it, but "h" might be a Skill object or a wrapper {habilidad: Skill, ...}
# Let's check the code: const skill = h.habilidad || h;
# So h can be any. Let's leave that one as any or type it as any explicitly to avoid error if we want, but better to fix.
# The linter complains about "Unexpected any".
# I'll replace `(h: any)` with `(h: Skill | { habilidad: Skill } | any)` but `any` will still trigger lint.
# I'll use `(h: any)` -> `(h: unknown)` and cast inside? No, that's messy.
# I will use `(h: any)` but suppress the warning for that specific line if needed, or just leave it if I can't easily type it without more info.
# Actually, the linter complained about lines 34, 35, 36 which are the useState calls.
# It also complained about line 125, 126, 127 etc? No, I need to see the line numbers again.

# Let's just fix the useState ones first, as those were the explicit errors I saw in the grep output (lines 34, 35, 36).
# 34:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
# 35:54  ...
# 36:48  ...

# Also:
# 605:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any (sessions.map)
# 723:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any (activeTab click handler cast)

# Fix activeTab cast
content = content.replace('setActiveTab(tab.id as any)', 'setActiveTab(tab.id as "official" | "map" | "skills" | "diary")')

# Fix sessions map
# content = content.replace('sessions.map((session: any)', 'sessions.map((session: Session)') # Already added above

# Fix diaryEntries map
# content = content.replace('diaryEntries.map((entry: any)', 'diaryEntries.map((entry: DiaryEntry)') # Already added above

with open(file_path, 'w') as f:
    f.write(content)
