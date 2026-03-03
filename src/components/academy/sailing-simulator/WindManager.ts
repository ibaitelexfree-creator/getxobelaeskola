import { Vector3 } from "three";

export interface ApparentWind {
	vector: Vector3;
	speed: number;
	angleToBoat: number; // Radians relative to boat heading
}

export class WindManager {
	private baseDirection: number; // Radians
	private baseSpeed: number; // m/s
	private currentDirection: number; // Radians, includes any dynamic changes
	private currentSpeed: number; // m/s, includes any dynamic changes
	private time: number = 0;
	private trueApparentWind: ApparentWind; // This property was added in the instruction, but its usage is not fully defined in the provided snippet. Keeping it as per instruction.

	constructor(baseDirection: number = 0, baseSpeed: number = 10) {
		// Random start direction if not provided?
		// Or just randomize on init:
		this.baseDirection = Math.random() * Math.PI * 2;
		this.baseSpeed = baseSpeed;
		this.currentDirection = this.baseDirection; // Initialize current with base
		this.currentSpeed = this.baseSpeed; // Initialize current with base
		this.trueApparentWind = { speed: 0, angleToBoat: 0, vector: new Vector3() };
	}

	public update(dt: number) {
		this.time += dt;

		// Stable wind. No rotation.
		// Small speed gusting is okay for realism, but keep direction fixed.
		const gust =
			Math.sin(this.time * 0.5) * 1.0 + Math.sin(this.time * 2.3) * 0.5;
		this.currentSpeed = this.baseSpeed + gust;
		this.currentDirection = this.baseDirection; // Fixed direction
	}

	public getTrueWindVector(): Vector3 {
		return new Vector3(
			Math.sin(this.currentDirection),
			0,
			Math.cos(this.currentDirection),
		).multiplyScalar(this.currentSpeed);
	}

	public getApparentWind(
		boatVelocity: Vector3,
		boatHeading: number,
	): ApparentWind {
		const trueWind = this.getTrueWindVector();

		const apparentWindVector = new Vector3().subVectors(trueWind, boatVelocity);
		const speed = apparentWindVector.length();

		const windGlobalAngle = Math.atan2(
			apparentWindVector.x,
			apparentWindVector.z,
		);

		// Normalize to -PI to PI
		let angleToBoat = boatHeading - windGlobalAngle;
		while (angleToBoat > Math.PI) angleToBoat -= 2 * Math.PI;
		while (angleToBoat < -Math.PI) angleToBoat += 2 * Math.PI;

		return {
			vector: apparentWindVector,
			speed,
			angleToBoat,
		};
	}

	public getDirection(): number {
		return this.currentDirection;
	}

	public getSpeed(): number {
		return this.currentSpeed;
	}
}
