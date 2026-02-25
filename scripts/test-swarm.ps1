$webhookUrl = "https://n8n.srv1368175.hstgr.cloud/webhook/swarm-dispatch"
$task = "IMPLEMENTACION: Crear un sistema de perfiles de usuario. 1. Contratos en /contracts. 2. Tabla 'profiles' en Supabase y API /api/profiles. 3. Pagina de perfil en el frontend."

Write-Host "🚀 Triggering Jules Swarm E2E Test..." -ForegroundColor Cyan
Invoke-RestMethod -Method Post -Uri $webhookUrl -ContentType "application/json" -Body (@{
        task = $task
    } | ConvertTo-Json)

Write-Host "✅ Swarm Dispatcher Triggered. Monitor n8n/Telegram for progress." -ForegroundColor Green
