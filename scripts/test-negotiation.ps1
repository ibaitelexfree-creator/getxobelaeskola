# 🧠 Test de Negociación de Swarm
# Simula una petición desde el Control Panel o la App

$url = "http://localhost:3002/api/v1/swarm/negotiate"

# Ejemplo 1: Tarea Completa (Nueva funcionalidad)
$body1 = @{
    prompt     = "Crear un nuevo módulo de seguimiento de rutas con base de datos Supabase y una interfaz visual en React con mapas interactivos."
    complexity = "high"
    dispatch   = $true # Trigger n8n dispatcher!
} | ConvertTo-Json

Write-Host "--- Propuesta para Nueva Funcionalidad Completa ---" -ForegroundColor Cyan
Invoke-RestMethod -Method Post -Uri $url -ContentType "application/json" -Body $body1 | ConvertTo-Json

# Ejemplo 2: Solo UI/Frontend
$body2 = @{
    prompt     = "Refactorizar los componentes de la cabecera para que sean responsive y añadir animaciones de Framer Motion."
    complexity = "medium"
    dispatch   = $false
} | ConvertTo-Json

Write-Host "`n--- Propuesta para Refactor de UI ---" -ForegroundColor Cyan
Invoke-RestMethod -Method Post -Uri $url -ContentType "application/json" -Body $body2 | ConvertTo-Json
