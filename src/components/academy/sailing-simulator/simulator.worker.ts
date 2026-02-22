import {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    Vector3,
    Color,
    DirectionalLight,
    AmbientLight,
    HemisphereLight,
    PlaneGeometry,
    ShaderMaterial,
    Mesh,
    SphereGeometry,
    BackSide,
    Group,
    BoxGeometry,
    MeshStandardMaterial,
    CylinderGeometry,
    Shape,
    ExtrudeGeometry,
    ShapeGeometry,
    DoubleSide,
    ConeGeometry,
    MeshBasicMaterial,
    Quaternion
} from 'three';
import { RendererSetup } from './RendererSetup';
import { EnvironmentManager } from './EnvironmentManager';
import { WindManager } from './WindManager';
import { BoatPhysics } from './BoatPhysics';
import { BoatModel } from './BoatModel';
import { WakeManager } from './WakeManager';
import { ObjectiveManager } from './ObjectiveManager';
import { EventManager } from './EventManager';
import { ScoringManager } from './ScoringManager';
import { WindEffectManager } from './WindEffectManager';
import { FloatingTextManager } from './FloatingTextManager';
import * as turf from '@turf/turf';
import waterGeometryData from '../../../data/geospatial/water-geometry.json';

// Mapping simulator context to real world for geofencing
const REAL_WORLD_CENTER = { lat: 43.3485, lng: -3.0185 }; // Getxo Port area
const LAT_SCALE = 1 / 111320; // 1 meter approx
const LNG_SCALE = 1 / 81000;  // 1 meter approx at 43 deg lat

function checkWaterCollision(pos: Vector3): boolean {
    const lat = REAL_WORLD_CENTER.lat - (pos.z * LAT_SCALE);
    const lng = REAL_WORLD_CENTER.lng + (pos.x * LNG_SCALE);
    const point = turf.point([lng, lat]);

    const collection = waterGeometryData as any;
    if (collection.features) {
        return collection.features.some((f: any) => turf.booleanPointInPolygon(point, f));
    }
    return true; // Default to water if data structure is unexpected
}

let renderer: WebGLRenderer;
let scene: Scene;
let camera: PerspectiveCamera;
let environment: EnvironmentManager;
let wind: WindManager;
let boatPhysics: BoatPhysics;
let boatModel: BoatModel;
let wake: WakeManager;
let objectives: ObjectiveManager;
let events: EventManager;
let scoring: ScoringManager;
let windEffect: WindEffectManager;
let floatingText: FloatingTextManager;

let animationFrameId: number;
let lastTime = 0;
let isGameOver = false;

// Mock context for things that might expect window
const inputState = {
    rudderAngle: 0,
    sailAngle: 0,
    keys: {} as Record<string, boolean>
};

self.onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;

    switch (type) {
        case 'INIT':
            init(payload.canvas, payload.width, payload.height, payload.pixelRatio);
            break;
        case 'RESIZE':
            resize(payload.width, payload.height);
            break;
        case 'INPUT':
            updateInput(payload);
            break;
    }
};

function init(canvas: OffscreenCanvas, width: number, height: number, pixelRatio: number) {
    const context = RendererSetup.create(canvas, width, height, pixelRatio);
    scene = context.scene;
    camera = context.camera;
    renderer = context.renderer;

    environment = new EnvironmentManager(scene);
    wind = new WindManager(Math.PI / 4, 12);
    boatPhysics = new BoatPhysics();
    boatModel = new BoatModel();
    scene.add(boatModel.group);

    wake = new WakeManager(scene);
    objectives = new ObjectiveManager(scene);
    events = new EventManager(scene);
    scoring = new ScoringManager();
    windEffect = new WindEffectManager(scene);
    floatingText = new FloatingTextManager(scene);

    objectives.onObjectiveReached = () => {
        const points = scoring.addObjectiveBonus(objectives.state.distance);
        floatingText.add(`+${points}`, objectives.state.position.clone());

        if (scoring.isGameOver() && !isGameOver) {
            isGameOver = true;
            self.postMessage({ type: 'GAME_OVER', payload: { score: scoring.totalScore, leaderboard: scoring.leaderboard } });
        }
    };

    events.onEventSuccess = (timeLeft) => {
        scoring.addEventBonus(timeLeft);
    };

    lastTime = performance.now();
    animate();
}

function resize(width: number, height: number) {
    if (!camera || !renderer) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
}

function updateInput(payload: any) {
    inputState.rudderAngle = payload.rudderAngle;
    inputState.sailAngle = payload.sailAngle;
}

function animate() {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const elapsedTime = now / 1000;

    if (!isGameOver) {
        // Update Physics
        wind.update(dt);
        const apparentWind = wind.getApparentWind(boatPhysics.state.velocity, boatPhysics.state.heading);
        boatPhysics.update(dt, apparentWind, inputState.sailAngle, inputState.rudderAngle);

        // Water Geofencing Check
        const inWater = checkWaterCollision(boatPhysics.state.position);
        if (!inWater) {
            // Collision with land: Hard stop and visual feedback
            boatPhysics.state.velocity.set(0, 0, 0);
            boatPhysics.state.speed = 0;
            boatPhysics.state.speedKmh = 0;

            // Limit position slightly back or just stop
            // For simplicity, we just stop the movement

            if (elapsedTime % 1 < 0.1) { // Throttle messages
                floatingText.add("¡TIERRA!", boatPhysics.state.position.clone().add(new Vector3(0, 5, 0)));
            }
        }

        // Update Gameplay
        objectives.update(dt, elapsedTime, boatPhysics.state.position);
        events.update(dt, elapsedTime, boatPhysics.state.position);
        scoring.update(dt, boatPhysics.state, objectives.state);

        // Update Visuals
        boatModel.update(dt, elapsedTime, boatPhysics.state, apparentWind, inputState.sailAngle, inputState.rudderAngle);
        wake.update(dt, boatPhysics.state);
        windEffect.update(dt, apparentWind, boatPhysics.state.position, boatPhysics.state.velocity);
        floatingText.update(dt);
        environment.update(elapsedTime);

        // Camera Follow
        const targetOffset = new Vector3(0, 15, 36);
        targetOffset.applyAxisAngle(new Vector3(0, 1, 0), boatPhysics.state.heading);
        const cameraPos = boatPhysics.state.position.clone().add(targetOffset);
        camera.position.lerp(cameraPos, 0.1);
        camera.lookAt(boatPhysics.state.position);

        // Send state to Main Thread for HUD/Audio
        self.postMessage({
            type: 'STATE_UPDATE',
            payload: {
                score: scoring.totalScore,
                buoys: scoring.buoysCollected,
                maxBuoys: scoring.MAX_BUOYS,
                boatState: boatPhysics.state,
                apparentWind,
                trueWindAngle: wind.getDirection(),
                objectiveState: objectives.state,
                eventState: events.state
            }
        });
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
