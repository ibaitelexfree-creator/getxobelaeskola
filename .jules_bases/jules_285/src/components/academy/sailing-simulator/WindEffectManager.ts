import {
    Scene,
    Points,
    BufferGeometry,
    PointsMaterial,
    BufferAttribute,
    CanvasTexture,
    AdditiveBlending,
    Vector3
} from 'three';
import { ApparentWind } from './WindManager';

export class WindEffectManager {
    private scene: Scene;
    private particles: Points;
    private geometry: BufferGeometry;
    private material: PointsMaterial;
    private count: number = 2000; // More particles for streaks
    private positions: Float32Array;
    private velocities: Float32Array;

    private readonly BOUNDS = 100; // Wider field

    constructor(scene: Scene) {
        this.scene = scene;
        this.geometry = new BufferGeometry();
        this.positions = new Float32Array(this.count * 3);
        this.velocities = new Float32Array(this.count);

        // Streak texture (horizontal line)
        // Streak texture (horizontal line)
        // Use OffscreenCanvas for Web Worker compatibility
        const canvas = new OffscreenCanvas(64, 32);
        const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
        if (!ctx) {
            throw new Error('Failed to get 2d context from OffscreenCanvas');
        }
        const grad = ctx.createLinearGradient(0, 0, 64, 0);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 14, 64, 4);
        const texture = new CanvasTexture(canvas as any); // Type cast for Three.js compatibility

        for (let i = 0; i < this.count; i++) {
            this.positions[i * 3] = (Math.random() - 0.5) * this.BOUNDS * 2;
            this.positions[i * 3 + 1] = 0.5 + (Math.random() * 10); // Float between 0.5 and 10m height
            this.positions[i * 3 + 2] = (Math.random() - 0.5) * this.BOUNDS * 2;

            this.velocities[i] = 0.7 + Math.random() * 0.6;
        }

        this.geometry.setAttribute('position', new BufferAttribute(this.positions, 3));

        this.material = new PointsMaterial({
            color: 0xffffff,
            size: 0.8,
            map: texture,
            transparent: true,
            opacity: 0.2,
            blending: AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        this.particles = new Points(this.geometry, this.material);
        this.scene.add(this.particles);
    }

    public update(dt: number, apparentWind: ApparentWind, boatPosition: Vector3, boatVelocity: Vector3) {
        // Wind moves opposite to Apparent Wind Vector relative to boat?
        // No, Apparent Wind is what you feel. The particles should fly AT the player along Apparent Wind Vector.
        // ApparentWind.vector points TOWARDS the destination? 
        // WindManager typically defines wind "FROM".
        // If Wind is FROM North, Vector points South.
        // So particles move along Vector.

        // Let's assume passed ApparentWind.vector is the flow direction (Where air is going).
        // If not, we might need to invert. Usually wind vectors in games are "To".
        // Let's check WindManager usage. It usually stores direction.
        // Assuming vector is normalized direction of flow.

        const windDir = apparentWind.vector.clone().normalize();
        const speed = apparentWind.speed;

        // Move particles
        const moveX = windDir.x * speed * dt;
        const moveZ = windDir.z * speed * dt;
        // Apparent wind usually doesn't have vertical component in this sim.

        // Update positions relative to BOAt to keep them around player
        // But the wind moves relative to world.
        // We want an infinite field effect.

        for (let i = 0; i < this.count; i++) {
            let px = this.positions[i * 3];
            const py = this.positions[i * 3 + 1];
            let pz = this.positions[i * 3 + 2];

            // Apply wind movement
            px += moveX * this.velocities[i];
            pz += moveZ * this.velocities[i];

            // Wrap around logic relative to boat position
            // If particle gets too far from boat, wrap it to the other side

            const distX = px - boatPosition.x;
            const distZ = pz - boatPosition.z;

            if (distX > this.BOUNDS) px -= this.BOUNDS * 2;
            else if (distX < -this.BOUNDS) px += this.BOUNDS * 2;

            if (distZ > this.BOUNDS) pz -= this.BOUNDS * 2;
            else if (distZ < -this.BOUNDS) pz += this.BOUNDS * 2;

            this.positions[i * 3] = px;
            this.positions[i * 3 + 1] = py;
            this.positions[i * 3 + 2] = pz;
        }

        this.geometry.attributes.position.needsUpdate = true;

        // Scale opacity with wind speed for dramatic effect
        // 0 at 0 speed, 0.8 at 25 knots (~13m/s)
        this.material.opacity = Math.min(0.8, Math.max(0, (speed - 2.0) / 15.0));
    }

    public dispose() {
        this.scene.remove(this.particles);
        this.geometry.dispose();
        this.material.dispose();
    }
}
