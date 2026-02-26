import {
    Scene,
    Points,
    BufferGeometry,
    ShaderMaterial,
    BufferAttribute,
    Color,
    AdditiveBlending
} from 'three';
import { BoatState } from './BoatPhysics';

export class WakeManager {
    private scene: Scene;
    private particles: Points;
    private geometry: BufferGeometry;
    private material: ShaderMaterial;

    private positions: Float32Array;
    private opacities: Float32Array;
    private sizes: Float32Array;
    private count: number = 1000; // Even more for a very dense, stable trail
    private currentIndex: number = 0;
    private distanceAccumulator: number = 0;

    constructor(scene: Scene) {
        this.scene = scene;
        this.geometry = new BufferGeometry();
        this.positions = new Float32Array(this.count * 3);
        this.opacities = new Float32Array(this.count);
        this.sizes = new Float32Array(this.count);

        this.geometry.setAttribute('position', new BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('opacity', new BufferAttribute(this.opacities, 1));
        this.geometry.setAttribute('size', new BufferAttribute(this.sizes, 1));

        this.material = new ShaderMaterial({
            uniforms: {
                color: { value: new Color(0xffffff) }
            },
            vertexShader: `
                attribute float opacity;
                attribute float size;
                varying float vOpacity;
                void main() {
                    vOpacity = opacity;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vOpacity;
                uniform vec3 color;
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    float alpha = smoothstep(0.5, 0.2, dist) * vOpacity;
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: AdditiveBlending,
            depthWrite: false
        });

        this.particles = new Points(this.geometry, this.material);
        // CRITICAL: Disable frustum culling so the wake doesn't disappear when boat is far from origin
        this.particles.frustumCulled = false;
        this.scene.add(this.particles);
    }

    public update(dt: number, state: BoatState) {
        const speed = state.velocity.length();

        // Accumulate distance moved to spawn particles deterministically
        this.distanceAccumulator += speed * dt;

        // Spawn a particle every 0.3 meters of movement (stable frequency)
        const spawnDistance = 0.3;

        if (this.distanceAccumulator >= spawnDistance && speed > 0.1) {
            const numParticlesToSpawn = Math.floor(this.distanceAccumulator / spawnDistance);
            this.distanceAccumulator %= spawnDistance;

            for (let k = 0; k < numParticlesToSpawn; k++) {
                const offset = 7.2; // Adjusted for Stern
                const backX = Math.sin(state.heading) * offset;
                const backZ = Math.cos(state.heading) * offset;

                const intensity = Math.min(1.0, speed / 8.0);

                // Alternate sides or spread
                const sideOffset = (Math.random() > 0.5 ? 1 : -1) * (1.2 + intensity * 2.0);
                const perpX = Math.cos(state.heading) * sideOffset;
                const perpZ = -Math.sin(state.heading) * sideOffset;

                this.positions[this.currentIndex * 3] = state.position.x + backX + perpX;
                this.positions[this.currentIndex * 3 + 1] = state.position.y - 0.1; // Just below surface
                this.positions[this.currentIndex * 3 + 2] = state.position.z + backZ + perpZ;

                this.opacities[this.currentIndex] = 0.6 + intensity * 0.4;
                this.sizes[this.currentIndex] = 5.0 + intensity * 15.0;

                this.currentIndex = (this.currentIndex + 1) % this.count;
            }
        }

        // Update all particles
        for (let i = 0; i < this.count; i++) {
            if (this.opacities[i] > 0) {
                this.opacities[i] -= dt * 0.3; // Slower fade
                this.sizes[i] += dt * 1.0;

                // Drift slightly but stay visible
                this.positions[i * 3 + 1] -= dt * 0.02;
            } else {
                this.opacities[i] = 0;
            }
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.opacity.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
    }

    public dispose() {
        this.scene.remove(this.particles);
        this.geometry.dispose();
        this.material.dispose();
    }
}
