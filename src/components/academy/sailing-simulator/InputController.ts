export class InputController {
	private keys: Record<string, boolean> = {};

	public rudderAngle: number = 0; // -PI/4 to PI/4
	public sailAngle: number = 0; // -PI/2 to PI/2 (Full 180 degrees)

	private readonly RUDDER_SPEED = 1.5; // Slightly faster rudder for better response
	private readonly SAIL_SPEED = 1.2; // Fast sail control
	private readonly MAX_RUDDER = Math.PI / 4; // 45 degrees
	private readonly MAX_SAIL = Math.PI / 2; // 90 degrees

	private handleKeyDown = (e: KeyboardEvent) => {
		this.keys[e.code] = true;
		this.keys[e.key] = true;
	};

	private handleKeyUp = (e: KeyboardEvent) => {
		this.keys[e.code] = false;
		this.keys[e.key] = false;
	};

	constructor() {
		if (typeof window !== "undefined") {
			window.addEventListener("keydown", this.handleKeyDown);
			window.addEventListener("keyup", this.handleKeyUp);
		}
	}

	public update(dt: number) {
		// Rudder Control:
		// A / Left Arrow  -> Turn Port (Left)
		// D / Right Arrow -> Turn Starboard (Right)

		// A (Left) -> Decrement rudderAngle (so torque is positive)

		if (
			this.keys["KeyA"] ||
			this.keys["ArrowLeft"] ||
			this.keys["a"] ||
			this.keys["A"]
		) {
			// console.log("INPUT: Key A/Left Detected");
			this.rudderAngle -= this.RUDDER_SPEED * dt;
		} else if (
			this.keys["KeyD"] ||
			this.keys["ArrowRight"] ||
			this.keys["d"] ||
			this.keys["D"]
		) {
			// console.log("INPUT: Key D/Right Detected");
			this.rudderAngle += this.RUDDER_SPEED * dt;
		} else {
			// Self-center rudder
			const damping = this.RUDDER_SPEED * 0.8 * dt;
			if (Math.abs(this.rudderAngle) < damping) {
				this.rudderAngle = 0;
			} else {
				this.rudderAngle -= Math.sign(this.rudderAngle) * damping;
			}
		}
		this.rudderAngle = Math.max(
			-this.MAX_RUDDER,
			Math.min(this.MAX_RUDDER, this.rudderAngle),
		);

		// Sail Control (Boom Angle):
		// W / Up Arrow    -> Move Boom Left (Negative) -> Port
		// S / Down Arrow  -> Move Boom Right (Positive) -> Starboard
		// Range: -90 (Port) to +90 (Starboard). 0 = Center/Stern.
		if (
			this.keys["KeyW"] ||
			this.keys["ArrowUp"] ||
			this.keys["w"] ||
			this.keys["W"]
		) {
			this.sailAngle -= this.SAIL_SPEED * dt;
		} else if (
			this.keys["KeyS"] ||
			this.keys["ArrowDown"] ||
			this.keys["s"] ||
			this.keys["S"]
		) {
			this.sailAngle += this.SAIL_SPEED * dt;
		}
		this.sailAngle = Math.max(
			-this.MAX_SAIL,
			Math.min(this.MAX_SAIL, this.sailAngle),
		);
	}

	public dispose() {
		if (typeof window !== "undefined") {
			window.removeEventListener("keydown", this.handleKeyDown);
			window.removeEventListener("keyup", this.handleKeyUp);
		}
	}
}
