# 🧠 Test: Telegram → Gemini AI → Swarm Pipeline
# Tests the full negotiate + approve flow

$baseUrl = "http://localhost:3002"

# ── Test 1: AI-Powered Negotiate (Gemini) ──
Write-Host "━━━ Test 1: AI-Powered Swarm Negotiation ━━━" -ForegroundColor Cyan

$negotiate = @{
    prompt    = "Crear un sistema de reservas de embarcaciones con calendario, pagos Stripe y panel de administración."
    max_jules = 10
    dispatch  = $false
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/v1/swarm/negotiate" -ContentType "application/json" -Body $negotiate
    Write-Host "✅ Negotiate OK" -ForegroundColor Green
    Write-Host "  Proposal ID: $($result.proposal_id)"
    Write-Host "  AI Powered: $($result.ai_powered)"
    Write-Host "  Total Jules: $($result.analysis.total_jules)"
    Write-Host "  Phases: $($result.analysis.phases.Count)"
    $result.analysis.phases | ForEach-Object {
        Write-Host "    Phase $($_.order): $($_.role) - $($_.jules_count) Jules, $($_.tasks.Count) tasks"
    }
    $proposalId = $result.proposal_id
}
catch {
    Write-Host "❌ Negotiate Error: $_" -ForegroundColor Red
    $proposalId = $null
}

# ── Test 2: Active Swarms (should be empty) ──
Write-Host "`n━━━ Test 2: Active Swarms ━━━" -ForegroundColor Cyan
$active = Invoke-RestMethod -Uri "$baseUrl/api/v1/swarm/active"
Write-Host "Active swarms: $($active.active.Count)"

# ── Test 3: Approve (if proposal exists) ──
if ($proposalId) {
    Write-Host "`n━━━ Test 3: Approve Proposal ━━━" -ForegroundColor Cyan
    try {
        $approve = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/v1/swarm/approve/$proposalId" -ContentType "application/json" -Body '{}'
        Write-Host "✅ Approved: $($approve.message)" -ForegroundColor Green
        Write-Host "  Task Count: $($approve.task_count)"
    }
    catch {
        Write-Host "❌ Approve Error: $_" -ForegroundColor Red
    }

    Start-Sleep -Seconds 2

    # ── Test 4: Progress ──
    Write-Host "`n━━━ Test 4: Swarm Progress ━━━" -ForegroundColor Cyan
    try {
        $progress = Invoke-RestMethod -Uri "$baseUrl/api/v1/swarm/progress/$proposalId"
        Write-Host "Progress: $($progress.progress | ConvertTo-Json -Compress)"
        Write-Host "Tasks: $($progress.tasks.Count)"
    }
    catch {
        Write-Host "❌ Progress Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n━━━ Tests Complete ━━━" -ForegroundColor Green
