# deploy.ps1 - Windows Wrapper for SaaS Infrastructure Deploy
# This script attempts to run the bash deployment script via WSL or prints instructions.

$Action = $args[0]
$ScriptPath = "./infra/scripts/deploy.sh"

if ($null -eq $Action) {
    Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║      🚀 SaaS Infrastructure Deploy         ║"
    Write-Host "║         Windows Wrapper (PS1)              ║"
    Write-Host "╚════════════════════════════════════════════╝"
    Write-Host ""
    Write-Host "Uso: ./infra/scripts/deploy.ps1 [full|n8n|db|backup|status|stop]"
    Write-Host ""
    Write-Host "Opciones comunes:"
    Write-Host "  full   - Deploy completo"
    Write-Host "  status - Ver estado"
    Write-Host "  stop   - Parar todo"
    return
}

# Check if WSL is available
if (Get-Command "wsl" -ErrorAction SilentlyContinue) {
    Write-Host "🚀 Ejecutando via WSL..." -ForegroundColor Green
    wsl bash $ScriptPath $Action
}
else {
    Write-Host "❌ WSL no detectado. Este kit de infra está diseñado para Linux/Docker." -ForegroundColor Red
    Write-Host "Si tienes Docker Desktop en Windows, puedes intentar ejecutar los comandos manualmente:"
    Write-Host "cd infra; docker-compose up -d"
}
