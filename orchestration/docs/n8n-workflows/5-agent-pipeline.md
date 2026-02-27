# n8n Workflow: 5-Agent Pipeline (Sequential Reflection)

Este workflow se activa para tareas de alta complejidad (>0.7) o cuando un Jules individual falla tras 3 reintentos.

### Trigger
- **Type**: Webhook (POST)
- **URL**: `${N8N_PIPELINE_5AGENTS_URL}`

### Estructura del Pipeline
1. **Node 1: Agent Classifier (Gemini Flash)**
   - Determina el dominio y la estrategia inicial.
2. **Node 2: Agent Analyzer (Gemini Flash)**
   - Desglosa los requerimientos técnicos y dependencias.
3. **Node 3: Agent Validator (Gemini Flash)**
   - Busca alucinaciones en el análisis comparándolo con el RAG de Qdrant.
4. **Node 4: Agent Critic (Gemini Flash)**
   - Genera el código final y detecta posibles fallos de seguridad (OWASP).
5. **Node 5: Agent Synthesis (Gemini Flash)**
   - Formatea la respuesta final en el JSON esperado por el Orchestrator.

### Configuración del Webhook Node
- **HTTP Method**: POST
- **Response Mode**: On Last Node
- **Response Data**: All Item Data
