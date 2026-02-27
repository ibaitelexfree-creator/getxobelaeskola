# n8n Workflow: Grok RCA (Root Cause Analysis)

Analizador de fallos de último recurso que utiliza xAI Grok para diagnosticar por qué falló un Jules y proponer una solución.

### Trigger
- **Type**: Error Trigger / Execute Workflow.
- **Input**: `{ "error": "...", "logs": "...", "context": "..." }`

### Nodos Requeridos
1. **Grok-Beta LLM**:
   - **Task**: Realizar un análisis de causa raíz.
   - **Output**: JSON con `root_cause`, `fix_strategy` y `confidence`.
2. **Postgres Log**: Guarda el diagnóstico en `sw2_errors`.
3. **Branch Logic**:
   - Si `confidence > 0.8`: Reintentar tarea con el nuevo contexto de Grok.
   - Si `confidence <= 0.8`: Escalar al **5-Agent Pipeline**.

### Output
- `{ "diagnostics": "...", "strategy": "RETRY | ESCALATE" }`
