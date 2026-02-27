# n8n Workflow: Jules Sequential Pipeline

Orquesta la ejecución secuencial de los agentes especializados (Relay Pattern) para completar un ticket de CI/CD.

### Trigger
- **Type**: HTTP Request (Orchestrator V2).
- **Input**: `{ "swarm_id": "UUID", "prompt": "..." }`

### Flujo de Ejecución (Relay)
1. **Architect Node**: 
   - Llama a `/api/v1/sessions` con rol `ARCHITECT`.
   - Genera esquema SQL y diseño de API.
2. **Data Master Node**: 
   - Llama a `/api/v1/sessions` con rol `DATA`.
   - Implementa controladores y migraciones usando el output del Architect.
3. **UI Engine Node**:
   - Llama a `/api/v1/sessions` con rol `UI`.
   - Crea componentes React/CSS basados en el diseño previo.

### Control de Errores
- Cada nodo tiene reintentos (max 3).
- Si un nodo falla críticamente, se dispara el **Grok RCA Workflow**.

### Output
- `{ "status": "COMPLETED", "artifact_urls": [...] }`
