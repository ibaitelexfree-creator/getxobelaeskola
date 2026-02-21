
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

Write-Host "✅ Mantenimiento completado. El sistema debería estar más ligero ahora."
