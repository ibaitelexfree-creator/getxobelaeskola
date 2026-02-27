# n8n Workflow: Task Classifier (RAG-based)

Este workflow analiza la descripción de una tarea y utiliza RAG (Qdrant) para clasificarla y determinar los agentes necesarios.

### Trigger
- **Type**: HTTP Request (WebHook) o Execute Workflow.
- **Input**: `{ "prompt": "Descripción de la tarea" }`

### Nodos Requeridos
1. **Embedding Generator**: Convierte el prompt en un vector (usando OpenAI o Gemini).
2. **Qdrant Search**: Busca contextos similares en la colección `swarm_knowledge`.
3. **LLM Classifier (Gemini Flash)**: 
   - **System Prompt**: "Clasifica esta tarea en: FE, BE, FULLSTACK, ARCHITECT, o DevOps."
   - **Context**: Resultados de Qdrant.
4. **Set Variables**: Define `required_agents` (ej: `['architect', 'data', 'ui']`).

### Output
- `{ "classification": "FE", "confidence": 0.95, "agents": [...] }`
