
// wind-lab.worker.ts
// Aislamiento total del Laboratorio de Viento (Física + 2 Capas de Renderizado)

import { PhysicsEngine, WindLabState, DerivedPhysics } from './physics/PhysicsEngine';

let seaCanvas: OffscreenCanvas;
let particleCanvas: OffscreenCanvas;
let seaCtx: OffscreenCanvasRenderingContext2D | null;
let particleCtx: OffscreenCanvasRenderingContext2D | null;

let state: WindLabState;
let physics: DerivedPhysics;

// Sea State
let waveOffset = 0;
let currentSeaSpeed = 0;
let time = 0;

// Particle State
interface Particle {
    x: number; y: number; vx: number; vy: number; life: number; alpha: number;
}
let particles: Particle[] = [];
const MAX_PARTICLES = 1500;

self.onmessage = (e) => {
    const { type, payload } = e.data;

    switch (type) {
        case 'INIT':
            seaCanvas = payload.seaCanvas;
            particleCanvas = payload.particleCanvas;
            seaCtx = seaCanvas.getContext('2d');
            particleCtx = particleCanvas.getContext('2d');
            state = payload.state;
            physics = PhysicsEngine.calculatePhysics(state);
            requestAnimationFrame(loop);
            break;
        case 'UPDATE_INPUTS':
            // Merge inputs into state
            state = { ...state, ...payload };
            break;
    }
};

function loop(t: number) {
    const deltaTime = (t - time) / 1000;
    time = t;

    updatePhysics(deltaTime);
    renderSea(t);
    renderParticles();

    // Sync state back to UI thread for dashboard (at lower frequency or every frame)
    self.postMessage({ type: 'STATE_UPDATE', payload: { state, physics } });

    requestAnimationFrame(loop);
}

function updatePhysics(dt: number) {
    if (!state) return;
    let deltaTime = dt;
    if (deltaTime > 0.1) deltaTime = 0.1;

    // 1. Calculate Forces
    physics = PhysicsEngine.calculatePhysics(state);

    // 2. Apply Forward Physics
    const hullDrag = state.boatSpeed * state.boatSpeed * 0.05;
    const netForwardForce = physics.driveForce - hullDrag;
    let newBoatSpeed = state.boatSpeed + (netForwardForce * deltaTime * 2.0);
    if (isNaN(newBoatSpeed) || newBoatSpeed < 0) newBoatSpeed = 0;

    // 3. Angular Physics (Steering)
    const steerSpeed = Math.max(state.boatSpeed, 0);
    const speedFactor = steerSpeed / (steerSpeed + 6.0);
    let rudderForce = state.rudderAngle * speedFactor;
    if (newBoatSpeed < 0.3 && Math.abs(state.rudderAngle) < 2.0) rudderForce = 0;

    let newAngularVelocity = (state.angularVelocity || 0);
    newAngularVelocity += rudderForce * deltaTime * 1.5;

    // Hydrodynamic Damping
    const FPS_60_DT = 0.0166;
    const baseDamping = 0.85; // Stronger damping
    newAngularVelocity *= Math.pow(baseDamping, deltaTime / FPS_60_DT);

    let newHeading = state.boatHeading + newAngularVelocity;
    newHeading = ((newHeading % 360) + 360) % 360;

    // 4. Heel Physics
    // Apparent wind from starboard (positive angle) should heel to port (positive heel)
    const heelSide = physics.apparentWindAngle >= 0 ? 1 : -1;
    const targetHeel = Math.min(45, physics.heelForce * 20) * heelSide;
    const heelDiff = targetHeel - state.heelAngle;
    const newHeel = state.heelAngle + (heelDiff * deltaTime * 2.0);

    state = {
        ...state,
        boatSpeed: newBoatSpeed,
        boatHeading: newHeading,
        heelAngle: newHeel,
        angularVelocity: newAngularVelocity
    };
}

function renderSea(t: number) {
    if (!seaCtx || !seaCanvas) return;
    const ctx = seaCtx;
    const canvas = seaCanvas;

    currentSeaSpeed += (state.boatSpeed - currentSeaSpeed) * 0.1;
    waveOffset += currentSeaSpeed * 0.1;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    const angleRad = (state.boatHeading * Math.PI) / 180;
    const flowX = -Math.sin(angleRad) * waveOffset * 5;
    const flowY = Math.cos(angleRad) * waveOffset * 5;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;

    const gridSize = 100;
    const cols = Math.ceil(canvas.width / gridSize) + 2;
    const rows = Math.ceil(canvas.height / gridSize) + 2;
    const offsetX = flowX % gridSize;
    const offsetY = flowY % gridSize;

    ctx.beginPath();
    for (let i = -1; i < cols; i++) {
        for (let j = -1; j < rows; j++) {
            const x = (i * gridSize) + offsetX - canvas.width / 2;
            const y = (j * gridSize) + offsetY - canvas.height / 2;

            for (let k = 0; k < gridSize; k += 10) {
                const wx = x + k;
                const waveY = Math.sin((wx + (t * 0.001) * 50) * 0.05) * 5;
                const wy = y + waveY + (k * 0.1);
                if (k === 0) ctx.moveTo(wx, wy);
                else ctx.lineTo(wx, wy);
            }
        }
    }
    ctx.stroke();

    ctx.rotate(angleRad);
    if (currentSeaSpeed > 1) {
        ctx.beginPath();
        const wakeLength = currentSeaSpeed * 10 + 50;
        const wakeWidth = currentSeaSpeed * 5 + 20;
        const grdWake = ctx.createLinearGradient(0, 0, 0, wakeLength);
        grdWake.addColorStop(0, 'rgba(255,255,255,0.4)');
        grdWake.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grdWake;
        ctx.moveTo(0, 20);
        ctx.lineTo(-wakeWidth, wakeLength);
        ctx.lineTo(0, wakeLength * 0.8);
        ctx.fill();
        ctx.moveTo(0, 20);
        ctx.lineTo(wakeWidth, wakeLength);
        ctx.lineTo(0, wakeLength * 0.8);
        ctx.fill();
    }
    ctx.restore();
}

function renderParticles() {
    if (!particleCtx || !particleCanvas) return;
    const ctx = particleCtx;
    const canvas = particleCanvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const awaRad = (physics.apparentWindAngle * Math.PI) / 180;
    const boatHeadingRad = (state.boatHeading * Math.PI) / 180;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const globalWindRad = awaRad + boatHeadingRad;

    const flowVx = Math.sin(globalWindRad + Math.PI) * (physics.apparentWindSpeed * 0.4 + 2);
    const flowVy = -Math.cos(globalWindRad + Math.PI) * (physics.apparentWindSpeed * 0.4 + 2);

    const spawnCount = Math.floor(physics.apparentWindSpeed / 3) + 3;
    for (let i = 0; i < spawnCount; i++) {
        if (particles.length < MAX_PARTICLES) {
            let sx, sy;
            const margin = 50;
            if (Math.random() > 0.5) {
                sx = flowVx > 0 ? -margin : canvas.width + margin;
                sy = Math.random() * canvas.height;
            } else {
                sx = Math.random() * canvas.width;
                sy = flowVy > 0 ? -margin : canvas.height + margin;
            }
            particles.push({
                x: sx, y: sy, vx: flowVx, vy: flowVy,
                life: Math.random() * 0.5 + 0.5,
                alpha: Math.random() * 0.5 + 0.2
            });
        }
    }

    const hullA = 48; const hullB = 24;
    const sailAngleRad = (state.sailAngle * Math.PI) / 180;
    const totalSailAngleRad = boatHeadingRad + sailAngleRad;
    const sailLen = 60;

    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.003;
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const localX = dx * Math.cos(-boatHeadingRad) - dy * Math.sin(-boatHeadingRad);
        const localY = dx * Math.sin(-boatHeadingRad) + dy * Math.cos(-boatHeadingRad);
        // Hull Collision
        if ((localX * localX) / (hullB * hullB) + (localY * localY) / (hullA * hullA) < 1.1) return false;

        // Main Sail Collision
        const sLocalX = dx * Math.cos(-totalSailAngleRad) - dy * Math.sin(-totalSailAngleRad);
        const sLocalY = dx * Math.sin(-totalSailAngleRad) + dy * Math.cos(-totalSailAngleRad);
        if (Math.abs(sLocalX) < 5 && sLocalY < 0 && sLocalY > -sailLen) return false;

        return p.life > 0 && p.x > -100 && p.x < canvas.width + 100 && p.y > -100 && p.y < canvas.height + 100;
    });

    const isStalled = physics.mainIsStalled || physics.jibIsStalled;

    particles.forEach(p => {
        let hue = 200; let saturation = 80; let lightness = 60;
        if (isStalled) { hue = 0; lightness = 50 + Math.random() * 20; }
        else if (physics.efficiency > 0.8) { hue = 150; saturation = 100; }
        const alpha = p.alpha * (p.life / 1);
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, 90%, ${alpha})`;
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        ctx.fill();
    });
}
