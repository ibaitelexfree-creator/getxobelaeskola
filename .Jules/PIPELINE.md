# ⚓ PIPELINE — Orden de Ejecución del Jules Swarm

> **Lee esto PRIMERO en cada sesión.** Define el orden serial de trabajo.

---

## Orden de Ejecución

```
1. 🏛️ ARQUITECTO  →  2. 🗄️ DBA  →  3. 🎨 FRONTEND  →  4. 🧪 QA  →  5. 🔧 FIXER
```

## Reglas del Pipeline

### Regla 1: Orden Secuencial Estricto
- El DBA **NO empieza** hasta que el Arquitecto cree su PR.
- El Frontend **NO empieza** hasta que el DBA cree su PR.
- El QA **NO empieza** hasta que Frontend cree su PR.
- El Fixer **SOLO actúa** cuando el CI falla.

### Regla 2: Comunicación via Archivos
Cada agente, al terminar, escribe en `.jules/memory/{rol}/YYYY-MM-DD.md`:
```markdown
## Tarea completada: {nombre}
- **PR:** #{número}
- **Archivos tocados:** lista
- **Próximo agente:** {rol}
- **Notas para el siguiente:** texto libre
```

### Regla 3: Identidad Inmutable
- Cada agente LEE su archivo en `.jules/roles/{ROL}.md` al inicio.
- **NUNCA modifica** ese archivo.
- Si un agente necesita recordar algo, escribe en `.jules/memory/{rol}/`.

### Regla 4: Domain Isolation
| Agente | Solo toca |
| :--- | :--- |
| Arquitecto | Tipos, interfaces, routing |
| DBA | SQL, migraciones, RLS |
| Frontend | Componentes, páginas, estilos |
| QA | Tests (`.test.ts`, `.test.tsx`) |
| Fixer | Archivos con errores de CI |

### Regla 5: Resolución de Conflictos
Si dos agentes necesitan el mismo archivo:
1. El que tiene **prioridad de pipeline** (número más bajo) gana.
2. El otro espera o trabaja en una rama diferente.
3. Si es urgente: el humano decide.

## Límites Operativos

| Recurso | Límite por cuenta |
| :--- | :--- |
| Tareas diarias | 100 |
| Tareas simultáneas | 15 |
| Cuentas disponibles | 3 (se rotan para roles 4 y 5) |

## Asignación de Cuentas

| Cuenta | Rol Primario | Rol Secundario |
| :--- | :--- | :--- |
| Cuenta 1 | 🏛️ Arquitecto | 🧪 QA (cuando Arquitecto está libre) |
| Cuenta 2 | 🗄️ DBA | 🔧 Fixer (cuando DBA está libre) |
| Cuenta 3 | 🎨 Frontend | 🧪 QA (apoyo cuando hay muchos tests) |
