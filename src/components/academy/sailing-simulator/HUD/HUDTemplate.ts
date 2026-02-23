export const getHUDTemplate = (labels: any) => `
    <!-- Score -->
    <div id="panel-score" class="hud-panel" style="display: flex; flex-direction: column; align-items: flex-start;">
        <div style="display: flex; gap: 20px; align-items: center;">
            <div>
                <div class="hud-label">${labels.score || 'PUNTUACIÓN'}</div>
                <div class="hud-value" id="score-display">000000</div>
            </div>
            <div>
                <div class="hud-label">${labels.buoys || 'BOYAS RECOGIDAS'}</div>
                <div class="hud-value" id="buoy-display">0 / 5</div>
            </div>
        </div>
    </div>

    <!-- Radar -->
    <div id="panel-radar" class="hud-panel">
        <canvas id="radar-canvas" width="280" height="280"></canvas>
    </div>

    <!-- Instruments -->
    <div id="panel-instruments" class="hud-panel">
        <div class="instrument-group">
            <div class="hud-label">${labels.speed || 'VELOCIDAD'}</div>
            <div class="hud-value" style="font-size: 20px;">
                <span id="speed-val">0.0</span>
                <div class="hud-unit" style="display:inline-block; font-size:10px;">${labels.knots || 'NUDOS'}</div>
                <div id="speed-kmh" style="font-size: 14px; color: #88ccff; margin-top:-4px;">0 km/h</div>
            </div>
        </div>

        <div style="width: 1px; height: 30px; background: rgba(255,255,255,0.2);"></div>

        <div class="instrument-group" style="width: 140px;">
            <div class="hud-label">${labels.efficiency || 'EFICIENCIA'}</div>
            <div class="trim-gauge">
                <div id="trim-bar" class="trim-fill"></div>
            </div>
            <div class="hud-unit" style="margin-top: 4px; font-size: 10px;">
                <span id="trim-val">0</span>% ${labels.optimal || 'ÓPTIMO'}
            </div>
        </div>
    </div>

    <!-- Wind -->
    <div id="panel-wind" class="hud-panel" style="border-radius: 50%;">
        <div class="wind-dial" id="compass-dial">
            <!-- Stream containers -->
            <div id="wind-streams" style="position: absolute; inset:0; border-radius:50%; opacity: 0.5;"></div>

            <div class="boat-icon"></div>
            <div class="wind-arrow" id="wind-arrow"></div>
             <!-- Ticks -->
            <div style="position: absolute; top:0; left:50%; width:1px; height:6px; background:#fff; transform:translateX(-50%);"></div>
            <div style="position: absolute; bottom:0; left:50%; width:1px; height:6px; background:#fff; transform:translateX(-50%);"></div>
            <div style="position: absolute; top:50%; left:0; width:6px; height:1px; background:#fff; transform:translateY(-50%);"></div>
            <div style="position: absolute; top:50%; right:0; width:6px; height:1px; background:#fff; transform:translateY(-50%);"></div>
        </div>
    </div>
`;
