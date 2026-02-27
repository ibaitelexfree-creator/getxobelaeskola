# n8n Workflow: Rate Guard (Sub-workflow)

Este workflow actúa como el guardián de las APIs de IA (Gemini y Grok), gestionando los límites de uso y esperas activas.

### Trigger
- **Type**: Execute Workflow (Callable)
- **Input**: `{ "model": "gemini_flash | grok_free", "task_id": "UUID" }`

### Nodos Requeridos
1. **Redis Get**: Leer la llave `rate:[model]:hour`.
2. **If (Limit Reached)**:
   - Si `count >= 55` (Gemini) o `15` (Grok):
     - **Redis TTL**: Obtener tiempo para el reset.
     - **Wait**: Esperar `TTL + 2` segundos.
     - **Loop**: Volver al inicio del check.
3. **Redis Incr**: Incrementar contador.
4. **Postgres Log**: Insertar en `sw2_rate_limit_log`.

### Output
- `{ "status": "APPROVED", "waited_seconds": N }`
