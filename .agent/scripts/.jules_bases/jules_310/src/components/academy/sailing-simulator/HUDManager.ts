import { BoatState } from './BoatPhysics';
import { ApparentWind } from './WindManager';
import { ObjectiveState } from './ObjectiveManager';
import { EventState } from './EventManager';
import { HUD_STYLES } from './HUD/HUDStyles';
import { getHUDTemplate } from './HUD/HUDTemplate';
import { RadarRenderer } from './HUD/RadarRenderer';

export class HUDManager {
    private shadowRoot: ShadowRoot;
    private container: HTMLElement;

    // Elements
    private speedVal: HTMLElement;
    private speedKmh: HTMLElement;
    private trimBar: HTMLElement;
    private trimVal: HTMLElement;
    private windArrow: HTMLElement;
    private compassDial: HTMLElement;
    private scoreVal: HTMLElement;
    private buoyDisplay: HTMLElement;
    private radarRenderer: RadarRenderer;
    private labels: any;

    constructor(shadowRoot: ShadowRoot, labels: any) {
        this.shadowRoot = shadowRoot;
        this.labels = labels;

        // 1. Create Container
        this.container = document.createElement('div');
        this.container.id = 'hud-layer';
        this.container.style.cssText = `
            position: absolute;
            inset: 0;
            pointer-events: none;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: white;
            z-index: 20;
        `;

        // 2. Inject Styles
        const style = document.createElement('style');
        style.textContent = HUD_STYLES;
        this.shadowRoot.appendChild(style);

        // 3. Build HTML Structure
        this.container.innerHTML = getHUDTemplate(this.labels);
        this.shadowRoot.appendChild(this.container);

        // 4. Get References
        this.speedVal = this.container.querySelector('#speed-val') as HTMLElement;
        this.speedKmh = this.container.querySelector('#speed-kmh') as HTMLElement;
        this.trimBar = this.container.querySelector('#trim-bar') as HTMLElement;
        this.trimVal = this.container.querySelector('#trim-val') as HTMLElement;
        this.windArrow = this.container.querySelector('#wind-arrow') as HTMLElement;
        this.compassDial = this.container.querySelector('#compass-dial') as HTMLElement;
        this.scoreVal = this.container.querySelector('#score-display') as HTMLElement;
        this.buoyDisplay = this.container.querySelector('#buoy-display') as HTMLElement;

        const radarCanvas = this.container.querySelector('#radar-canvas') as HTMLCanvasElement;
        this.radarRenderer = new RadarRenderer(radarCanvas, this.labels);

        // Create initial wind streams
        const streamsContainer = this.container.querySelector('#wind-streams')!;
        for (let i = 0; i < 8; i++) {
            const stream = document.createElement('div');
            stream.className = 'wind-stream';
            stream.style.left = `${10 + Math.random() * 80}%`;
            stream.style.animationDelay = `${Math.random() * 1}s`;
            streamsContainer.appendChild(stream);
        }
    }

    public update(
        score: number,
        buoys: number,
        maxBuoys: number,
        state: BoatState,
        apparentWind: ApparentWind,
        trueWindAngle: number,
        objective: ObjectiveState,
        event: EventState
    ) {
        // 1. Update Score & Buoys
        this.scoreVal.textContent = Math.floor(score).toString().padStart(6, '0');
        this.buoyDisplay.textContent = `${buoys} / ${maxBuoys}`;

        // 2. Update Speed (Knots) - Scalar values pre-calculated in physics worker
        this.speedVal.textContent = (state.speed || 0).toFixed(1);
        this.speedKmh.textContent = `${(state.speedKmh || 0).toFixed(1)} km/h`;

        // 3. Update Trim Efficiency
        const efficiencyPct = Math.floor(state.efficiency * 100);
        this.trimVal.textContent = efficiencyPct.toString();
        this.trimBar.style.width = `${efficiencyPct}%`;

        // Color coding
        if (state.efficiency > 0.8) {
            this.trimBar.style.background = '#44ff88'; // Green
        } else if (state.efficiency > 0.4) {
            this.trimBar.style.background = '#ffcc00'; // Yellow
        } else {
            this.trimBar.style.background = '#ff4444'; // Red
        }

        // 4. Update Wind Dial
        const deg = apparentWind.angleToBoat * (180 / Math.PI);
        this.windArrow.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`;

        // Rotate the streams container so they flow along the wind direction
        const streamsContainer = this.container.querySelector('#wind-streams') as HTMLElement;
        if (streamsContainer) {
            streamsContainer.style.transform = `rotate(${deg}deg)`;
        }

        // 5. Update Radar
        this.radarRenderer.draw(state, objective, event, apparentWind, trueWindAngle);
    }

    public dispose() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
