# ============================================================
# 🚀 Getxo Bela Eskola — Optimización de máquina local
# Ejecutar como Administrador: Right-click > Run as Administrator
# ============================================================

Write-Host "`n=== 🚀 OPTIMIZACIÓN DE MÁQUINA LOCAL ===" -ForegroundColor Cyan

# 1. Plan de energía: Ultimate Performance
Write-Host "`n[1/3] Activando plan de energía 'Ultimate Performance'..." -ForegroundColor Yellow
try {
    $existing = powercfg /list | Select-String "e9a42b02-d5df-448d-aa00-03f14749eb61"
    if (-not $existing) {
        powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
    }
    powercfg -setactive e9a42b02-d5df-448d-aa00-03f14749eb61
    Write-Host "  ✅ Plan 'Ultimate Performance' activo." -ForegroundColor Green
}
catch {
    Write-Host "  ⚠️ No se pudo activar Ultimate Performance. Intentando 'Alto rendimiento'..." -ForegroundColor Yellow
    try {
        powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
        Write-Host "  ✅ Plan 'Alto rendimiento' activo." -ForegroundColor Green
    }
    catch {
        Write-Host "  ❌ Error: Ejecuta como Administrador." -ForegroundColor Red
    }
}

# 2. Desactivar servicios de telemetría (reducen CPU disponible)
Write-Host "`n[2/3] Desactivando servicios de telemetría..." -ForegroundColor Yellow
$services = @("DiagTrack", "dmwappushservice")
foreach ($svc in $services) {
    try {
        $s = Get-Service -Name $svc -ErrorAction SilentlyContinue
        if ($s -and $s.Status -eq 'Running') {
            Stop-Service -Name $svc -Force -ErrorAction SilentlyContinue
            Set-Service -Name $svc -StartupType Disabled -ErrorAction SilentlyContinue
            Write-Host "  ✅ $svc detenido y deshabilitado." -ForegroundColor Green
        }
        else {
            Write-Host "  ℹ️ $svc ya estaba detenido." -ForegroundColor DarkGray
        }
    }
    catch {
        Write-Host "  ⚠️ $svc no se puede gestionar (requiere Admin)." -ForegroundColor Yellow
    }
}

# 3. Verificación del estado actual
Write-Host "`n[3/3] Verificación del estado..." -ForegroundColor Yellow
$scheme = powercfg /getactivescheme
Write-Host "  Plan activo: $scheme" -ForegroundColor Cyan

# GPU check (para LM Studio / Ollama)
$gpu = Get-WmiObject Win32_VideoController | Select-Object -First 1 -ExpandProperty Name
Write-Host "  GPU detectada: $gpu" -ForegroundColor Cyan

# RAM
$ram = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 1)
Write-Host "  RAM total: ${ram} GB" -ForegroundColor Cyan

Write-Host "`n=== ✅ OPTIMIZACIÓN COMPLETADA ===" -ForegroundColor Green
Write-Host "Tip: Para revertir -> powercfg -setactive SCHEME_BALANCED`n" -ForegroundColor DarkGray
