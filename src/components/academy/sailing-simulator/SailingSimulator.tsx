'use client';

import React, { useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { InputController } from './InputController';
import { AudioManager } from './AudioManager';
import { HUDManager } from './HUDManager';

/**
 * SailingSimulator v2 (Optimized)
 * This component acts as a bridge between the browser DOM/Inputs
 * and the Web Worker where the 3D engine (Three.js) and Physics run.
 */
export const SailingSimulator: React.FC = () => {
    const t = useTranslations('wind_lab');
    const locale = useLocale();
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const shadowRootRef = useRef<ShadowRoot | null>(null);
    const audioRef = useRef<AudioManager | null>(null);
    const hudRef = useRef<HUDManager | null>(null);
    const workerRef = useRef<Worker | null>(null);
    const inputRef = useRef<InputController | null>(null);

    // State for UI
    const [gameOver, setGameOver] = React.useState(false);
    const [gameOverData, setGameOverData] = React.useState<{ score: number, leaderboard: any[] }>({ score: 0, leaderboard: [] });
    const [playerName, setPlayerName] = React.useState('');

    useEffect(() => {
        if (!containerRef.current) return;

        // 1. Ensure Shadow DOM
        if (!shadowRootRef.current) {
            shadowRootRef.current = containerRef.current.attachShadow({ mode: 'open' });
        }

        const shadowRoot = shadowRootRef.current;

        // 2. Create/Recreate Canvas to avoid TransferControl error on re-mount
        // We clear the shadowRoot each time to ensure a fresh canvas element
        shadowRoot.innerHTML = '';

        // Inject Styles
        const styles = document.createElement('style');
        styles.textContent = `
            :host { display: block; width: 100%; height: 100%; overflow: hidden; position: relative; background: #000; }
            #simulator-container { width: 100%; height: 100%; position: relative; }
            canvas { display: block; width: 100%; height: 100%; }
        `;
        shadowRoot.appendChild(styles);

        // Create DOM Structure
        const simulatorContainer = document.createElement('div');
        simulatorContainer.id = 'simulator-container';
        const canvas = document.createElement('canvas');
        simulatorContainer.appendChild(canvas);
        shadowRoot.appendChild(simulatorContainer);
        canvasRef.current = canvas;

        // 3. Initialize Local Systems (Main Thread)
        const hudLabels = {
            score: t('telemetry.score') || 'PUNTUACIÓN',
            buoys: t('telemetry.buoys') || 'BOYAS',
            speed: t('telemetry.boat_speed') || 'VELOCIDAD',
            efficiency: t('telemetry.efficiency') || 'EFICIENCIA',
            knots: t('controls.knots') || 'NUDOS',
            optimal: 'OPTIMAL',
            west: locale === 'eu' ? 'M' : 'O'
        };
        const hud = new HUDManager(shadowRoot, hudLabels);
        hudRef.current = hud;

        const audio = new AudioManager();
        audioRef.current = audio;

        const input = new InputController();
        inputRef.current = input;

        // 5. Initialize Worker
        const worker = new Worker(new URL('./simulator.worker.ts', import.meta.url));
        worker.onerror = (e) => {
            console.error('CRITICAL WORKER ERROR:', e.message, e.filename, e.lineno);
        };
        workerRef.current = worker;

        // 6. Transfer Canvas Control to Worker
        const offscreen = canvas.transferControlToOffscreen();
        worker.postMessage({
            type: 'INIT',
            payload: {
                canvas: offscreen,
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight,
                pixelRatio: window.devicePixelRatio
            }
        }, [offscreen]);

        // 7. Handle Worker Messages
        worker.onmessage = (e) => {
            const { type, payload } = e.data;

            if (type === 'STATE_UPDATE') {
                // Update HUD (Main Thread UI)
                hud.update(
                    payload.score,
                    payload.buoys,
                    payload.maxBuoys,
                    payload.boatState,
                    payload.apparentWind,
                    payload.trueWindAngle,
                    payload.objectiveState,
                    payload.eventState
                );

                // Update Audio (Main Thread AudioContext)
                audio.update(
                    payload.boatState.speed,
                    payload.apparentWind.speed,
                    payload.boatState.efficiency
                );
            } else if (type === 'GAME_OVER') {
                setGameOverData(payload);
                setGameOver(true);
            }
        };

        // 8. Handle Input Relay
        let inputInterval: any;
        const startInputRelay = () => {
            inputInterval = setInterval(() => {
                input.update(0.016); // Simulate dt for local internal logic
                worker.postMessage({
                    type: 'INPUT',
                    payload: {
                        rudderAngle: input.rudderAngle,
                        sailAngle: input.sailAngle
                    }
                });
            }, 16); // 60fps relay
        };
        startInputRelay();

        // 9. Audio Interaction Init
        const handleUserInteraction = () => {
            audio.init();
            window.removeEventListener('keydown', handleUserInteraction);
            window.removeEventListener('click', handleUserInteraction);
        };
        window.addEventListener('keydown', handleUserInteraction);
        window.addEventListener('click', handleUserInteraction);

        // 10. Resize Observer
        const resizeObserver = new ResizeObserver(() => {
            if (!containerRef.current) return;
            worker.postMessage({
                type: 'RESIZE',
                payload: {
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                }
            });
        });
        resizeObserver.observe(containerRef.current);

        // 11. Cleanup
        return () => {
            clearInterval(inputInterval);
            resizeObserver.disconnect();
            window.removeEventListener('keydown', handleUserInteraction);
            window.removeEventListener('click', handleUserInteraction);
            worker.terminate();
            input.dispose();
            hud.dispose();
            audio.dispose();
        };
    }, []);

    const handleSaveScore = () => {
        // Since ScoringManager is in worker, we might need a specific bridge for leaderboard saving
        // For now, reload as was original or trigger a worker message
        console.log("Saving score for:", playerName, gameOverData.score);
        // Implement worker call if needed to save via DB
    };

    const handleRestart = () => {
        window.location.reload();
    };

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100dvh', position: 'relative' }}>
            {gameOver && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', color: 'white', zIndex: 1000,
                    fontFamily: 'sans-serif'
                }}>
                    <h1 style={{ fontSize: '3rem', color: '#00e5ff', marginBottom: '10px', textAlign: 'center' }}>{t('game_over.title')}</h1>
                    <div style={{ fontSize: '1.5rem', marginBottom: '30px', textAlign: 'center' }}>{t('game_over.buoys_collected')}</div>
                    <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                        <p style={{ marginBottom: '5px', textTransform: 'uppercase', fontSize: '0.9rem', color: '#888' }}>{t('game_over.final_score')}</p>
                        <div style={{ fontSize: '4rem', fontWeight: 'bold' }}>{gameOverData.score}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
                        <input
                            type="text"
                            placeholder={t('game_over.name_placeholder')}
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            style={{ padding: '10px', fontSize: '1.2rem', borderRadius: '5px', border: 'none', width: '250px', textAlign: 'center' }}
                        />
                        <button onClick={handleSaveScore} style={{ padding: '10px 20px', fontSize: '1.2rem', fontWeight: 'bold', background: '#00e5ff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{t('game_over.save_btn')}</button>
                    </div>
                    <div style={{ width: '90%', maxWidth: '600px', background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '15px' }}>
                        <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '20px', color: '#00e5ff' }}>{t('game_over.ranking_title')}</h3>
                        {gameOverData.leaderboard.map((entry, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <span>{i + 1}. {entry.name}</span>
                                <span style={{ fontWeight: 'bold', color: '#00e5ff' }}>{entry.score}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleRestart} style={{ marginTop: '40px', padding: '15px 40px', fontSize: '1.2rem', background: 'transparent', border: '2px solid #00e5ff', color: '#00e5ff', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>{t('game_over.restart_btn')}</button>
                </div>
            )}
        </div>
    );
};
