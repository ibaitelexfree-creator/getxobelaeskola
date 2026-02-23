'use client';

import React, { useRef, useEffect } from 'react';
import { WindLabState, DerivedPhysics } from '../physics/PhysicsEngine';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    alpha: number;
}

interface ParticleSystemCanvasProps {
    state: WindLabState;
    physics: DerivedPhysics;
}

export const ParticleSystemCanvas: React.FC<ParticleSystemCanvasProps> = ({ state, physics }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const MAX_PARTICLES = 1500;

    const stateRef = useRef(state);
    const physicsRef = useRef(physics);

    useEffect(() => {
        stateRef.current = state;
        physicsRef.current = physics;
    }, [state, physics]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const initParticle = (p: Partial<Particle> = {}): Particle => {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: 0,
                vy: 0,
                life: Math.random() * 0.5 + 0.5,
                alpha: Math.random() * 0.5 + 0.2,
                ...p
            };
        };

        const update = () => {
            const currentState = stateRef.current;
            const currentPhysics = physicsRef.current;

            // Apparent wind direction in radians
            const awaRad = (currentPhysics.apparentWindAngle * Math.PI) / 180;
            const boatHeadingRad = (currentState.boatHeading * Math.PI) / 180;

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            const globalWindRad = awaRad + boatHeadingRad;

            const flowVx = Math.sin(globalWindRad + Math.PI) * (currentPhysics.apparentWindSpeed * 0.4 + 2);
            const flowVy = -Math.cos(globalWindRad + Math.PI) * (currentPhysics.apparentWindSpeed * 0.4 + 2);

            // Spawn rate based on wind speed
            const spawnCount = Math.floor(currentPhysics.apparentWindSpeed / 3) + 3;
            for (let i = 0; i < spawnCount; i++) {
                if (particles.current.length < MAX_PARTICLES) {
                    let sx, sy;
                    const margin = 50;
                    if (Math.random() > 0.5) {
                        sx = flowVx > 0 ? -margin : canvas.width + margin;
                        sy = Math.random() * canvas.height;
                    } else {
                        sx = Math.random() * canvas.width;
                        sy = flowVy > 0 ? -margin : canvas.height + margin;
                    }
                    particles.current.push(initParticle({ x: sx, y: sy, vx: flowVx, vy: flowVy }));
                }
            }

            const hullA = 48;
            const hullB = 24;

            const sailAngleRad = (currentState.sailAngle * Math.PI) / 180;
            const totalSailAngleRad = boatHeadingRad + sailAngleRad;
            const sailLen = 60;

            // Update particles
            particles.current = particles.current.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.003;

                const dx = p.x - centerX;
                const dy = p.y - centerY;

                const localX = dx * Math.cos(-boatHeadingRad) - dy * Math.sin(-boatHeadingRad);
                const localY = dx * Math.sin(-boatHeadingRad) + dy * Math.cos(-boatHeadingRad);

                // 2. Hull Deflection (Ellipse)
                const ellipseCheck = (localX * localX) / (hullB * hullB) + (localY * localY) / (hullA * hullA);
                if (ellipseCheck < 1.1) {
                    // Particle HIT the hull -> Kill it (Disappear)
                    p.life = 0;
                    return false; // Remove from array immediately
                }

                // 3. Sail Deflection (Line segment)
                // Let's transform to Sail-local coordinates
                const sLocalX = dx * Math.cos(-totalSailAngleRad) - dy * Math.sin(-totalSailAngleRad);
                const sLocalY = dx * Math.sin(-totalSailAngleRad) + dy * Math.cos(-totalSailAngleRad);

                // If particle hits the sail
                if (Math.abs(sLocalX) < 5 && sLocalY < 0 && sLocalY > -sailLen) {
                    // Particle HIT the sail -> Kill it
                    p.life = 0;
                    return false;
                }

                return p.life > 0 && p.x > -100 && p.x < canvas.width + 100 && p.y > -100 && p.y < canvas.height + 100;
            });
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const currentPhysics = physicsRef.current;

            particles.current.forEach(p => {
                let hue = 200;
                let saturation = 80;
                let lightness = 60;

                const isStalled = currentPhysics.mainIsStalled || currentPhysics.jibIsStalled;

                if (isStalled) {
                    hue = 0;
                    lightness = 50 + Math.random() * 20;
                } else if (currentPhysics.efficiency > 0.8) {
                    hue = 150;
                    saturation = 100;
                }

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
        };

        const loop = () => {
            update();
            draw();
            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};
