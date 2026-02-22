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

# ==========================================================
# MISSION CONTROL: VISUAL BRIDGE (CLOUDFLARE TUNNEL)
# ==========================================================
# Levanta un tunel de Cloudflare SIN CONTRASENA.
# Compatible con el orquestador en local.
# ==========================================================

$Port = 3000
$BaseDir = "c:\Users\User\Desktop\Saili8ng School Test\antigravity"
$TunnelLog = "$BaseDir\tunnel.log"
$ErrorLog = "$BaseDir\tunnel_error.log"
$UrlFile = "$BaseDir\last_tunnel_url.txt"

# 0. Limpiar logs anteriores
foreach ($f in @($TunnelLog, $ErrorLog)) {
    if (Test-Path $f) { Clear-Content $f -ErrorAction SilentlyContinue }
}

# 1. Iniciar Cloudflare Tunnel
Write-Host "Iniciando Bridge Visual (Cloudflare) en puerto $Port..." -ForegroundColor Cyan
$TunnelProcess = Start-Process cmd `
    -ArgumentList "/c npx -y cloudflared tunnel --url http://127.0.0.1:$Port" `
    -PassThru -NoNewWindow `
    -RedirectStandardOutput $TunnelLog `
    -RedirectStandardError  $ErrorLog

# 2. Esperar a que la URL aparezca en los logs
Write-Host "Generando URL segura (Password-less)..." -ForegroundColor Yellow
$TunnelUrl = $null
$Timeout = 60
$Counter = 0

while ($null -eq $TunnelUrl -and $Counter -lt $Timeout) {
    Start-Sleep -Seconds 2
    foreach ($LogFile in @($TunnelLog, $ErrorLog)) {
        if (Test-Path $LogFile) {
            $Content = Get-Content $LogFile -ErrorAction SilentlyContinue
            if ($Content) {
                foreach ($Line in $Content) {
                    if ($Line -match "\|\s+(https://\S+\.trycloudflare\.com)\s+\|") {
                        $TunnelUrl = $Matches[1].Trim()
                        break
                    }
                }
            }
        }
        if ($TunnelUrl) { break }
    }
    $Counter += 2
}

if ($null -ne $TunnelUrl) {
    Write-Host "Bridge Activo!: $TunnelUrl" -ForegroundColor Green
    Write-Host "Sin contrasena requerida." -ForegroundColor Green

    # 3. Guardar JSON para el Orquestador
    $JsonData = [ordered]@{
        url       = $TunnelUrl
        password  = $null
        source    = "cloudflare"
        timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")
    } | ConvertTo-Json
    $JsonData | Out-File -FilePath $UrlFile -Encoding ASCII

    # 4. Notificar por Telegram
    $BotToken = "8182239815:AAFHtrRnwN3oHnah0zo-SbzAZzmeaAtU9tI"
    $ChatId = "1567383226"
    $Msg = "Visual Bridge (Cloudflare)`n`nURL: $TunnelUrl`nAcceso: Directo (sin password)"

    try {
        $Body = @{ chat_id = $ChatId; text = $Msg; parse_mode = "Markdown" }
        Invoke-RestMethod -Uri "https://api.telegram.org/bot$BotToken/sendMessage" `
            -Method Post -Body $Body | Out-Null
        Write-Host "Notificacion de Telegram enviada." -ForegroundColor Cyan
    }
    catch {
        Write-Host "Telegram no disponible." -ForegroundColor DarkGray
    }

    Write-Host "`nAbre la pestana LIVE en el APK para ver el preview." -ForegroundColor White

}
else {
    Write-Host "Error: No se obtuvo URL. Revisa $ErrorLog" -ForegroundColor Red
    if ($TunnelProcess) { Stop-Process -Id $TunnelProcess.Id -Force -ErrorAction SilentlyContinue }
    exit 1
}

# 5. Mantener vivo el tunel
Write-Host "`nPresiona CTRL+C para cerrar el tunel." -ForegroundColor DarkGray
try {
    while ($true) { Start-Sleep -Seconds 5 }
}
finally {
    if ($TunnelProcess) {
        Stop-Process -Id $TunnelProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "`nTunnel cerrado." -ForegroundColor Yellow
}
