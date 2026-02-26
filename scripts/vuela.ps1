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

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$MaxSizeBytes = 1MB

try {
    # 1. Limpiar procesos de red bloqueados (> 5 minutos)
    Get-Process ssh, git -ErrorAction SilentlyContinue | Where-Object { (Get-Date) - $_.StartTime -gt (New-TimeSpan -Minutes 5) } | Stop-Process -Force -ErrorAction SilentlyContinue

    # 2. Limpiar logs y archivos de salida pesados
    $LogFiles = Get-ChildItem -Path $ProjectRoot -Filter "*.log" -Recurse -ErrorAction SilentlyContinue
    $TxtOutputs = Get-ChildItem -Path $ProjectRoot -Filter "*_output.txt" -Recurse -ErrorAction SilentlyContinue

    foreach ($file in ($LogFiles + $TxtOutputs)) {
        if ($file -and $file.Length -gt $MaxSizeBytes) {
            try {
                Remove-Item $file.FullName -Force -ErrorAction Stop
                Write-Host "Limpiado: $($file.Name) ($([math]::Round($file.Length / 1MB, 1)) MB)" -ForegroundColor Gray
            }
            catch {
                Write-Host "[WARN] No se pudo borrar $($file.Name)" -ForegroundColor Yellow
            }
        }
    }

    # 3. Limpiar carpeta temporal de Antigravity
    if (Test-Path "$ProjectRoot\antigravity\TRASH") {
        Remove-Item "$ProjectRoot\antigravity\TRASH\*" -Recurse -Force -ErrorAction SilentlyContinue
    }

    # 4. Iniciar Visual Bridge (Tunnel) en segundo plano
    Write-Host "[BRIDGE] Iniciando Visual Bridge..." -ForegroundColor Cyan
    $BridgeScript = "$ProjectRoot\scripts\visual-bridge.ps1"
    if (Test-Path $BridgeScript) {
        $BridgeProcess = Get-Process -Name "powershell" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "visual-bridge.ps1" }
        if (-not $BridgeProcess) {
            Start-Process powershell.exe -ArgumentList "-ExecutionPolicy Bypass -File `"$BridgeScript`"" -WindowStyle Minimized
            Write-Host "[BRIDGE] Proceso arrancado en ventana minimizada." -ForegroundColor Cyan
        }
        else {
            Write-Host "[BRIDGE] Ya en ejecucion." -ForegroundColor Green
        }
    }

    # 5. Detectar y reiniciar el Orquestador si es necesario
    Write-Host "[ORCH] Buscando procesos del Orquestador..." -ForegroundColor Cyan
    $OrchCommand = "index.js"
    $Processes = Get-CimInstance Win32_Process -Filter "name = 'node.exe'" | Where-Object { $_.CommandLine -match $OrchCommand }
    
    if ($Processes) {
        $DeadlockFound = $false
        foreach ($proc in $Processes) {
            # Si el proceso lleva mucho tiempo pero no hay logs recientes (check manual), podriamos considerarlo colgado
            # Por ahora, solo informamos, pero si el usuario pidio 'vuela' es para una limpieza total
            Write-Host "[ORCH] Encontrado proceso PID $($proc.ProcessId). Reiniciando para asegurar frescura..." -ForegroundColor Yellow
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
            $DeadlockFound = $true
        }
        
        if ($DeadlockFound) {
            Start-Sleep -Seconds 2
        }
    }

    # Arrancar Orquestador
    Write-Host "[ORCH] Iniciando Orquestador..." -ForegroundColor Cyan
    Start-Process powershell.exe -ArgumentList "-NoExit -Command `"cd '$ProjectRoot\orchestration'; npm start`"" -WindowStyle Normal

    Write-Host "[OK] Vuela completado. El sistema esta en el aire." -ForegroundColor Green
}
catch {
    Write-Host "❌ Error en Vuela: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
