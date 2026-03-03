import {
    Vector3,
    Scene,
    Group,
    Mesh,
    OctahedronGeometry,
    MeshBasicMaterial,
    RingGeometry,
    DoubleSide
} from 'three';

export interface EventState {
    active: boolean;
    position: Vector3;
    timeLeft: number;
    type: 'SOS' | 'RACE' | 'NONE';
}

export class EventManager {
    public state: EventState = {
        active: false,
        position: new Vector3(),
        timeLeft: 0,
        type: 'NONE'
    };

    private scene: Scene;
    private eventGroup: Group;
    private beaconMesh: Mesh;
    private pulseRing: Mesh;

    // Config
    private readonly EVENT_CHANCE = 0.005; // Chance per frame (approx 1/200)
    private readonly EVENT_DURATION = 30.0; // Seconds
    private readonly EVENT_RADIUS = 80.0;
    private readonly DETECTION_RADIUS = 15.0;

    public onEventSuccess: ((timeLeft: number) => void) | null = null;
    public onEventFail: (() => void) | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
        this.eventGroup = new Group();

        // Beacon
        const geo = new OctahedronGeometry(2);
        const mat = new MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
        this.beaconMesh = new Mesh(geo, mat);
        this.eventGroup.add(this.beaconMesh);

        // Ring
        const ringGeo = new RingGeometry(3, 3.5, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new MeshBasicMaterial({ color: 0x00ffff, side: DoubleSide, transparent: true, opacity: 0.5 });
        this.pulseRing = new Mesh(ringGeo, ringMat);
        this.eventGroup.add(this.pulseRing);

        this.scene.add(this.eventGroup);
        this.eventGroup.visible = false;
    }

    public update(dt: number, time: number, boatPosition: Vector3) {
        // 1. Check if we should spawn an event
        if (!this.state.active) {
            if (Math.random() < this.EVENT_CHANCE * dt) {
                this.spawnEvent(boatPosition);
            }
            return;
        }

        // 2. Update active event
        this.state.timeLeft -= dt;
        if (this.state.timeLeft <= 0) {
            this.endEvent(false);
            return;
        }

        // Animation
        this.beaconMesh.rotation.y += dt * 2;
        this.beaconMesh.position.y = 5 + Math.sin(time * 5) * 1;

        const scale = 1 + Math.sin(time * 10) * 0.2;
        this.pulseRing.scale.set(scale, scale, scale);

        // 3. Collision
        const dist = boatPosition.distanceTo(new Vector3(this.state.position.x, 0, this.state.position.z));
        if (dist < this.DETECTION_RADIUS) {
            this.endEvent(true);
        }
    }

    private spawnEvent(boatPosition: Vector3) {
        const angle = Math.random() * Math.PI * 2;
        const dist = this.EVENT_RADIUS; // Fixed distance for fairness?

        this.state.position.set(
            boatPosition.x + Math.sin(angle) * dist,
            0,
            boatPosition.z + Math.cos(angle) * dist
        );

        this.eventGroup.position.copy(this.state.position);
        this.eventGroup.visible = true;

        this.state.active = true;
        this.state.timeLeft = this.EVENT_DURATION;
        this.state.type = 'SOS';

        console.log("EVENT STARTED!");
    }

    private endEvent(success: boolean) {
        this.state.active = false;
        this.eventGroup.visible = false;

        if (success) {
            console.log("EVENT SUCCESS");
            if (this.onEventSuccess) this.onEventSuccess(this.state.timeLeft);
        } else {
            console.log("EVENT FAIL");
            if (this.onEventFail) this.onEventFail();
        }
    }

    public dispose() {
        this.scene.remove(this.eventGroup);
        // geom/mat disposal...
    }
}
