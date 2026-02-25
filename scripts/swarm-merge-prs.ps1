# 🚢 Jules Swarm: Parallel PR Merge Orchestration
# Este script agrupa 15 Pull Requests reales existentes en el repositorio 
# en 3 categorías (Arquitectura, Datos, UI) según su contenido, y se los 
# asigna a sus respectivos agentes Jules para que hagan merge en 3 ramas distintas.

$orchestratorUrl = "http://localhost:3002/api/v1/sessions"

# 🏛️ Jules 1: Lead Architect (getxobelaeskola@gmail.com)
# Rama destino: branch-1
# Misión: PRs relacionados con arquitectura, CI, configuraciones core.
$archPRs = @(
    "281", # Contracts schema definition
    "277", # Implement Redis Semantic Cache
    "259", # Qdrant ingestion script
    "258", # Semantic Router module
    "243"  # Interpose Auditor Agent
)

# 🗄️ Jules 2: Data Master (ibaitnt@gmail.com)
# Rama destino: branch-2
# Misión: PRs relacionados con bases de datos, lógica de backend, N+1.
$dataPRs = @(
    "320", # Eliminate N+1 in Admin Explorer
    "319", # Replace in-memory join with DB-level
    "291", # Ensure robust boat status sync
    "286", # Add Boat Logs API
    "278"  # FallbackChain for Jules API 429
)

# 🎨 Jules 3: UI Engine (ibaitelexfree@gmail.com)
# Rama destino: branch-3
# Misión: PRs visuales, componentes React.
$uiPRs = @(
    "327", # Refactor FinancialReportsClient smaller components
    "318", # Refactor FinancialReportsClient modular architecture
    "316", # Add tests for useGeolocation 
    "309", # Real-time Kiosk Mode Sync
    "274"  # InteractiveVideo component
)

function Trigger-JulesMerge {
    param(
        [string]$prNumber,
        [string]$branchName,
        [string]$agentAccount,
        [string]$agentRole
    )

    $taskPrompt = @"
ROLE: $agentRole
Eres el $agentRole de Getxo Bela Eskola.
Tu tarea es hacer checkout a la rama destino '$branchName' (créala si no existe desde main) y hacer FETCH + MERGE del pull request #$prNumber.
Si hay conflictos (especialmente fuera de tu dominio), resuélvelos dando prioridad al código de main, 
y asegurándote de que tu dominio respectivo compila correctamente.
Haz commit y push de los cambios combinados a la rama '$branchName'.
"@

    Write-Host "🤖 Asignando PR #$prNumber a $agentRole ($agentAccount) -> Rama: $branchName" -ForegroundColor Cyan
    
    $body = @{
        prompt         = $taskPrompt
        title          = "Merge PR #$prNumber into $branchName"
        source         = "sources/github/ibaitelexfree-creator/getxobelaeskola"
        account        = $agentAccount
        branch         = $branchName
        automationMode = "AUTO_CREATE_PR"
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Method Post -Uri $orchestratorUrl -ContentType "application/json" -Body $body
        Write-Host "✅ Tarea enviada exitosamente al orquestador." -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to trigger Jules para PR #$prNumber : $_" -ForegroundColor Red
    }
}

Write-Host "🚀 INICIANDO BATCH MERGE CON JULES SWARM..." -ForegroundColor Magenta

# 1. Dispatch Architect PRs
Write-Host "`n🏛️ Disparando tareas para Lead Architect (branch-1)..." -ForegroundColor Yellow
foreach ($pr in $archPRs) {
    Trigger-JulesMerge -prNumber $pr -branchName "branch-1" -agentAccount "getxobelaeskola@gmail.com" -agentRole "Lead Architect"
}

# 2. Dispatch Data PRs
Write-Host "`n🗄️ Disparando tareas para Data Master (branch-2)..." -ForegroundColor Yellow
foreach ($pr in $dataPRs) {
    Trigger-JulesMerge -prNumber $pr -branchName "branch-2" -agentAccount "ibaitnt@gmail.com" -agentRole "Data Master"
}

# 3. Dispatch UI PRs
Write-Host "`n🎨 Disparando tareas para UI Engine (branch-3)..." -ForegroundColor Yellow
foreach ($pr in $uiPRs) {
    Trigger-JulesMerge -prNumber $pr -branchName "branch-3" -agentAccount "ibaitelexfree@gmail.com" -agentRole "UI Engine"
}

Write-Host "`n🎉 Todas las tareas han sido enviadas a la cola del Orchestrator."
Write-Host "👉 Monitoriza el estado abriendo la DB o mirando los logs del Orchestrator Node.js."
