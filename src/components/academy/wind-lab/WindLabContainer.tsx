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
    const [jibInput, setJibInput] = useState(15);
    const [windSpeedInput, setWindSpeedInput] = useState(15);
    const [windDirInput, setWindDirInput] = useState(0);

    // Simulation State (Synced from worker)
    const [simState, setSimState] = useState<WindLabState>({
        trueWindSpeed: 15,
        trueWindDirection: 0,
        boatHeading: 45,
        boatSpeed: 0,
        sailAngle: 15,
        jibAngle: 15,
        heelAngle: 0,
        rudderAngle: 0,
        angularVelocity: 0
    });
    const [simPhysics, setSimPhysics] = useState<DerivedPhysics>(PhysicsEngine.calculatePhysics(simState));

    const t = useTranslations('wind_lab');
    const { toggleAudio, playWinchClick } = useWindLabAudio(simState, simPhysics);

    useEffect(() => {
        if (!seaCanvasRef.current || !particleCanvasRef.current) return;
        if (workerRef.current) return;

        const worker = new Worker(new URL('./wind-lab.worker.ts', import.meta.url));
        workerRef.current = worker;

        try {
            const seaOffscreen = seaCanvasRef.current.transferControlToOffscreen();
            const particleOffscreen = particleCanvasRef.current.transferControlToOffscreen();

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
        } catch (err) {
            console.warn("WindLab: Worker init skipped", err);
        }
    }, []);

    useEffect(() => {
        workerRef.current?.postMessage({
            type: 'UPDATE_INPUTS',
            payload: {
                rudderAngle: rudderInput,
                sailAngle: sailInput,
                jibAngle: jibInput,
                trueWindSpeed: windSpeedInput,
                trueWindDirection: windDirInput
            }
        });
    }, [rudderInput, sailInput, jibInput, windSpeedInput, windDirInput]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Wind Side for Visuals
    const windSide = Math.sign(simPhysics.apparentWindAngle || 0.01) || 1;

    return (
        <div className="fixed inset-0 h-[100dvh] bg-slate-950 text-white p-2 md:p-4 flex flex-col overflow-hidden select-none">
            {/* Header with full localization */}
            <h1 className="text-xl md:text-2xl font-black mb-2 md:mb-4 flex items-center gap-2 flex-none italic tracking-tighter uppercase">
                <span className="text-cyan-500">{t('title')}:</span>
                <span className="text-white">{t('subtitle')}</span>
                <div className="ml-auto flex items-center gap-3">
                    <button
                        onClick={() => {
                            const newState = !isMuted;
                            setIsMuted(newState);
                            toggleAudio(newState);
                        }}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-full uppercase transition-all duration-300 ${!isMuted ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.6)]' : 'bg-slate-800 text-slate-500 border border-white/5'}`}
                    >
                        {isMuted ? t('audio_off') : t('audio_on')}
                    </button>
                    <button
                        onClick={() => setShowGhost(!showGhost)}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-full uppercase transition-all duration-300 ${showGhost ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-slate-500 border border-white/5'}`}
                    >
                        {showGhost ? t('ghost_on') : t('ghost_off')}
                    </button>
                </div>
            </h1>

            <div className={`flex flex-1 gap-2 md:gap-4 transition-transform duration-75 min-h-0 ${simState.boatSpeed > 15 ? 'animate-pulse' : ''}`}>
                {/* 3D Visualization Area */}
                <div
                    className="flex-1 bg-slate-900 rounded-3xl relative overflow-visible flex items-center justify-center border border-white/5 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]"
                    style={{ background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)' }}
                >
                    {/* Sea Layer */}
                    <canvas ref={seaCanvasRef} className="absolute inset-0 w-full h-full opacity-60 rounded-3xl" />
                    <canvas ref={particleCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: 'screen' }} />

                    {/* 3D Projection Engine */}
                    <div className="relative w-full h-full flex items-center justify-center pointer-events-none" style={{ perspective: '1600px' }}>
                        <div
                            className="relative w-full h-full flex items-center justify-center transition-transform duration-1000 ease-out"
                            style={{
                                transform: 'rotateX(52deg) rotateZ(-38deg)',
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            {/* Projections on Water Layer */}
                            <div className="absolute inset-0 z-0 opacity-40" style={{ transform: 'translateZ(-2px)' }}>
                                <GhostBoatOverlay
                                    boatHeading={simState.boatHeading}
                                    apparentWindAngle={simPhysics.apparentWindAngle}
                                    visible={showGhost}
                                />
                                <VectorVisionOverlay
                                    physics={simPhysics}
                                    visible={showVectors}
                                />
                            </div>

                            {/* Circular Tactical Display Floor */}
                            <div className="absolute w-[400px] h-[400px] border border-cyan-500/10 rounded-full flex items-center justify-center" style={{ transform: 'translateZ(-5px)' }}>
                                <div className="absolute inset-0 border-[0.5px] border-cyan-500/5 rounded-full scale-90" />
                                <div className="absolute inset-0 border-[0.5px] border-cyan-500/5 rounded-full scale-75" />
                                <div className="absolute inset-x-0 h-[1px] bg-cyan-500/5" />
                                <div className="absolute inset-y-0 w-[1px] bg-cyan-500/5" />
                            </div>

                            {/* The Boat Representation (Isometric High Fidelity) */}
                            <div
                                className="relative flex items-center justify-center z-10"
                                style={{
                                    width: '100px',
                                    height: '240px',
                                    transform: `rotateZ(${simState.boatHeading}deg) rotateY(${simState.heelAngle}deg)`,
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                {/* Hull (Multi-layered 3D Shell) */}
                                <div className={`relative w-full h-full rounded-[50%_50%_18%_18%] border-2 ${simPhysics.efficiency > 0.8 ? 'border-cyan-400 shadow-[0_0_40px_cyan,inset_0_0_20px_cyan]' : 'border-white/30 shadow-2xl'} bg-slate-950/95 backdrop-blur-3xl transition-all duration-300`} style={{ transform: 'translateZ(20px)' }}>
                                    {/* Deck detail */}
                                    <div className="absolute inset-2 border border-white/10 rounded-[50%_50%_18%_18%]" />
                                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-14 h-28 border border-white/20 rounded-md bg-black/70 shadow-inner flex items-center justify-center">
                                        <div className="w-10 h-20 border border-cyan-500/10 rounded" />
                                    </div>
                                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-1 h-32 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
                                    {/* Reflection shine */}
                                    <div className="absolute top-1/2 left-0 w-full h-[50%] bg-white/5 skew-y-12 blur-sm pointer-events-none" />
                                </div>

                                {/* Main Sail (Boom + Cloth) */}
                                <div
                                    className={`absolute top-[48%] left-1/2 origin-bottom transition-all duration-300 ease-out`}
                                    style={{
                                        width: '4px',
                                        height: '220px',
                                        transform: `translate(-50%, -100%) rotateY(${simState.heelAngle * 0.45}deg) rotateZ(${simState.sailAngle * -windSide}deg) translateZ(45px)`,
                                        transformStyle: 'preserve-3d'
                                    }}
                                >
                                    {/* Boom */}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-52 bg-gradient-to-t from-cyan-400 to-cyan-200 shadow-[0_0_25px_cyan]" />
                                    {/* Sail Cloth */}
                                    <div
                                        className={`absolute bottom-0 h-48 border-t-2 border-r-2 ${simPhysics.mainIsStalled ? 'border-red-500 bg-red-500/30' : 'border-cyan-300/60 bg-cyan-400/15'}`}
                                        style={{
                                            width: '200px',
                                            left: windSide > 0 ? '50%' : 'auto',
                                            right: windSide > 0 ? 'auto' : '50%',
                                            borderRadius: '0 100% 0 0',
                                            transform: windSide > 0 ? 'scaleX(-1)' : 'none',
                                            transformOrigin: 'bottom left',
                                            backdropFilter: 'blur(3px)'
                                        }}
                                    >
                                        <div className="absolute inset-x-5 inset-y-12 border-r border-white/10" />
                                        <div className="absolute inset-x-10 inset-y-24 border-r border-white/10" />
                                    </div>
                                </div>

                                {/* Jib / Genoa (Forestay + Cloth) */}
                                <div
                                    className={`absolute top-[4%] left-1/2 origin-top transition-all duration-300 ease-out`}
                                    style={{
                                        width: '2px',
                                        height: '180px',
                                        transform: `translate(-50%, 0) rotateY(${simState.heelAngle * 0.25}deg) rotateZ(${simState.jibAngle * -windSide}deg) translateZ(40px)`,
                                        transformStyle: 'preserve-3d'
                                    }}
                                >
                                    <div
                                        className={`absolute top-0 h-44 border-b-2 border-r-2 ${simPhysics.jibIsStalled ? 'border-orange-500 bg-orange-500/30' : 'border-cyan-100/40 bg-cyan-300/10'}`}
                                        style={{
                                            width: '160px',
                                            left: windSide > 0 ? '50%' : 'auto',
                                            right: windSide > 0 ? 'auto' : '50%',
                                            borderRadius: '0 0 100% 0',
                                            transform: windSide > 0 ? 'scaleX(-1)' : 'none',
                                            transformOrigin: 'top left',
                                            backdropFilter: 'blur(2px)'
                                        }}
                                    />
                                </div>

                                {/* Rudder Blade (3D Layered) */}
                                <div className="absolute -bottom-12 left-1/2 w-3 h-18 bg-red-600 border-2 border-red-400/50 origin-top transform -translate-x-1/2 rounded-full shadow-[0_10px_30px_red]"
                                    style={{ transform: `translateX(-50%) translateZ(10px) rotateZ(${simState.rudderAngle}deg)` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* HUD Wind Indicator (Static HUD) */}
                    <div className="absolute top-10 right-10 w-36 h-36 flex flex-col items-center justify-center p-5 bg-slate-950/85 backdrop-blur-2xl rounded-full border border-white/15 shadow-2xl z-20">
                        <div
                            className="w-18 h-18 flex items-center justify-center transition-transform duration-700"
                            style={{ transform: `rotate(${simState.trueWindDirection + 180}deg)` }}
                        >
                            <svg width="28" height="64" viewBox="0 0 24 60" fill="none" className="drop-shadow-[0_0_25px_rgba(34,211,238,0.9)]">
                                <path d="M12 60V10M12 10L4 22M12 10L20 22" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="flex flex-col items-center mt-2">
                            <span className="text-lg font-black text-cyan-400 leading-none">{simState.trueWindSpeed}</span>
                            <span className="text-[10px] font-black text-slate-500 tracking-tighter uppercase">{t('controls.knots')}</span>
                        </div>
                    </div>
                </div>

                {/* Dashboard Controls (Right Panel) */}
                <div className="w-80 md:w-96 flex flex-col gap-4 h-full min-h-0">

                    {/* TOP: Telemetry & Efficiency (Always localized) */}
                    <div className="bg-slate-950/95 backdrop-blur-3xl rounded-3xl border border-cyan-500/30 p-5 shadow-2xl flex flex-col gap-6 shrink-0 relative overflow-visible">
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-500 rounded-full blur-2xl opacity-20" />
                        <HoloDashboard state={simState} physics={simPhysics} />

                        <div className="flex flex-col gap-5 border-t border-white/10 pt-5">
                            <TrimFeedback
                                currentSailAngle={sailInput}
                                optimalSailAngle={PhysicsEngine.getOptimalSailAngle(simPhysics.apparentWindAngle)}
                                efficiency={simPhysics.mainEfficiency}
                                isStalled={simPhysics.mainIsStalled}
                                label={t('telemetry.efficiency') + " (MAYOR)"}
                            />
                            <TrimFeedback
                                currentSailAngle={jibInput}
                                optimalSailAngle={PhysicsEngine.getOptimalSailAngle(simPhysics.apparentWindAngle, 5)}
                                efficiency={simPhysics.jibEfficiency}
                                isStalled={simPhysics.jibIsStalled}
                                label={t('telemetry.efficiency') + " (GÉNOVA)"}
                            />
                        </div>
                    </div>

                    {/* BOTTOM: Input Grids (Localized & Overflow Fixed) */}
                    <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">

                        {/* Compass & Wind Intensity Area */}
                        <div className="flex flex-col gap-4 h-full">
                            <div className="flex-1 bg-slate-950/95 backdrop-blur-2xl rounded-3xl border border-cyan-500/30 p-3 shadow-xl flex flex-col items-center justify-between relative overflow-visible">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-cyan-500/50 rounded-b-full shadow-[0_0_15px_cyan]" />
                                <div className="mt-4 flex flex-col items-center w-full">
                                    <CompassDial label="" value={windDirInput} onChange={setWindDirInput} />
                                    <div className="text-center font-black text-cyan-400 mt-4 text-[10px] tracking-widest uppercase italic">
                                        {t('controls.wind_direction')}: {windDirInput.toString().padStart(3, '0')}°
                                    </div>
                                </div>

                                <div className="w-full px-5 mb-5">
                                    <div className="flex justify-between text-[10px] font-black text-slate-500 mb-3 tracking-widest uppercase">
                                        <span>{t('controls.wind_speed')}</span>
                                        <span className="text-cyan-400 font-mono">{windSpeedInput} KTS</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="40" value={windSpeedInput} onChange={(e) => setWindSpeedInput(Number(e.target.value))}
                                        className="w-full h-1.5 bg-slate-900 rounded-full appearance-none cursor-pointer accent-cyan-500 border border-white/5"
                                    />
                                </div>
                            </div>

                            {/* Steering (Rudder) Area */}
                            <div className="h-36 bg-slate-950/95 backdrop-blur-2xl rounded-3xl border border-cyan-500/30 p-5 shadow-xl flex flex-col justify-center relative overflow-visible">
                                <label className="text-[11px] font-black text-slate-400 tracking-widest uppercase mb-4 italic">{t('controls.rudder')}</label>
                                <input
                                    type="range" min="-45" max="45" value={rudderInput} onChange={(e) => setRudderInput(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-900 rounded-full appearance-none cursor-pointer accent-cyan-500 border border-white/5"
                                />
                                <div className="flex justify-between mt-4 text-[11px] font-black tracking-tighter uppercase italic">
                                    <span className="text-slate-500">{t('controls.port')}</span>
                                    <span className="text-cyan-400 font-mono text-xs">{rudderInput}°</span>
                                    <span className="text-slate-500">{t('controls.stbd')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sails (Winch) Control Area */}
                        <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl border border-cyan-500/30 p-5 shadow-xl flex justify-around items-center h-full relative overflow-visible">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-cyan-500/50 rounded-b-full shadow-[0_0_15px_cyan]" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-cyan-500/50 rounded-t-full shadow-[0_0_15px_cyan]" />

                            <div className="flex flex-col h-full justify-around items-center w-full">
                                <HydraulicWinch label="MAYOR" min={0} max={90} value={sailInput} onChange={(val) => { setSailInput(val); playWinchClick(); }} />
                                <div className="h-4" /> {/* Spacer to prevent overlap of labels if they grow */}
                                <HydraulicWinch label="GÉNOVA" min={0} max={90} value={jibInput} onChange={(val) => { setJibInput(val); playWinchClick(); }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
