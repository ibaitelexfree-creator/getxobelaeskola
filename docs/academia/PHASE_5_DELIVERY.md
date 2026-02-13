# 🚀 FASE 5: Entrega - Sistema de Cooldowns

## 1. Migración SQL
Archivo creado: `supabase/migrations/007_evaluaciones_cooldowns.sql`
Añade las columnas de configuración y establece los valores por defecto:
- **Quiz:** 2 min cooldown, intentos infinitos.
- **Módulo:** 3 intentos/24h.
- **Final:** 2 intentos/48h.

## 2. Endpoints Actualizados
- **`POST /api/academy/evaluation/start`**: Ahora verifica proactivamente:
  1. Límite de intentos en la ventana de tiempo definida (`intentos_ventana_limite`).
  2. Cooldown tras fallo (`cooldown_minutos`) verificando el último intento completado.
  3. Límite total histórico (`intentos_maximos`) si existe.
- **`POST /api/academy/evaluation/submit`**: Verificado. Registra `fecha_completado` y `aprobado` correctamente, lo cual alimenta la lógica de `start`.

## 3. Ejemplos de Respuesta JSON

### Caso A: En Cooldown (Quiz de unidad fallado recientemente)
```json
{
  "allowed": false,
  "reason": "cooldown",
  "retry_after_seconds": 115
}
```
*Interpretación:* El alumno falló hace 5 segundos. Debe esperar 115 segundos más (total 2 min).

### Caso B: Límite Alcanzado (Examen de módulo)
```json
{
  "allowed": false,
  "reason": "limit_reached",
  "retry_after_seconds": 3600
}
```
*Interpretación:* El alumno agotó sus 3 intentos de las últimas 24h. El intento más antiguo de la ventana caduca en 1 hora, liberando un slot.

## 4. Seguridad Anti-Spam
El sistema evita intentos forzados porque:
1. **Validación Backend Única:** La lógica reside exclusivamente en el servidor (`start`). El frontend solo recibe sí/no.
2. **Consultas Atómicas:** Se consultan los intentos reales en la base de datos (`intentos_evaluacion`) antes de crear uno nuevo.
3. **Bloqueo por Tiempo Real:** Se usa `NOW()` del servidor comparado con `fecha_completado` o `fecha_inicio` almacenada, imposible de manipular por el cliente.
4. **Sin "Token" de Cliente:** No confiamos en cookies o local storage para contar intentos; todo es conteo SQL directo.
