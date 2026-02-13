# 🎓 Sistema de Evaluaciones con Control de Intentos

## Componentes Actualizados

### ✅ CooldownScreen
**Ubicación:** `src/components/academy/evaluation/CooldownScreen.tsx`

Componente que muestra la pantalla de bloqueo cuando un alumno no puede iniciar una evaluación.

**Props:**
```typescript
{
  reason: 'cooldown_active' | 'max_attempts_window' | 'max_attempts_total' | 'attempt_in_progress';
  retryAfterSeconds: number; // -1 = bloqueado permanentemente
  onRetry: () => void; // Callback cuando el contador llegue a 0
}
```

**Características:**
- ✅ Contador regresivo en tiempo real
- ✅ Mensajes personalizados según el tipo de bloqueo
- ✅ Iconos distintivos para cada tipo
- ✅ Botón automáticamente habilitado cuando el contador llega a 0
- ✅ Manejo de bloqueos permanentes (retry_after_seconds === -1)

**Mensajes por tipo:**
| Reason | Título | Mensaje |
|--------|--------|---------|
| `cooldown_active` | Periodo de Enfriamiento | Debes esperar antes de volver a intentarlo |
| `max_attempts_window` | Límite de Intentos Alcanzado | Has alcanzado el límite de intentos en este periodo |
| `max_attempts_total` | Intentos Agotados | Has agotado el número máximo de intentos |
| `attempt_in_progress` | Evaluación en Curso | Ya tienes una evaluación en curso |

---

### 📦 EvaluationContainer (Ejemplo de Integración)
**Ubicación:** `src/components/academy/evaluation/EvaluationContainer.tsx`

Componente de ejemplo que muestra cómo integrar `CooldownScreen` con el flujo de evaluaciones.

**Flujo de funcionamiento:**

1. **Usuario hace click en "Iniciar Evaluación"**
   ```typescript
   POST /api/academy/evaluation/start
   Body: { evaluacion_id: "uuid" }
   ```

2. **Backend responde con uno de dos formatos:**

   **Caso A: Bloqueado**
   ```json
   {
     "allowed": false,
     "reason": "cooldown_active",
     "retry_after_seconds": 120
   }
   ```
   → Se muestra `<CooldownScreen />`

   **Caso B: Permitido**
   ```json
   {
     "allowed": true,
     "intento": { "id": "..." },
     "preguntas": [...]
   }
   ```
   → Se inicia el quiz normalmente

3. **Cuando el contador llega a 0**
   - El botón se habilita
   - Al hacer click, se vuelve a llamar a `startEvaluation()`
   - El backend vuelve a verificar (nunca confiar en el frontend)

---

## 🛠️ Cómo Implementar en tus Páginas

### Opción 1: Usar EvaluationContainer directamente
```tsx
import EvaluationContainer from '@/components/academy/evaluation/EvaluationContainer';

export default function UnidadPage({ unitId }: { unitId: string }) {
  return (
    <div>
      <h1>Quiz de Unidad</h1>
      <EvaluationContainer 
        evaluacionId={unitId}
        onComplete={() => router.push('/dashboard')}
      />
    </div>
  );
}
```

### Opción 2: Integrar CooldownScreen en tu componente existente
```tsx
import { useState } from 'react';
import CooldownScreen from '@/components/academy/evaluation/CooldownScreen';
import { BlockInfo } from '@/components/academy/evaluation/types';

export default function MiQuiz() {
  const [blockInfo, setBlockInfo] = useState<BlockInfo | null>(null);

  const iniciarQuiz = async () => {
    const res = await fetch('/api/academy/evaluation/start', {
      method: 'POST',
      body: JSON.stringify({ evaluacion_id: 'xxx' })
    });
    
    const data = await res.json();
    
    if (data.allowed === false) {
      setBlockInfo({
        allowed: false,
        reason: data.reason,
        retry_after_seconds: data.retry_after_seconds
      });
      return;
    }
    
    // Continuar con el quiz...
  };

  if (blockInfo) {
    return (
      <CooldownScreen
        reason={blockInfo.reason}
        retryAfterSeconds={blockInfo.retry_after_seconds}
        onRetry={iniciarQuiz}
      />
    );
  }

  return <div>Quiz normal...</div>;
}
```

---

## 🔒 Seguridad

**IMPORTANTE:** El frontend NUNCA debe saltarse las validaciones.

✅ **Correcto:**
- Llamar siempre a `/api/academy/evaluation/start` antes de mostrar preguntas
- Respetar el estado `allowed: false`
- Dejar que el backend gestione los tiempos

❌ **Incorrecto:**
- Guardar preguntas en localStorage y reutilizarlas
- Ocultar el bloqueo y mostrar el quiz de todos modos
- Implementar el countdown solo en frontend sin verificar en backend

---

## 📊 Estados del Sistema

```
idle → loading → blocked → (countdown) → idle
                    ↓
                  active → submitting → complete
```

| Estado | Descripción | Componente |
|--------|-------------|------------|
| `idle` | Sin evaluación activa | Botón "Iniciar" |
| `loading` | Llamando al backend | Spinner |
| `blocked` | No puede iniciar (cooldown/límite) | `<CooldownScreen />` |
| `active` | Quiz en curso | `<QuizView />` |
| `submitting` | Enviando respuestas | Spinner |
| `complete` | Terminado | `<ResultScreen />` |

---

## 🧪 Testing

Para probar el sistema:

1. **Cooldown de 2 minutos (Quiz):**
   - Fallar un quiz de unidad
   - Intentar iniciarlo de nuevo inmediatamente
   - Debería aparecer el countdown de 00:02:00

2. **Límite de ventana (Examen de Módulo):**
   - Iniciar un examen de módulo 3 veces en menos de 24h
   - El 4to intento debería mostrar "max_attempts_window"
   - El mensaje indicará cuándo se liberará el primer slot

3. **Bloqueo permanente (Examen Final):**
   - Agotar todos los intentos permitidos
   - Debería mostrar "max_attempts_total"
   - retry_after_seconds debería ser -1
   - El botón permanecerá deshabilitado

---

## 📝 Tipos Actualizados

Ver `src/components/academy/evaluation/types.ts` para los tipos completos.

```typescript
export type BlockReason = 
  | 'cooldown_active' 
  | 'max_attempts_window' 
  | 'max_attempts_total' 
  | 'attempt_in_progress';

export interface BlockInfo {
  allowed: false;
  reason: BlockReason;
  retry_after_seconds: number;
}
```

---

**Última actualización:** Fase 5 - Sistema de Cooldowns completado
