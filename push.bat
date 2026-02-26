@echo off
set MESSAGE=%~1
if "%MESSAGE%"=="" set MESSAGE=Actualización automática desde Claude

echo [DEPLOY] Iniciando proceso de envío a Producción...

echo [GIT] Preparando archivos...
git add .

echo [GIT] Creando commit: %MESSAGE%
git commit -m "%MESSAGE%"

echo [GIT] Obteniendo rama actual...
for /f "tokens=*" %%i in ('git branch --show-current') do set BRANCH=%%i

echo [GIT] Subiendo a GitHub (rama: %BRANCH%)...
git push origin %BRANCH%

if "%BRANCH%"=="main" (
    echo [SUCCESS] ¡CÓDIGO SUBIDO! Tus GitHub Actions están desplegando ahora mismo en el VPS.
    echo Ver el progreso en: https://github.com/ibaitelexfree-creator/getxobelaeskola/actions
) else if "%BRANCH%"=="master" (
    echo [SUCCESS] ¡CÓDIGO SUBIDO! Tus GitHub Actions están desplegando ahora mismo en el VPS.
    echo Ver el progreso en: https://github.com/ibaitelexfree-creator/getxobelaeskola/actions
) else (
    echo [INFO] Subido a la rama '%BRANCH%'. Para despliegue total, mergear a 'main'.
)
