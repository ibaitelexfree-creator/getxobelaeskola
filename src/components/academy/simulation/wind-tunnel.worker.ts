
// wind-tunnel.worker.ts
// Aislamos la física y el renderizado 2D de partículas para el Laboratorio de Viento.

let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D | null;
let particles: { x: number, y: number, speed: number, life: number }[] = [];
let windDirection = 0;
let windSpeed = 12;

interface BoatState {
    heading: number;
    mainsailAngle: number;
    sheetTension: number;
    speed: number;
    heel: number;
    luffing: boolean;
}

let boatState: BoatState = {
    heading: 45,
    mainsailAngle: 15,
    sheetTension: 0.8,
    speed: 0,
    heel: 0,
    luffing: false
};

self.onmessage = (e) => {
    const { type, payload } = e.data;

    switch (type) {
        case 'INIT':
            canvas = payload.canvas;
            ctx = canvas.getContext('2d');
            windDirection = payload.windDirection;
            windSpeed = payload.windSpeed;
            boatState = payload.boatState;
            initParticles();
            requestAnimationFrame(render);
            break;
        case 'UPDATE_ENV':
            windDirection = payload.windDirection;
            windSpeed = payload.windSpeed;
            break;
        case 'UPDATE_BOAT':
            boatState = { ...boatState, ...payload.boatState };
            break;
    }
};

function initParticles() {
    particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: (Math.random() * 0.5 + 0.5) * windSpeed,
            life: Math.random()
        });
    }
}

function updatePhysics() {
    const relativeWindAngle = (windDirection - boatState.heading + 360) % 360;
    const actualBoomAngle = Math.abs(boatState.mainsailAngle);
    const aoa = Math.abs(relativeWindAngle - actualBoomAngle);

    let efficiency = 0;
    let luffing = false;
    let heelingForce = 0;

    if (Math.abs(relativeWindAngle) < 30 || Math.abs(relativeWindAngle) > 330) {
        luffing = true;
        efficiency = 0;
    } else {
        if (aoa < 5) {
            luffing = true;
            efficiency = 0.1;
        } else if (aoa >= 5 && aoa <= 25) {
            efficiency = 1 - (Math.abs(aoa - 15) / 15);
            heelingForce = efficiency * windSpeed * 0.8;
        } else {
            efficiency = 0.3;
            heelingForce = windSpeed * 1.5;
        }
    }

    const targetSpeed = efficiency * (windSpeed / 2);
    boatState.speed = boatState.speed + (targetSpeed - boatState.speed) * 0.05;
    const targetHeel = heelingForce * 2;
    boatState.heel = boatState.heel + (targetHeel - boatState.heel) * 0.05;
    boatState.luffing = luffing;

    // Send state back to UI thread for dashboard
    self.postMessage({ type: 'STATE_UPDATE', payload: boatState });
}

function render(time: number) {
    if (!ctx || !canvas) return;

    updatePhysics();

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Particles
    if (!ctx) return;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    particles.forEach(p => {
        if (!ctx) return;
        const rad = (windDirection + 180) * Math.PI / 180;
        p.x += Math.sin(rad) * p.speed * 0.2;
        p.y -= Math.cos(rad) * p.speed * 0.2;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - Math.sin(rad) * 10, p.y + Math.cos(rad) * 10);
        ctx.stroke();
    });

    // Boat
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((boatState.heading) * Math.PI / 180);

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.bezierCurveTo(30, -30, 30, 60, 0, 80);
    ctx.bezierCurveTo(-30, 60, -30, -30, 0, -60);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, 10, 4, 0, Math.PI * 2);
    ctx.fill();

    // Sail
    ctx.save();
    ctx.translate(0, 10);
    const windRelative = (windDirection - boatState.heading + 360) % 360;
    const boomSide = (windRelative > 0 && windRelative < 180) ? -1 : 1;
    const boomAngle = boatState.mainsailAngle * boomSide;
    ctx.rotate(boomAngle * Math.PI / 180);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 80);
    ctx.stroke();

    ctx.strokeStyle = boatState.luffing ? '#ef4444' : (boatState.speed > 5 ? '#22c55e' : '#fbbf24');
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const liftDir = boomSide * -1;
    const controlX = boatState.luffing ? (Math.random() - 0.5) * 10 : liftDir * 20;
    ctx.quadraticCurveTo(controlX, 40, 0, 80);
    ctx.stroke();

    // Telltales
    [20, 40, 60].forEach(y => {
        if (!ctx) return;
        const t = y / 80;
        const tx = 2 * (1 - t) * t * controlX;
        ctx.beginPath();
        ctx.moveTo(tx, y);
        if (boatState.luffing) {
            ctx.lineTo(tx + (Math.random() - 0.5) * 15, y + (Math.random() - 0.5) * 15);
            ctx.strokeStyle = '#ef4444';
        } else {
            ctx.lineTo(tx, y + 10);
            ctx.strokeStyle = '#22c55e';
        }
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    ctx.restore();
    ctx.restore();

    requestAnimationFrame(render);
}
