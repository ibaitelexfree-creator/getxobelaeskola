# ==========================================================
# AUTO-ELEVATE: Check for Administrator Privileges
# ==========================================================
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Elevando privilegios a Administrador para Mission Control..." -ForegroundColor Yellow
    $arguments = "-ExecutionPolicy Bypass -File `"$PSCommandPath`""
    Start-Process powershell.exe -ArgumentList $arguments -Verb RunAs
    exit
}

$ProjectRoot = "c:\Users\User\Desktop\Saili8ng School Test"
$MissionDir = "$ProjectRoot\mission-control"

Write-Host "[MISSION] Iniciando Mission Control Dashboard (Admin)..." -ForegroundColor Cyan
Set-Location $MissionDir
npm run dev
