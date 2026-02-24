<#
.SYNOPSIS
  Antigravity Watchdog — Process Guardian & Auto-Continue
  
.DESCRIPTION
  Persistent PowerShell script that:
  1. Monitors Antigravity/Cursor/Code process health
  2. Auto-restarts the IDE if it crashes or closes
  3. Sends auto-continue (Enter) when the agent is idle  
  4. Queries the watchdog.js engine for loop detection
  5. Logs all interventions to a local file

.PARAMETER AutoContinue
  Enable sending Enter key when agent is idle (default: true)

.PARAMETER WatchdogApiPort  
  Port where the orchestration server runs (default: 3001)

.PARAMETER LogFile
  Path to the log file

.EXAMPLE
  .\watchdog.ps1
  .\watchdog.ps1 -AutoContinue $false
  .\watchdog.ps1 -NoAutoContinue
#>

[CmdletBinding()]
param(
    [switch]$NoAutoContinue,
    [int]$WatchdogApiPort = 3001,
    [string]$LogFile = "$PSScriptRoot\watchdog.log",
    [int]$PollIntervalSeconds = 30,
    [int]$IdleTimeoutSeconds = 120,
    [int]$MaxLogSizeMB = 5
)

$AutoContinue = -not $NoAutoContinue

# ─── Configuration ──────────────────────────────────────────────
$ProcessNames = @("Antigravity", "Cursor", "Code")
$WatchdogApiUrl = "http://localhost:$WatchdogApiPort"
$StartTime = Get-Date
$InterventionCount = 0
$LastOutputCheck = Get-Date
$ConsecutiveIdleChecks = 0
$MaxConsecutiveIdle = 5  # Kill after 5 consecutive idle checks with auto-continue

# ─── Helpers ────────────────────────────────────────────────────

function Write-WatchdogLog {
    param([string]$Level, [string]$Message)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $entry = "[$timestamp] [$Level] $Message"
    
    Write-Host $entry -ForegroundColor $(
        switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "INFO" { "Green" }
            "ACTION" { "Cyan" }
            default { "White" }
        }
    )
    
    # Append to log file (rotate if too large)
    try {
        if (Test-Path $LogFile) {
            $size = (Get-Item $LogFile).Length / 1MB
            if ($size -gt $MaxLogSizeMB) {
                $backupPath = "$LogFile.old"
                Move-Item -Path $LogFile -Destination $backupPath -Force
                Write-Host "[SYSTEM] Log rotated ($([math]::Round($size, 1)) MB)" -ForegroundColor Gray
            }
        }
        Add-Content -Path $LogFile -Value $entry -ErrorAction SilentlyContinue
    }
    catch {
        # Silently continue if log write fails
    }
}

function Test-AgentProcess {
    foreach ($name in $ProcessNames) {
        $proc = Get-Process -Name $name -ErrorAction SilentlyContinue
        if ($proc) {
            return @{
                Alive      = $true
                Name       = $name
                PID        = $proc[0].Id
                Memory     = [math]::Round($proc[0].WorkingSet64 / 1MB, 1)
                Responding = $proc[0].Responding
            }
        }
    }
    return @{ Alive = $false; Name = $null; PID = $null }
}

function Start-AgentProcess {
    Write-WatchdogLog "ACTION" "Attempting to restart Antigravity..."
    
    $launchMethods = @(
        @{ Name = "Antigravity"; Cmd = { Start-Process "Antigravity" -ErrorAction Stop } },
        @{ Name = "Cursor"; Cmd = { Start-Process "cursor" -ErrorAction Stop } },
        @{ Name = "Code"; Cmd = { Start-Process "code" -ErrorAction Stop } }
    )
    
    foreach ($method in $launchMethods) {
        try {
            & $method.Cmd
            Start-Sleep -Seconds 5
            $check = Test-AgentProcess
            if ($check.Alive) {
                Write-WatchdogLog "INFO" "Successfully launched $($method.Name) (PID: $($check.PID))"
                return $true
            }
        }
        catch {
            Write-WatchdogLog "WARN" "Failed to launch $($method.Name): $($_.Exception.Message)"
        }
    }
    
    Write-WatchdogLog "ERROR" "All restart attempts failed!"
    return $false
}

function Send-AutoContinue {
    param([int]$ProcessId)
    
    if (-not $AutoContinue) { return $false }
    
    try {
        Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue
        $wshell = New-Object -ComObject WScript.Shell
        $activated = $wshell.AppActivate($ProcessId)
        
        if ($activated) {
            Start-Sleep -Milliseconds 500
            [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
            Write-WatchdogLog "ACTION" "Auto-continue sent (Enter key to PID $ProcessId)"
            return $true
        }
        else {
            Write-WatchdogLog "WARN" "Could not activate window for PID $ProcessId"
            return $false
        }
    }
    catch {
        Write-WatchdogLog "ERROR" "SendKeys failed: $($_.Exception.Message)"
        return $false
    }
}

function Get-WatchdogApiStatus {
    try {
        $response = Invoke-RestMethod -Uri "$WatchdogApiUrl/watchdog/status" -Method Get -TimeoutSec 5 -ErrorAction Stop
        return $response
    }
    catch {
        return $null
    }
}

function Send-WatchdogApiAction {
    param([string]$Action)
    try {
        $body = @{ action = $Action } | ConvertTo-Json
        Invoke-RestMethod -Uri "$WatchdogApiUrl/watchdog/action" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# ─── Banner ─────────────────────────────────────────────────────

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║       🐕 ANTIGRAVITY WATCHDOG 1.0        ║" -ForegroundColor Cyan
Write-Host "  ║  Process Guardian & Auto-Continue Engine  ║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Config:" -ForegroundColor Gray
Write-Host "    Auto-Continue:  $AutoContinue" -ForegroundColor Gray
Write-Host "    Poll Interval:  ${PollIntervalSeconds}s" -ForegroundColor Gray
Write-Host "    Idle Timeout:   ${IdleTimeoutSeconds}s" -ForegroundColor Gray
Write-Host "    API Port:       $WatchdogApiPort" -ForegroundColor Gray
Write-Host "    Log File:       $LogFile" -ForegroundColor Gray
Write-Host ""
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

Write-WatchdogLog "INFO" "Watchdog started (AutoContinue=$AutoContinue, Poll=${PollIntervalSeconds}s)"

# ─── Main Loop ──────────────────────────────────────────────────

try {
    while ($true) {
        $status = Test-AgentProcess
        
        # ── Step 1: Process alive check ─────────────────────────
        if (-not $status.Alive) {
            Write-WatchdogLog "ERROR" "Agent process NOT found! Restarting..."
            $script:InterventionCount++
            
            $restarted = Start-AgentProcess
            if (-not $restarted) {
                Write-WatchdogLog "ERROR" "Restart failed. Will retry in $($PollIntervalSeconds * 2)s..."
                Start-Sleep -Seconds ($PollIntervalSeconds * 2)
                continue
            }
            
            $ConsecutiveIdleChecks = 0
            Start-Sleep -Seconds $PollIntervalSeconds
            continue
        }
        
        # ── Step 2: Process responding check ────────────────────
        if (-not $status.Responding) {
            $frozenTime = (Get-Date) - $LastOutputCheck
            if ($frozenTime.TotalSeconds -gt ($IdleTimeoutSeconds * 2)) {
                Write-WatchdogLog "WARN" "Process $($status.Name) (PID $($status.PID)) NOT RESPONDING for $([math]::Round($frozenTime.TotalMinutes, 1))m. Killing..."
                Stop-Process -Id $status.PID -Force -ErrorAction SilentlyContinue
                $script:InterventionCount++
                Start-Sleep -Seconds 5
                Start-AgentProcess | Out-Null
                $ConsecutiveIdleChecks = 0
                Start-Sleep -Seconds $PollIntervalSeconds
                continue
            }
        }
        
        # ── Step 3: Query watchdog.js API ───────────────────────
        $apiStatus = Get-WatchdogApiStatus
        
        if ($apiStatus) {
            switch ($apiStatus.state) {
                "LOOPING" {
                    Write-WatchdogLog "WARN" "API reports LOOPING state. Waiting for auto-kill..."
                    # The Node.js watchdog handles this, but if it persists:
                    if ($apiStatus.retryCount -ge 3) {
                        Write-WatchdogLog "ACTION" "API stuck in loop. Force killing process..."
                        Stop-Process -Id $status.PID -Force -ErrorAction SilentlyContinue
                        $script:InterventionCount++
                        Start-Sleep -Seconds 10
                        Start-AgentProcess | Out-Null
                        $ConsecutiveIdleChecks = 0
                    }
                }
                "STALLED" {
                    Write-WatchdogLog "INFO" "API reports STALLED. Auto-continue will handle it."
                }
                "CRASHED" {
                    Write-WatchdogLog "ERROR" "API reports CRASHED. Forcing restart..."
                    Stop-Process -Id $status.PID -Force -ErrorAction SilentlyContinue
                    Start-Sleep -Seconds 5
                    Start-AgentProcess | Out-Null
                    $ConsecutiveIdleChecks = 0
                }
                default {
                    # ACTIVE or PAUSED — all good
                }
            }
        }
        
        # ── Step 4: Auto-continue on idle ───────────────────────
        if ($AutoContinue -and $status.Alive -and $status.Responding) {
            # Simple heuristic: if the window title hasn't changed and API says stalled
            $isIdle = ($apiStatus -and $apiStatus.state -eq "STALLED") -or 
            (-not $apiStatus -and $ConsecutiveIdleChecks -ge 2)
            
            if ($isIdle) {
                $ConsecutiveIdleChecks++
                
                if ($ConsecutiveIdleChecks -le $MaxConsecutiveIdle) {
                    Send-AutoContinue -ProcessId $status.PID
                    $script:InterventionCount++
                }
                else {
                    Write-WatchdogLog "WARN" "Max idle retries ($MaxConsecutiveIdle) reached. Killing for fresh start..."
                    Stop-Process -Id $status.PID -Force -ErrorAction SilentlyContinue
                    Start-Sleep -Seconds 10
                    Start-AgentProcess | Out-Null
                    $ConsecutiveIdleChecks = 0
                    $script:InterventionCount++
                }
            }
            else {
                $ConsecutiveIdleChecks = 0
            }
        }
        
        # ── Step 5: Periodic status log ─────────────────────────
        $uptime = (Get-Date) - $StartTime
        if ($uptime.TotalMinutes % 5 -lt ($PollIntervalSeconds / 60)) {
            $stateLabel = if ($apiStatus) { $apiStatus.state } else { "API_OFFLINE" }
            Write-WatchdogLog "INFO" "Heartbeat: $($status.Name) PID=$($status.PID) Mem=$($status.Memory)MB State=$stateLabel Interventions=$InterventionCount Uptime=$([math]::Round($uptime.TotalHours, 1))h"
        }
        
        Start-Sleep -Seconds $PollIntervalSeconds
    }
}
catch {
    Write-WatchdogLog "ERROR" "Watchdog crashed: $($_.Exception.Message)"
    Write-WatchdogLog "INFO" "Restarting watchdog in 10s..."
    Start-Sleep -Seconds 10
    # Re-invoke self
    & $PSCommandPath @PSBoundParameters
}
