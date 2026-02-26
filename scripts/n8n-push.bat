@echo off
set WF_NAME=%~1
if "%WF_NAME%"=="" (
    echo Error: Debes especificar el nombre del workflow entre comillas.
    echo Ejemplo: n8n-push "Mi Workflow"
    exit /b 1
)

echo [N8N] Subiendo workflow "%WF_NAME%" a la nube...
cd orchestration
node n8n_utils.js push "%WF_NAME%"
cd ..
