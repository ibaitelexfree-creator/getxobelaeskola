
# ==========================================================
# MISSION CONTROL: VISUAL BRIDGE (TUNNEL)
# ==========================================================
# Este script levanta un túnel seguro para que puedas ver
# los cambios de Jules instantáneamente en tu APK/móvil
# incluso si no estás en la misma red WiFi.
# ==========================================================

$Port = 3000
$TunnelLog = "c:\Users\User\Desktop\Saili8ng School Test\antigravity\tunnel.log"
$UrlFile = "c:\Users\User\Desktop\Saili8ng School Test\antigravity\last_tunnel_url.txt"

# 1. Obtener IP pública (necesaria para el password de localtunnel)
Write-Host "🔍 Obteniendo IP pública..." -ForegroundColor Cyan
$PublicIP = (Invoke-RestMethod -Uri "https://api.ipify.org").Trim()
Write-Host "✅ Tu IP pública es: $PublicIP (Úsala como contraseña si el túnel la pide)" -ForegroundColor Green

# 2. Iniciar Localtunnel
Write-Host "🚀 Iniciando Bridge Visual en puerto $Port..." -ForegroundColor Cyan
$TunnelProcess = Start-Process npx -ArgumentList "localtunnel", "--port", "$Port" -PassThru -NoNewWindow -RedirectStandardOutput $TunnelLog

# 3. Esperar a que la URL esté disponible en el log
Write-Host "📡 Esperando URL del túnel..." -ForegroundColor Yellow
$TunnelUrl = $null
$Timeout = 30 # segundos
$Counter = 0

while ($null -eq $TunnelUrl -and $Counter -lt $Timeout) {
    Start-Sleep -Seconds 1
    if (Test-Path $TunnelLog) {
        $Content = Get-Content $TunnelLog
        foreach ($Line in $Content) {
            if ($Line -match "your url is: (https://.*)") {
                $TunnelUrl = $Matches[1]
                break
            }
        }
    }
    $Counter++
}

if ($null -ne $TunnelUrl) {
    Write-Host "✅ ¡Bridge Activo!: $TunnelUrl" -ForegroundColor Green
    
    # 4. Guardar para el Orquestador
    $JsonData = @{
        url = $TunnelUrl
        password = $PublicIP
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    } | ConvertTo-Json
    
    $JsonData | Out-File -FilePath $UrlFile -Encoding utf8
    
    # 5. Notificar por Telegram (si hay token)
    $BotToken = "8375089119:AAFC4svZTAYtIRG13rwlgLOdpZjfVLMXt5U"
    $ChatId = "1567383226"
    
    $Msg = "👁️ *Visual Bridge Activado*`n`n"
    $Msg += "El túnel para la preview instantánea está listo.`n`n"
    $Msg += "*URL:* $TunnelUrl`n"
    $Msg += "*Password (IP):* ``$PublicIP``"
    
    $Url = "https://api.telegram.org/bot$BotToken/sendMessage"
    $Body = @{
        chat_id = $ChatId
        text = $Msg
        parse_mode = "Markdown"
    }
    
    Invoke-RestMethod -Uri $Url -Method Post -Body $Body | Out-Null
    
    Write-Host "📢 Notificación enviada. Puedes abrir la pestaña 'LIVE' en el APK." -ForegroundColor Cyan
} else {
    Write-Host "❌ Error: No se pudo obtener la URL del túnel. Revisa $TunnelLog" -ForegroundColor Red
}

# Mantener el script en espera si se desea cerrar manualmente
Write-Host "`nPresiona CTRL+C para cerrar el túnel." -ForegroundColor Gray
try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    Stop-Process -Id $TunnelProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "`n🛑 Túnel cerrado." -ForegroundColor Yellow
}
