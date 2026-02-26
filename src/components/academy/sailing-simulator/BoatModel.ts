import {
    Group,
    Mesh,
    Shape,
    ExtrudeGeometry,
    MeshStandardMaterial,
    BoxGeometry,
    CylinderGeometry,
    ShapeGeometry,
    ShaderMaterial,
    Color,
    ConeGeometry,
    MeshBasicMaterial,
    Quaternion,
    Vector3,
    DoubleSide
} from 'three';
import { BoatState } from './BoatPhysics';
import { ApparentWind } from './WindManager';

export class BoatModel {
    public group: Group;
    private hull: Mesh;
    private mast: Mesh;
    private boomGroup: Group;
    private boom: Mesh;
    private sail: Mesh;
    private rudder: Mesh;
    private windex: Group;

    private sailMaterial: ShaderMaterial;

    constructor() {
        this.group = new Group();

        // 1. Hull (Procedural Custom Shape)
        // V-Hull Shape
        const hullShape = new Shape();
        hullShape.moveTo(0, 2); // Bow
        hullShape.lineTo(0.6, 0.5); // Mid Right
        hullShape.lineTo(0.5, -2); // Stern Right
        hullShape.lineTo(-0.5, -2); // Stern Left
        hullShape.lineTo(-0.6, 0.5); // Mid Left
        hullShape.lineTo(0, 2); // Bow

        const hullSettings = {
            depth: 0.8,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 2,
            bevelSize: 0.1,
            bevelThickness: 0.1
        };

        const hullGeo = new ExtrudeGeometry(hullShape, hullSettings);
        hullGeo.rotateX(Math.PI / 2); // Lay flat
        hullGeo.translate(0, 0, 0); // Center

        const hullMat = new MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.3 });
        this.hull = new Mesh(hullGeo, hullMat);
        this.hull.castShadow = true;
        this.hull.receiveShadow = true;

        // 3. Scale Up and Raise
        this.hull.scale.set(1, 1, 1); // Reset local scale, global scale applies
        this.hull.position.y = 0.3; // Float higher

        this.group.add(this.hull);

        // Keel (Under water)
        const keelGeo = new BoxGeometry(0.2, 1.2, 0.8);
        const keelMat = new MeshStandardMaterial({ color: 0x333333 });
        const keel = new Mesh(keelGeo, keelMat);
        keel.position.set(0, -0.6, -0.2);
        this.group.add(keel);

        // Rudder (Visual)
        // const rudderGeo = new BoxGeometry(0.1, 1.2, 0.6); // Already defined in previous steps if not duplicated?
        // Let's ensure we use the class property
        const rudderGeo = new BoxGeometry(0.1, 1.0, 0.5);
        const rudderMat = new MeshStandardMaterial({ color: 0x884400 });
        this.rudder = new Mesh(rudderGeo, rudderMat);
        this.rudder.position.set(0, -0.5, -2.1); // Stern position
        this.group.add(this.rudder);

        // 2. Mast
        const mastGeo = new CylinderGeometry(0.06, 0.08, 5.5, 8);
        const mastMat = new MeshStandardMaterial({ color: 0x222222 });
        this.mast = new Mesh(mastGeo, mastMat);
        this.mast.position.set(0, 2.75, 0.5); // Place mast forward of center
        this.group.add(this.mast);

        // 3. Boom Group (Pivot at Mast)
        this.boomGroup = new Group();
        this.boomGroup.position.set(0, 1.2, 0.5); // Attach to mast
        this.group.add(this.boomGroup);

        const boomGeo = new CylinderGeometry(0.04, 0.04, 3, 8);
        boomGeo.rotateX(Math.PI / 2);
        // Correct: Extend -Z (Stern) because Bow is +Z (Locally)
        boomGeo.translate(0, 0, -1.5);
        this.boom = new Mesh(boomGeo, mastMat);
        this.boomGroup.add(this.boom);

        // 4. Sail
        const sailShape = new Shape();
        sailShape.moveTo(0, 0);
        sailShape.lineTo(0, 4); // Top
        sailShape.lineTo(2.5, 0); // Clew (Back)
        sailShape.lineTo(0, 0);

        const sailGeo = new ShapeGeometry(sailShape);
        // We want -Z (Stern). Rotate Y +90.
        sailGeo.rotateY(Math.PI / 2);
        // Translate to sit on boom, extending Aft
        sailGeo.translate(0, 0.1, 0);

        // Shader for Billow & Efficiency
        this.sailMaterial = new ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                windForce: { value: 0 },
                efficiency: { value: 1.0 },
                color: { value: new Color(0xffffff) }
            },
            vertexShader: `
                uniform float time;
                uniform float windForce;
                uniform float efficiency;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    
                    // Billow based on wind force
                    float billow = sin(pos.z * 1.5 + time) * windForce * 0.3;
                    
                    // Luffing (flutter at leading edge) if efficiency is low
                    float luff = 0.0;
                    if (efficiency < 0.9) {
                        float luffZone = 1.0 - smoothstep(0.0, 0.3, pos.z / -2.5); // Near mast
                        // Slower frequency (3.5) to avoid "vibration" look
                        luff = sin(time * 3.5 + pos.y * 2.0) * 0.08 * (1.0 - efficiency) * luffZone;
                    }

                    pos.x += billow + luff;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                void main() {
                    gl_FragColor = vec4(color * 0.95, 0.9);
                }
            `,
            side: DoubleSide,
            transparent: true
        });

        this.sail = new Mesh(sailGeo, this.sailMaterial);
        this.boomGroup.add(this.sail);

        // 5. Windex
        this.windex = new Group();
        this.windex.position.set(0, 5.5, 0.5); // Top of mast

        const windexArrow = new Mesh(
            new ConeGeometry(0.05, 0.3, 4),
            new MeshBasicMaterial({ color: 0xff0000 })
        );
        windexArrow.rotation.x = Math.PI / 2;
        this.windex.add(windexArrow);

        this.group.add(this.windex);

        this.group.scale.set(3, 3, 3); // Scale the entire boat group
    }

    public syncState(position: { x: number, y: number, z: number }, heading: number, heel: number, sailAngle: number) {
        this.group.position.set(position.x, position.y, position.z);

        const axisY = new Vector3(0, 1, 0);
        const qY = new Quaternion().setFromAxisAngle(axisY, heading + Math.PI);
        const axisZ = new Vector3(0, 0, 1);
        const qZ = new Quaternion().setFromAxisAngle(axisZ, heel);

        this.group.quaternion.copy(qY.multiply(qZ));

        this.boomGroup.rotation.y = sailAngle;
    }

    public update(dt: number, time: number, state: BoatState, apparentWind: ApparentWind, sailAngle: number, rudderAngle: number) {
        // Sync Position & Base Heading
        this.group.position.copy(state.position);

        // Flotación Dinámica (Bobbing) - Adjusted for 3x scale
        // Base height lift + sine wave oscillation
        const baseHeight = 0.6;
        const bobbing = Math.sin(time * 1.0) * 0.3;
        this.group.position.y = baseHeight + bobbing;

        // Rudder Animation
        this.rudder.rotation.y = rudderAngle;

        // Apply Heading AND Heel
        const quaternion = new Quaternion();
        const axisY = new Vector3(0, 1, 0);
        // Rotate 180 degrees (PI) because model was backwards
        quaternion.setFromAxisAngle(axisY, state.heading + Math.PI);

        const quaternionZ = new Quaternion();
        const axisZ = new Vector3(0, 0, 1);
        quaternionZ.setFromAxisAngle(axisZ, state.heel); // Heel is roll around Z local logic

        quaternion.multiply(quaternionZ);
        this.group.quaternion.copy(quaternion);

        // Boom / Sail Rotation taking direct angle
        // sailAngle is relative to Centerline.
        // + is Starboard? No, check InputController.
        // We just visualize what's passed.
        this.boomGroup.rotation.y = sailAngle;

        // Update Shader logic
        // Use apparent wind angle relative to Sail?
        // Note: angleToBoat is World Relative? No, it's relative to Boat Heading.
        // ApparentWind.angleToBoat is computed in WindManager relative to Boat Heading.
        // sailAngle is relative to Boat Centerline.
        // So just subtract?
        // Wait, ApparentWind is normalized relative to Bow.

        this.sailMaterial.uniforms.time.value = time;
        this.sailMaterial.uniforms.windForce.value = state.efficiency; // Use efficiency for billow strength
        this.sailMaterial.uniforms.efficiency.value = state.efficiency;

<<<<<<< HEAD
=======
        this.sailMaterial.uniforms.time.value = time;
        this.sailMaterial.uniforms.windForce.value = state.efficiency; // Use efficiency for billow strength
        this.sailMaterial.uniforms.efficiency.value = state.efficiency;

>>>>>>> pr-286
        // Windex (Apparent Wind) arrow points into the wind
        this.windex.rotation.y = apparentWind.angleToBoat + Math.PI;
    }
}
