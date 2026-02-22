import type { Vector3 } from "three";
import type { BoatState } from "./BoatPhysics";
import type { EventState } from "./EventManager";
import type { ObjectiveState } from "./ObjectiveManager";
import type { ApparentWind } from "./WindManager";

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
	private radarCanvas: HTMLCanvasElement;
	private radarCtx: CanvasRenderingContext2D | null;
	private labels: any;

	constructor(shadowRoot: ShadowRoot, labels: any) {
		this.shadowRoot = shadowRoot;
		this.labels = labels;

		// 1. Create Container
		this.container = document.createElement("div");
		this.container.id = "hud-layer";
		this.container.style.cssText = `
            position: absolute;
            inset: 0;
            pointer-events: none;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: white;
            z-index: 20;
        `;

		// 2. Inject Styles
		const style = document.createElement("style");
		style.textContent = `
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
		this.shadowRoot.appendChild(style);

		// 3. Build HTML Structure
		this.container.innerHTML = `
            <!-- Score -->
            <div id="panel-score" class="hud-panel" style="display: flex; flex-direction: column; align-items: flex-start;">
                <div style="display: flex; gap: 20px; align-items: center;">
                    <div>
                        <div class="hud-label">${this.labels.score || "PUNTUACIÓN"}</div>
                        <div class="hud-value" id="score-display">000000</div>
                    </div>
                    <div>
                        <div class="hud-label">${this.labels.buoys || "BOYAS RECOGIDAS"}</div>
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
                    <div class="hud-label">${this.labels.speed || "VELOCIDAD"}</div>
                    <div class="hud-value" style="font-size: 20px;">
                        <span id="speed-val">0.0</span>
                        <div class="hud-unit" style="display:inline-block; font-size:10px;">${this.labels.knots || "NUDOS"}</div>
                        <div id="speed-kmh" style="font-size: 14px; color: #88ccff; margin-top:-4px;">0 km/h</div>
                    </div>
                </div>

                <div style="width: 1px; height: 30px; background: rgba(255,255,255,0.2);"></div>

                <div class="instrument-group" style="width: 140px;">
                    <div class="hud-label">${this.labels.efficiency || "EFICIENCIA"}</div>
                    <div class="trim-gauge">
                        <div id="trim-bar" class="trim-fill"></div>
                    </div>
                    <div class="hud-unit" style="margin-top: 4px; font-size: 10px;">
                        <span id="trim-val">0</span>% ${this.labels.optimal || "ÓPTIMO"}
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

		this.shadowRoot.appendChild(this.container);

		// 4. Get References
		this.speedVal = this.container.querySelector("#speed-val") as HTMLElement;
		this.speedKmh = this.container.querySelector("#speed-kmh") as HTMLElement;
		this.trimBar = this.container.querySelector("#trim-bar") as HTMLElement;
		this.trimVal = this.container.querySelector("#trim-val") as HTMLElement;
		this.windArrow = this.container.querySelector("#wind-arrow") as HTMLElement;
		this.compassDial = this.container.querySelector(
			"#compass-dial",
		) as HTMLElement;
		this.scoreVal = this.container.querySelector(
			"#score-display",
		) as HTMLElement;
		this.buoyDisplay = this.container.querySelector(
			"#buoy-display",
		) as HTMLElement;
		this.radarCanvas = this.container.querySelector(
			"#radar-canvas",
		) as HTMLCanvasElement;
		this.radarCtx = this.radarCanvas.getContext("2d");

		// Create initial wind streams
		const streamsContainer = this.container.querySelector("#wind-streams")!;
		for (let i = 0; i < 8; i++) {
			const stream = document.createElement("div");
			stream.className = "wind-stream";
			stream.style.left = `${10 + Math.random() * 80}%`;
			stream.style.animationDelay = `${Math.random() * 1}s`;
			streamsContainer.appendChild(stream);
		}
	}

	private buoyDisplay: HTMLElement;

	public update(
		score: number,
		buoys: number,
		maxBuoys: number,
		state: BoatState,
		apparentWind: ApparentWind,
		trueWindAngle: number,
		objective: ObjectiveState,
		event: EventState,
	) {
		// 1. Update Score & Buoys
		this.scoreVal.textContent = Math.floor(score).toString().padStart(6, "0");
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
			this.trimBar.style.background = "#44ff88"; // Green
		} else if (state.efficiency > 0.4) {
			this.trimBar.style.background = "#ffcc00"; // Yellow
		} else {
			this.trimBar.style.background = "#ff4444"; // Red
		}

		// 4. Update Wind Dial
		// We want the arrow to point to where wind is coming FROM relative to boat
		// apparentWind.angleToBoat is typically: 0 = dead ahead, PI = dead astern
		// If angleToBoat is 0 (wind in face), arrow should point UP (Top of dial)
		// If angleToBoat is PI (wind from back), arrow should point DOWN

		// angleToBoat is in radians.
		// Rotation: 0 rad = UP ? CSS Rotate usually starts at 12 o'clock if setup that way.
		// My arrow points DOWN in CSS (border-bottom), so I need to check rotation origin.
		// Actually, let's use a simpler transform.

		// Arrow points to the source of wind.
		// If angleToBoat is 0 (Headwind), arrow should be at top (0 deg).
		// If angleToBoat is PI/2 (Starboard Beam), wind from right. Arrow at right (90 deg).
		// Let's just rotate the container div.

		const deg = apparentWind.angleToBoat * (180 / Math.PI);
		this.windArrow.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`;

		// Rotate the streams container so they flow along the wind direction
		const streamsContainer = this.container.querySelector(
			"#wind-streams",
		) as HTMLElement;
		if (streamsContainer) {
			streamsContainer.style.transform = `rotate(${deg}deg)`;
		}

		// 5. Update Radar
		this.drawRadar(state, objective, event, apparentWind, trueWindAngle);
	}

	private drawRadar(
		boat: BoatState,
		obj: ObjectiveState,
		evt: EventState,
		wind: ApparentWind,
		trueWindAngle: number,
	) {
		if (!this.radarCtx) return;
		const ctx = this.radarCtx;
		const width = this.radarCanvas.width;
		const height = this.radarCanvas.height;
		const cx = width / 2;
		const cy = height / 2;
		const scale = 1.5; // Pixels per meter

		// Clear
		ctx.clearRect(0, 0, width, height);

		// Background / Grid
		ctx.strokeStyle = "rgba(0, 255, 255, 0.2)";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(cx, cy, width / 2 - 2, 0, Math.PI * 2);
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(cx, cy, (width / 2) * 0.5, 0, Math.PI * 2);
		ctx.stroke();

		// 1. Draw Compass Rose (FIXED orientation: N Top, E Right, S Bottom, W Left)
		const r = width / 2 - 12;
		ctx.fillStyle = "#ff3333";
		ctx.font = "bold 12px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("N", cx, cy - r);

		ctx.fillStyle = "#88ccff";
		ctx.fillText("S", cx, cy + r);
		ctx.fillText("E", cx + r, cy);
		ctx.fillText(this.labels.west || "O", cx - r, cy);

		// 2. Draw Boat (Centered, Rotated by Heading)
		// Boat Heading 0 = North (Up, -Z).
		// Canvas usually 0 = Right. Up = -PI/2.
		// We want to draw boat pointing to `heading`.
		// Physics: Heading 0 = North. + is West (Left).
		// Canvas Rotate: + is CW (Right).
		// So Canvas Rotation = -Heading?
		// Let's verify: Heading 0 -> Rot 0. Draw pointing Up.
		// Heading PI/2 (West) -> Rot -PI/2 (Left). Correct.

		ctx.save();
		ctx.translate(cx, cy);

		// Physics heading 0 is (0,0,-1).
		// We want to draw our boat sprite pointing UP.
		// If we rotate context by `heading`, we rotate the "Up" vector.
		// Physics +Heading is turning Left (West).
		// Canvas +Rotation is turning Right.
		// So we need `ctx.rotate(-boat.heading)` to make it point in the correct direction.
		// If heading is 0 (North), rotate(0), points Up.
		// If heading is PI/2 (West), rotate(-PI/2), points Left.
		// If heading is PI (South), rotate(-PI), points Down.
		// If heading is 3PI/2 (East), rotate(-3PI/2), points Right.
		ctx.rotate(-boat.heading);

		ctx.fillStyle = "#fff";
		ctx.beginPath();
		// Draw pointing UP (North)
		ctx.moveTo(0, -10);
		ctx.lineTo(7, 10);
		ctx.lineTo(0, 5);
		ctx.lineTo(-7, 10);
		ctx.fill();
		ctx.restore();

		// 3. Draw Objects (World Coordinates mapped to Radar)
		// North-Up Radar:
		// World North (-Z) is Screen Up (-Y).
		// World East (+X) is Screen Right (+X).
		// Offset = (Obj - Boat).

		const getRadarPos = (targetPos: Vector3) => {
			const relX = targetPos.x - boat.position.x;
			const relZ = targetPos.z - boat.position.z;

			// Map X -> X
			// Map Z -> Y.
			// If relZ is negative (North of boat), we want Screen Y negative (Up).
			// So Y = relZ.

			return {
				x: cx + relX * scale,
				y: cy + relZ * scale,
			};
		};

		// Draw Objective
		if (obj.active) {
			const pos = getRadarPos(obj.position);

			// Bounds check / Clamping (Circular)
			const dx = pos.x - cx;
			const dy = pos.y - cy;
			const dist = Math.sqrt(dx * dx + dy * dy);
			const maxR = width / 2 - 14;

			let drawX = pos.x;
			let drawY = pos.y;
			let onEdge = false;

			if (dist > maxR) {
				const angle = Math.atan2(dy, dx);
				drawX = cx + Math.cos(angle) * maxR;
				drawY = cy + Math.sin(angle) * maxR;
				onEdge = true;
			}

			ctx.fillStyle = "#ffcc00";
			ctx.beginPath();
			ctx.arc(drawX, drawY, 4, 0, Math.PI * 2);
			ctx.fill();
		}

		// Draw Event
		if (evt.active) {
			const pos = getRadarPos(evt.position);
			// Bounds check
			const dx = pos.x - cx;
			const dy = pos.y - cy;
			const dist = Math.sqrt(dx * dx + dy * dy);
			const maxR = width / 2 - 14;

			let drawX = pos.x;
			let drawY = pos.y;
			if (dist > maxR) {
				const angle = Math.atan2(dy, dx);
				drawX = cx + Math.cos(angle) * maxR;
				drawY = cy + Math.sin(angle) * maxR;
			}

			ctx.fillStyle = "#00ffff";
			ctx.beginPath();
			ctx.arc(drawX, drawY, 5 + Math.sin(Date.now() / 200) * 2, 0, Math.PI * 2);
			ctx.fill();
		}

		// 4. True Wind Indicator (Border Arrow)
		// Wind Base Angle 0 = From North.
		// If Wind Angle is 0, we want arrow at TOP (North).
		// Screen Top is -PI/2.

		// We want arrow to point TOWARDS the boat (Inward).
		// If wind is FROM North (0), Arrow should be at Top, pointing Down.
		// Current logic puts it at Top.
		// Rotation: We want it to point IN.
		// Standard draw is pointing Right (0 rad).
		// To point Down, we need PI/2.
		// If Wind=0 (Top), we want angle PI/2?
		// Let's rely on standard rotation:
		// arrowAngle determines Position on circle.
		// We want to rotate the context so the arrow points IN.
		// Vector from Arrow to Center is (cx - ax, cy - ay).
		// Angle is arrowAngle + PI.

		const arrowAngle = trueWindAngle - Math.PI / 2;
		const ar = width / 2 - 2;

		const ax = cx + Math.cos(arrowAngle) * ar;
		const ay = cy + Math.sin(arrowAngle) * ar;

		// Draw Arrow pointing INWARD
		ctx.save();
		ctx.translate(ax, ay);
		// Rotate to point to center. Position Angle is arrowAngle.
		// Opposing direction (towards center) is arrowAngle + PI.
		ctx.rotate(arrowAngle + Math.PI);

		ctx.fillStyle = "#00aaff";
		ctx.beginPath();
		ctx.moveTo(6, 0);
		ctx.lineTo(-6, 4);
		ctx.lineTo(-6, -4);
		ctx.fill();
		ctx.restore();
	}

	public dispose() {
		if (this.container && this.container.parentNode) {
			this.container.parentNode.removeChild(this.container);
		}
	}
}
