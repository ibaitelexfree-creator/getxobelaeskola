@echo off
echo [N8N] Bajando workflows de la nube...
cd orchestration
node n8n_utils.js pull
cd ..
echo [SUCCESS] Workflows guardados en orchestration/n8n-workflows/
