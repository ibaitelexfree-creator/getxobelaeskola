
# Script de Mantenimiento Agéntico (Vuela)

$ProjectRoot = "c:\Users\User\Desktop\Saili8ng School Test"
$MaxSizeBytes = 1MB

# 1. Limpiar procesos de red bloqueados (> 5 minutos)
Get-Process ssh, git -ErrorAction SilentlyContinue | Where-Object { (Get-Date) - $_.StartTime -gt (New-TimeSpan -Minutes 5) } | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. Limpiar logs pesados
$LogFiles = Get-ChildItem -Path $ProjectRoot -Filter "*.log" -Recurse -ErrorAction SilentlyContinue
$TxtOutputs = Get-ChildItem -Path $ProjectRoot -Filter "*_output.txt" -ErrorAction SilentlyContinue

foreach ($file in ($LogFiles + $TxtOutputs)) {
    if ($file.Length -gt $MaxSizeBytes) {
        Remove-Item $file.FullName -Force
        Write-Host "Limpiado: $($file.Name) ($($file.Length / 1MB) MB)"
    }
}

# 3. Limpiar carpeta temporal de Antigravity
if (Test-Path "$ProjectRoot\antigravity\TRASH") {
    Remove-Item "$ProjectRoot\antigravity\TRASH\*" -Recurse -Force -ErrorAction SilentlyContinue
}

# 4. Iniciar Visual Bridge (Tunnel) automático
Write-Host "📡 Iniciando Visual Bridge (Tunnel) en segundo plano..." -ForegroundColor Cyan
$BridgeScript = "$ProjectRoot\scripts\visual-bridge.ps1"
if (Test-Path $BridgeScript) {
    Start-Process powershell.exe -ArgumentList "-ExecutionPolicy Bypass -File `"$BridgeScript`"" -WindowStyle Minimized
}

# 5. Verificar Orquestador
$OrchProcess = Get-Process node | Where-Object { $_.MainWindowTitle -match "antigravity-jules-orchestration" -or $_.CommandLine -match "orchestration" } -ErrorAction SilentlyContinue
if (-not $OrchProcess) {
    Write-Host "🚀 Iniciando Orquestador..." -ForegroundColor Cyan
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd `"$ProjectRoot\orchestration`"; npm start" -WindowStyle Normal
}

Write-Host "Mantenimiento y Arranque completado. El sistema esta en el aire." -ForegroundColor Green
