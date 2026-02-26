@echo off
echo [N8N-LOCAL] Iniciando n8n en modo local...
echo [INFO] Se abrira en http://localhost:5678
echo [INFO] Para detenerlo, pulsa Ctrl+C en esta ventana.

REM Seteamos una carpeta local para los datos para no mezclar con otras instalaciones
set N8N_USER_FOLDER=%CD%\.n8n_local
if not exist "%N8N_USER_FOLDER%" mkdir "%N8N_USER_FOLDER%"

n8n start --userDir="%N8N_USER_FOLDER%"
