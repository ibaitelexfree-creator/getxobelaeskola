export const HUD_STYLES = `
    .hud-panel {
        position: absolute;
        background: rgba(0, 15, 30, 0.6);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        pointer-events: auto;
    }
    .hud-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #88ccff;
        margin-bottom: 4px;
    }
    .hud-value {
        font-size: 24px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: #fff;
    }
    .hud-unit {
        font-size: 12px;
        font-weight: 400;
        color: #88ccff;
        margin-left: 2px;
    }

    /* Bottom Center: Speed & Trim */
    #panel-instruments {
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 24px;
        align-items: flex-end;
    }

    .instrument-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 80px;
    }

    .trim-gauge {
        width: 120px;
        height: 8px;
        background: #333;
        border-radius: 4px;
        overflow: hidden;
        margin-top: 8px;
        position: relative;
    }
    .trim-fill {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #ff4444, #ffcc00, #44ff88);
        transition: width 0.2s, background-color 0.2s;
    }

    /* Bottom Left: Wind Angle */
    #panel-wind {
        bottom: 24px;
        left: 24px;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 15, 30, 0.6);
        overflow: hidden;
    }
    .wind-stream {
        position: absolute;
        width: 2px;
        height: 20px;
        background: rgba(0, 229, 255, 0.3);
        border-radius: 1px;
        animation: wind-flow 1s linear infinite;
        pointer-events: none;
    }
    @keyframes wind-flow {
        from { transform: translateY(-60px); opacity: 0; }
        50% { opacity: 0.5; }
        to { transform: translateY(60px); opacity: 0; }
    }
    .wind-dial {
        width: 100%;
        height: 100%;
        position: relative;
    }
    .boat-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 16px;
        height: 30px;
        background: #fff;
        clip-path: polygon(50% 0%, 100% 85%, 50% 75%, 0% 85%);
    }
    .wind-arrow {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 4px;
        height: 40px;
        background: transparent;
        transform-origin: center center;
    }
    .wind-arrow:after {
        content: '';
        position: absolute;
        top: -45px; /* Outside the dial */
        left: -6px;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 16px solid #00e5ff;
    }

    /* Top Right: Radar */
    #panel-radar {
        top: 24px;
        right: 24px;
        padding: 0;
        width: 140px;
        height: 140px;
        border-radius: 50%;
        overflow: hidden;
    }
    canvas#radar-canvas {
        width: 100%;
        height: 100%;
        display: block;
    }

    /* Top Left: Score */
    #panel-score {
        top: 24px;
        left: 24px;
    }
`;
