# 🛡️ PLAN TÉCNICO: Sistema de Bloqueo de Contenido Inteligente (Recursive Guard)

## 1. Visión General
El objetivo es garantizar la integridad del flujo de aprendizaje. Aunque una unidad individual pueda aparecer como "disponible" en la base de datos (por ejemplo, por una migración manual), no debe ser accesible si su Módulo, Curso o Nivel superior está bloqueado.

## 2. Arquitectura de Seguridad

### A. Capa de Datos (Supabase/PostgreSQL)
Se optimizará el motor de desbloqueo para que el mapa de estados devuelto al frontend ya contenga el estado "efectivo".
- **Nueva Función RPC**: `obtener_estado_desbloqueo_recursivo(p_alumno_id)`.
- **Lógica**: Utilizará CTEs (Common Table Expressions) o joins jerárquicos para propagar el estado `bloqueado` hacia abajo. Si un padre está bloqueado, todos sus hijos heredan el estado `bloqueado` independientemente de su valor individual en `progreso_alumno`.

### B. Capa Académica (Frontend Hook)
Creación de un hook `useAcademyAccess` que proporcione una interfaz limpia para que los componentes decidan si renderizarse o mostrar un estado de bloqueo.

```typescript
const { canAccess, status, getEffectiveStatus } = useAcademyAccess();

// Ejemplo de uso:
if (!canAccess('unit', 'unit-uuid')) return <AccessDenied />;
```

### C. Capa de Navegación (Guard Component)
Implementar un componente `AcademyGuard` que envuelva las rutas dinámicas de la academia.

Rutas a proteger:
- `/academy/level/[id]`
- `/academy/course/[slug]`
- `/academy/module/[id]`
- `/academy/unit/[id]`

## 3. Implementación Detallada

### Paso 1: SQL Jerárquico
Modificar la lógica de obtención de estados. El estado efectivo de una entidad será:
`Efectivo = (Parent.Efectivo == 'bloqueado') ? 'bloqueado' : DB.Estado`

### Paso 2: Store Global de Autorización
Utilizar un store (Zustand o Context) para cachear el mapa de desbloqueo y evitar peticiones redundantes al navegar entre unidades del mismo módulo.

### Paso 3: Middleware de Aplicación (Opcional)
Si bien el Middleware de Next.js es potente, para verificar estados de base de datos complejos (con dependencias de padres) es más eficiente realizarlo en el **Server Component** de la página o mediante **Layouts** que compartan la validación.

## 4. Casos de Uso Críticos
1. **Salto Directo via URL**: Si un usuario pega la URL de una unidad avanzada sin haber completado el nivel 1, el `AcademyGuard` debe interceptar y redirigir.
2. **Revocación Administrativa**: Si el instructor bloquea un curso entero para mantenimiento, todas las unidades hijas deben quedar inaccesibles instantáneamente.
3. **Niveles Transversales**: La lógica debe respetar que los niveles 6 y 7 solo dependen del nivel 2, rompiendo la secuencia lineal 1-5 pero manteniendo la jerarquía padre-hijo interna.

---
**¿Deseas que proceda con la creación de la nueva función SQL y el AcademyGuard?**
