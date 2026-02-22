# ==========================================================
# AUTO-ELEVATE: Check for Administrator Privileges
# ==========================================================
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Elevando privilegios a Administrador..." -ForegroundColor Yellow
    $arguments = "-ExecutionPolicy Bypass -File `"$PSCommandPath`""
    Start-Process powershell.exe -ArgumentList $arguments -Verb RunAs
    exit
}

# Script de Mantenimiento y Arranque Agentico (Vuela)
# Limpia el sistema y arranca el Orquestador + Visual Bridge

$ProjectRoot = "c:\Users\User\Desktop\Saili8ng School Test"
$MaxSizeBytes = 1MB

# 1. Limpiar procesos de red bloqueados (> 5 minutos)
Get-Process ssh, git -ErrorAction SilentlyContinue | Where-Object { (Get-Date) - $_.StartTime -gt (New-TimeSpan -Minutes 5) } | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. Limpiar logs pesados
$LogFiles = Get-ChildItem -Path $ProjectRoot -Filter "*.log" -Recurse -ErrorAction SilentlyContinue
$TxtOutputs = Get-ChildItem -Path $ProjectRoot -Filter "*_output.txt" -ErrorAction SilentlyContinue

foreach ($file in ($LogFiles + $TxtOutputs)) {
    if ($file -and $file.Length -gt $MaxSizeBytes) {
        Remove-Item $file.FullName -Force
        Write-Host "Limpiado: $($file.Name) ($([math]::Round($file.Length / 1MB, 1)) MB)" -ForegroundColor Gray
    }
}

# 3. Limpiar carpeta temporal de Antigravity
if (Test-Path "$ProjectRoot\antigravity\TRASH") {
    Remove-Item "$ProjectRoot\antigravity\TRASH\*" -Recurse -Force -ErrorAction SilentlyContinue
}

# 4. Iniciar Visual Bridge (Tunnel) en segundo plano
Write-Host "[BRIDGE] Iniciando Visual Bridge en segundo plano..." -ForegroundColor Cyan
$BridgeScript = "$ProjectRoot\scripts\visual-bridge.ps1"
if (Test-Path $BridgeScript) {
    Start-Process powershell.exe -ArgumentList "-ExecutionPolicy Bypass -File `"$BridgeScript`"" -WindowStyle Minimized
    Write-Host "[BRIDGE] Proceso arrancado en ventana minimizada." -ForegroundColor Cyan
}
else {
    Write-Host "[WARN] No se encontro el script visual-bridge.ps1" -ForegroundColor Yellow
}

# 5. Verificar si el Orquestador ya esta corriendo
$OrchProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -match "node" -or $_.Path -match "npm"
}

if (-not $OrchProcess) {
    Write-Host "[ORCH] Iniciando Orquestador..." -ForegroundColor Cyan
    Start-Process powershell.exe -ArgumentList "-NoExit -Command `"cd '$ProjectRoot\orchestration'; npm start`"" -WindowStyle Normal
}
else {
    Write-Host "[ORCH] El Orquestador ya esta corriendo (PID: $($OrchProcess[0].Id))" -ForegroundColor Green
}

Write-Host "[OK] Vuela completado. El sistema esta en el aire." -ForegroundColor Green
