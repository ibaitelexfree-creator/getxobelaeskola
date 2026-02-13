'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PhysicsEngine, WindLabState, DerivedPhysics } from './physics/PhysicsEngine';
import { CompassDial } from './controls/CompassDial';
import { HydraulicWinch } from './controls/HydraulicWinch';
import { HoloDashboard } from './controls/HoloDashboard';
import { useWindLabAudio } from './hooks/useWindLabAudio';
import { GhostBoatOverlay } from './visuals/GhostBoatOverlay';
import { VectorVisionOverlay } from './visuals/VectorVisionOverlay';
import { TrimFeedback } from './visuals/TrimFeedback';
import { Tooltip } from './controls/Tooltip';

export const WindLabContainer = () => {
    const workerRef = useRef<Worker | null>(null);
    const seaCanvasRef = useRef<HTMLCanvasElement>(null);
    const particleCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [showGhost, setShowGhost] = useState(true);
    const [showVectors, setShowVectors] = useState(false);

    // UI Local State (Input mirrored)
    const [rudderInput, setRudderInput] = useState(0);
    const [sailInput, setSailInput] = useState(15);
    const [windSpeedInput, setWindSpeedInput] = useState(15);
    const [windDirInput, setWindDirInput] = useState(0);

    // Simulation State (Synced from worker)
    const [simState, setSimState] = useState<WindLabState>({
        trueWindSpeed: 15,
        trueWindDirection: 0,
        boatHeading: 45,
        boatSpeed: 0,
        sailAngle: 15,
        heelAngle: 0,
        rudderAngle: 0,
        angularVelocity: 0
    });
    const [simPhysics, setSimPhysics] = useState<DerivedPhysics>(PhysicsEngine.calculatePhysics(simState));

    const t = useTranslations('wind_lab');
    const { toggleAudio, playWinchClick } = useWindLabAudio(simState, simPhysics);

    useEffect(() => {
        if (!seaCanvasRef.current || !particleCanvasRef.current) return;

        const worker = new Worker(new URL('./wind-lab.worker.ts', import.meta.url));
        workerRef.current = worker;

        const seaOffscreen = seaCanvasRef.current.transferControlToOffscreen();
        const particleOffscreen = particleCanvasRef.current.transferControlToOffscreen();

        // Set dimensions
        seaOffscreen.width = seaCanvasRef.current.clientWidth;
        seaOffscreen.height = seaCanvasRef.current.clientHeight;
        particleOffscreen.width = particleCanvasRef.current.clientWidth;
        particleOffscreen.height = particleCanvasRef.current.clientHeight;

        worker.postMessage({
            type: 'INIT',
            payload: {
                seaCanvas: seaOffscreen,
                particleCanvas: particleOffscreen,
                state: simState
            }
        }, [seaOffscreen, particleOffscreen]);

        worker.onmessage = (e) => {
            if (e.data.type === 'STATE_UPDATE') {
                setSimState(e.data.payload.state);
                setSimPhysics(e.data.payload.physics);
            }
        };

        return () => worker.terminate();
    }, []);

    // Sync Inputs to Worker
    useEffect(() => {
        workerRef.current?.postMessage({
            type: 'UPDATE_INPUTS',
            payload: {
                rudderAngle: rudderInput,
                sailAngle: sailInput,
                trueWindSpeed: windSpeedInput,
                trueWindDirection: windDirInput
            }
        });
    }, [rudderInput, sailInput, windSpeedInput, windDirInput]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div className="fixed inset-0 h-[100dvh] bg-slate-900 text-white p-2 md:p-4 flex flex-col overflow-hidden select-none">
            <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 flex items-center gap-2 flex-none">
                <span className="text-cyan-500">🌬️ {t('title')}:</span>
                <span className="text-white">{t('subtitle')}</span>
                <span className="ml-auto flex items-center gap-4">
                    <button
                        onClick={() => {
                            const newState = !isMuted;
                            setIsMuted(newState);
                            toggleAudio(newState);
                        }}
                        className={`px-3 py-1 text-2xs font-bold rounded uppercase tracking-wider transition-colors ${!isMuted ? 'bg-cyan-500 text-black' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                    >
                        {isMuted ? t('audio_off') : t('audio_on')}
                    </button>
                    <span className="text-2xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">v1.1.0-ISOLATED</span>
                </span>
            </h1>

            <div className={`flex flex-1 gap-2 md:gap-4 transition-transform duration-75 min-h-0 ${simState.boatSpeed > 12 ? 'animate-pulse' : ''}`}>
                {/* Visualization Area */}
                <div
                    className="flex-1 bg-slate-800 rounded-2xl md:rounded-3xl p-2 md:p-4 relative overflow-hidden flex items-center justify-center border border-slate-700 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"
                    style={{
                        transform: simState.boatSpeed > 10
                            ? `translate(${(Math.random() - 0.5) * (simState.boatSpeed - 10)}px, ${(Math.random() - 0.5) * (simState.boatSpeed - 10)}px)`
                            : 'none'
                    }}
                >
                    {/* Isolated Layers */}
                    <canvas ref={seaCanvasRef} className="absolute inset-0 w-full h-full opacity-40" />
                    <canvas ref={particleCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: 'screen' }} />

                    {/* Overlays (Main Thread) */}
                    <GhostBoatOverlay
                        boatHeading={simState.boatHeading}
                        apparentWindAngle={simPhysics.apparentWindAngle}
                        visible={showGhost}
                    />

                    <VectorVisionOverlay
                        physics={simPhysics}
                        visible={showVectors}
                    />

                    {/* Boat Representation */}
                    <div
                        className={`w-24 h-48 bg-slate-700 rounded-full relative shadow-[0_0_40px_rgba(0,0,0,0.5)] border-2 border-slate-600 flex items-center justify-center z-1 transition-all duration-300 ${simPhysics.efficiency > 0.85 ? 'shadow-[0_0_30px_rgba(34,211,238,0.6)] border-cyan-300 animate-pulse' : ''}`}
                        style={{
                            transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            transform: `rotate(${simState.boatHeading}deg) scale(${1 - simState.heelAngle * 0.005})`,
                        }}
                    >
                        <div className="absolute inset-2 border-r border-white/10 rounded-full" />
                        <div
                            className={`absolute top-1/2 left-1/2 w-1.5 h-40 origin-bottom transition-transform duration-100 ${simPhysics.isStalled ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'}`}
                            style={{ transform: `translate(-50%, -100%) rotate(${simState.sailAngle}deg)` }}
                        >
                            <div className="w-1 h-32 bg-slate-400 absolute bottom-0 left-0" />
                        </div>
                        <div className="absolute -bottom-4 left-1/2 w-3 h-14 bg-red-600 origin-top transform -translate-x-1/2 rounded-b"
                            style={{ transform: `translateX(-50%) rotate(${simState.rudderAngle}deg)` }}
                        />
                    </div>

                    {/* Wind Indicator */}
                    <div className="absolute top-10 right-10 w-24 h-24 border border-slate-600 rounded-full flex items-center justify-center">
                        <Tooltip text="Dirección del Viento Real">
                            <div
                                className="w-24 h-24 flex items-center justify-center"
                                style={{ transform: `rotate(${simState.trueWindDirection + 180}deg)` }}
                            >
                                <svg width="24" height="60" viewBox="0 0 24 60" fill="none" className="drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">
                                    <path d="M12 60V10M12 10L4 22M12 10L20 22" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </Tooltip>
                        <span className="absolute bottom-2 text-3xs text-slate-400 font-mono">{simState.trueWindSpeed} kn</span>
                    </div>
                </div>

                {/* Controls Area */}
                <div className="w-72 md:w-80 flex flex-col gap-2 md:gap-4 overflow-hidden min-h-0">
                    <Tooltip text="Indicador de eficiencia de la vela" position="left">
                        <TrimFeedback
                            currentSailAngle={sailInput}
                            optimalSailAngle={PhysicsEngine.getOptimalSailAngle(simPhysics.apparentWindAngle)}
                            efficiency={simPhysics.efficiency}
                            isStalled={simPhysics.isStalled}
                        />
                    </Tooltip>

                    <Tooltip text="Telemetría en tiempo real" position="left">
                        <HoloDashboard state={simState} physics={simPhysics} />
                    </Tooltip>

                    <div className="flex-1 bg-slate-900/60 rounded-2xl border border-white/5 p-2 md:p-4 backdrop-blur-sm shadow-xl flex flex-col gap-2 md:gap-4 min-h-0">
                        <div className="flex gap-2 flex-none">
                            <button onClick={() => setShowGhost(!showGhost)} className={`flex-1 py-2 text-3xs font-black uppercase tracking-tighter rounded border transition-all ${showGhost ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>{showGhost ? t('ghost_on') : t('ghost_off')}</button>
                            <button onClick={() => setShowVectors(!showVectors)} className={`flex-1 py-2 text-3xs font-black uppercase tracking-tighter rounded border transition-all ${showVectors ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>{showVectors ? t('forces_on') : t('forces_off')}</button>
                        </div>

                        <div className="flex justify-between items-stretch gap-2 md:gap-4 flex-1 min-h-0">
                            <Tooltip text="Control de la Escota" position="right" className="flex-1 h-full">
                                <HydraulicWinch label={t('controls.mainsheet')} min={0} max={90} value={sailInput} onChange={(val) => { setSailInput(val); playWinchClick(); }} />
                            </Tooltip>

                            <div className="flex flex-col justify-between items-center py-4">
                                <Tooltip text="Dirección del Viento Real">
                                    <CompassDial label={t('controls.wind_direction')} value={windDirInput} onChange={setWindDirInput} />
                                </Tooltip>

                                <div className="w-full space-y-1 md:space-y-2 mt-2 md:mt-4">
                                    <div className="px-2">
                                        <label className="text-3xs font-bold text-slate-500 tracking-widest uppercase mb-2 block">{t('controls.rudder')}</label>
                                        <input type="range" min="-45" max="45" value={rudderInput} onChange={(e) => setRudderInput(Number(e.target.value))} className="w-full accent-cyan-500" />
                                        <div className="flex justify-between text-3xs font-mono text-slate-500"><span>{t('controls.port')}</span><span className="text-white">{rudderInput}°</span><span>{t('controls.stbd')}</span></div>
                                    </div>

                                    <div className="px-2">
                                        <label className="text-3xs font-bold text-slate-500 tracking-widest uppercase mb-2 block">Velocidad Viento</label>
                                        <input type="range" min="0" max="40" value={windSpeedInput} onChange={(e) => setWindSpeedInput(Number(e.target.value))} className="w-full accent-cyan-500" />
                                        <div className="text-right text-3xs font-mono text-white">{windSpeedInput} {t('controls.knots')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
