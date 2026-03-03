import {
    Vector3,
    Scene,
    Group,
    Mesh,
    CylinderGeometry,
    MeshStandardMaterial,
    PlaneGeometry,
    DoubleSide
} from 'three';

export interface ObjectiveState {
    active: boolean;
    position: Vector3;
    distance: number;
}

export class ObjectiveManager {
    public state: ObjectiveState = {
        active: false,
        position: new Vector3(),
        distance: 0
    };

    private scene: Scene;
    private buoyGroup: Group;
    private buoyMesh: Mesh;
    private flagMesh: Mesh;

    private readonly DETECTION_RADIUS = 10.0;
    private readonly SPAWN_RADIUS_MIN = 50.0;
    private readonly SPAWN_RADIUS_MAX = 150.0;

    public onObjectiveReached: (() => void) | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
        this.buoyGroup = new Group();

        // Buoy Geometry
        const baseGeo = new CylinderGeometry(0.5, 0.4, 1.2, 8);
        const baseMat = new MeshStandardMaterial({ color: 0xff4400, roughness: 0.4 });
        this.buoyMesh = new Mesh(baseGeo, baseMat);
        this.buoyMesh.position.y = 0.6;
        this.buoyGroup.add(this.buoyMesh);

        // Flag / Stick
        const stickGeo = new CylinderGeometry(0.05, 0.05, 3, 4);
        const stickMat = new MeshStandardMaterial({ color: 0xffffff });
        const stick = new Mesh(stickGeo, stickMat);
        stick.position.y = 1.5;
        this.buoyGroup.add(stick);

        // Flag
        const flagGeo = new PlaneGeometry(0.8, 0.5);
        const flagMat = new MeshStandardMaterial({ color: 0xffcc00, side: DoubleSide });
        this.flagMesh = new Mesh(flagGeo, flagMat);
        this.flagMesh.position.set(0.45, 2.8, 0);
        this.buoyGroup.add(this.flagMesh);

        this.scene.add(this.buoyGroup);
        this.buoyGroup.visible = false;

        this.spawnNewObjective(new Vector3(0, 0, 0));
    }

    public spawnNewObjective(boatPosition: Vector3) {
        // Random angle
        const angle = Math.random() * Math.PI * 2;
        // Random distance
        const distance = this.SPAWN_RADIUS_MIN + Math.random() * (this.SPAWN_RADIUS_MAX - this.SPAWN_RADIUS_MIN);

        const offsetX = Math.sin(angle) * distance;
        const offsetZ = Math.cos(angle) * distance;

        this.state.position.set(boatPosition.x + offsetX, 0, boatPosition.z + offsetZ);
        this.buoyGroup.position.copy(this.state.position);
        this.buoyGroup.visible = true;
        this.state.active = true;
    }

    public update(dt: number, time: number, boatPosition: Vector3) {
        if (!this.state.active) return;

        // Bobbing animation
        this.buoyGroup.position.y = Math.sin(time * 2.0) * 0.2;
        // Rotation
        this.buoyMesh.rotation.y += dt;
        this.flagMesh.rotation.y = Math.sin(time * 3.0) * 0.5; // Flapping

        // Calculate distance
        const distance = boatPosition.distanceTo(new Vector3(this.state.position.x, boatPosition.y, this.state.position.z));
        this.state.distance = distance;

        // Check collision
        if (distance < this.DETECTION_RADIUS) {
            this.handleReached(boatPosition);
        }
    }

    private handleReached(boatPosition: Vector3) {
        console.log("Objective Reached!");
        if (this.onObjectiveReached) {
            this.onObjectiveReached();
        }
        // Respawn
        this.spawnNewObjective(boatPosition);
    }

    public dispose() {
        this.scene.remove(this.buoyGroup);
        this.buoyGroup.traverse((obj) => {
            if (obj instanceof Mesh) {
                obj.geometry.dispose();
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
        });
    }
}
