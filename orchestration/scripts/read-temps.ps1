# ThermalGuard — Temperature Reader Script
# Called by thermal-guard.js every 15 seconds
# Outputs JSON with cpu, gpu, gpuHot temperatures

$cpu = $null
$gpu = $null
$gpuHot = $null

# --- CPU Temperature ---
# Method 1: WMI Thermal Zone (built-in Windows)
try {
    $tz = Get-CimInstance -Namespace root/WMI -ClassName MSAcpi_ThermalZoneTemperature -ErrorAction SilentlyContinue
    if ($tz) {
        $cpu = [math]::Round(($tz.CurrentTemperature[0] / 10) - 273.15, 1)
    }
} catch {}

# Method 2: LibreHardwareMonitor WMI provider
if (-not $cpu) {
    try {
        $hwm = Get-CimInstance -Namespace root/LibreHardwareMonitor -ClassName Sensor -ErrorAction SilentlyContinue |
            Where-Object { $_.SensorType -eq 'Temperature' -and $_.Name -like '*CPU*Package*' } |
            Select-Object -First 1
        if ($hwm) { $cpu = [math]::Round($hwm.Value, 1) }
    } catch {}
}

# Method 3: OpenHardwareMonitor WMI provider
if (-not $cpu) {
    try {
        $ohm = Get-CimInstance -Namespace root/OpenHardwareMonitor -ClassName Sensor -ErrorAction SilentlyContinue |
            Where-Object { $_.SensorType -eq 'Temperature' -and $_.Name -like '*CPU*Package*' } |
            Select-Object -First 1
        if ($ohm) { $cpu = [math]::Round($ohm.Value, 1) }
    } catch {}
}

# --- GPU Temperature ---
# Method 1: nvidia-smi (NVIDIA GPUs)
try {
    $nv = & nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader,nounits 2>$null
    if ($nv -and $nv.Trim() -match '^\d+') {
        $gpu = [double]$nv.Trim()
        $gpuHot = $gpu + 10  # Estimate hotspot as +10°C
    }
} catch {}

# Method 2: LibreHardwareMonitor for GPU
if (-not $gpu) {
    try {
        $gs = Get-CimInstance -Namespace root/LibreHardwareMonitor -ClassName Sensor -ErrorAction SilentlyContinue |
            Where-Object { $_.SensorType -eq 'Temperature' -and $_.Name -like '*GPU*Core*' } |
            Select-Object -First 1
        if ($gs) { $gpu = [math]::Round($gs.Value, 1) }

        $gsh = Get-CimInstance -Namespace root/LibreHardwareMonitor -ClassName Sensor -ErrorAction SilentlyContinue |
            Where-Object { $_.SensorType -eq 'Temperature' -and $_.Name -like '*GPU*Hot*Spot*' } |
            Select-Object -First 1
        if ($gsh) { 
            $gpuHot = [math]::Round($gsh.Value, 1) 
        } elseif ($gpu) {
            $gpuHot = $gpu + 10
        }
    } catch {}
}

# OpenHardwareMonitor for GPU (fallback)
if (-not $gpu) {
    try {
        $gs2 = Get-CimInstance -Namespace root/OpenHardwareMonitor -ClassName Sensor -ErrorAction SilentlyContinue |
            Where-Object { $_.SensorType -eq 'Temperature' -and $_.Name -like '*GPU*Core*' } |
            Select-Object -First 1
        if ($gs2) { $gpu = [math]::Round($gs2.Value, 1) }
        if ($gpu -and -not $gpuHot) { $gpuHot = $gpu + 10 }
    } catch {}
}

# --- Output ---
$result = @{
    cpu = if ($cpu) { $cpu } else { -1 }
    gpu = if ($gpu) { $gpu } else { -1 }
    gpuHot = if ($gpuHot) { $gpuHot } else { -1 }
}

$result | ConvertTo-Json -Compress
