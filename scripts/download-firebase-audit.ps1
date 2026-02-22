# ========================================================
# Firebase Robo Test - Downloader de Auditoría Completa
# Para dar los archivos a Claude Opus / Antigravity
# ========================================================

$BUCKET = "test-lab-57fz3sk6t90tw-hd5f7h6kt6xjq"
$REMOTE_PATH = "1:69772078869:android:31839be870c4447320c31c/56svj79b71dig/f8df6f3e-1c37-40e0-9737-327d289d765d/b8601414-9cdb-45b6-be05-08327ee31c93/MediumPhone.arm-30-en_US-portrait"
$LOCAL_FOLDER = ".\auditoria_firebase_robo"

Write-Host "🔥 Descargando auditoría de Firebase Robo Test..." -ForegroundColor Cyan
Write-Host "   Bucket: gs://$BUCKET" -ForegroundColor Gray

# Crear carpeta local
New-Item -ItemType Directory -Force -Path $LOCAL_FOLDER | Out-Null

# Fijar la cuenta correcta del proyecto (cuenta de servicio del proyecto)
Write-Host "`n🔑 Verificando autenticación..." -ForegroundColor Yellow
gcloud config set account ibaitelexfree@gmail.com 2>&1 | Out-Null

# Primer intento: gcloud storage (más moderno)
Write-Host "`n📥 Intentando descarga con gcloud storage..." -ForegroundColor Green
$result = gcloud storage cp -r "gs://$BUCKET/$REMOTE_PATH/*" "$LOCAL_FOLDER/" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Descarga completada con gcloud storage!" -ForegroundColor Green
} else {
    # Segundo intento: gsutil como admin
    Write-Host "`n⚠️  Intentando con gsutil..." -ForegroundColor Yellow
    Write-Host "   (Si falla, necesitas permisos de acceso al bucket)" -ForegroundColor Gray

    $gsutilPath = "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gsutil.cmd"
    if (Test-Path $gsutilPath) {
        & $gsutilPath -m cp -r "gs://$BUCKET/$REMOTE_PATH/*" "$LOCAL_FOLDER/"
    } else {
        Write-Host "`n❌ gsutil no encontrado. Alternativa manual:" -ForegroundColor Red
        Write-Host ""
        Write-Host "Abre este link en el navegador para ir directamente a los archivos:" -ForegroundColor Cyan
        Write-Host "https://console.cloud.google.com/storage/browser/$BUCKET/$REMOTE_PATH" -ForegroundColor White
        Write-Host ""
        Write-Host "Archivos que hay que descargar (en la carpeta artifacts/):" -ForegroundColor Yellow
        Write-Host "  - screenshots/*.png (capturas del bot Robo)" -ForegroundColor White
        Write-Host "  - video.mp4 (video completo de la prueba)" -ForegroundColor White
        Write-Host "  - logcat (logs de error)" -ForegroundColor White
        Write-Host "  - actions.json (acciones que realizó el bot)" -ForegroundColor White
    }
}

# Mostrar lo que se ha descargado
Write-Host "`n📁 Contenido descargado en '$LOCAL_FOLDER':" -ForegroundColor Cyan
Get-ChildItem -Path $LOCAL_FOLDER -Recurse -File | ForEach-Object {
    $size = if ($_.Length -gt 1MB) { "{0:N1} MB" -f ($_.Length / 1MB) } else { "{0:N0} KB" -f ($_.Length / 1KB) }
    Write-Host "  ✓ $($_.Name) ($size)" -ForegroundColor Green
}

Write-Host "`n🤖 PROMPT PARA OPUS:" -ForegroundColor Magenta
Write-Host "===============================================" -ForegroundColor Gray
Write-Host "Adjunta todas las imágenes de '$LOCAL_FOLDER\artifacts' y dile a Opus:" -ForegroundColor White
Write-Host ""
Write-Host '"Analiza la auditoría de Firebase Robo Test de ''Getxo Bela Eskola'', una app de escuela de vela para Getxo (Bilbao). El bot Robo Test navegó automáticamente por la App Android durante 3 min 45 s y encontró 1 error. Con las capturas de pantalla adjuntas:' -ForegroundColor Cyan
Write-Host '1. Identifica en qué pantalla el bot se bloqueó o crasheó' -ForegroundColor Cyan
Write-Host '2. Lista problemas de UX que dificultaron la navegación del bot' -ForegroundColor Cyan
Write-Host '3. Propón mejoras prioritarias de accesibilidad y usabilidad" ' -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Gray
