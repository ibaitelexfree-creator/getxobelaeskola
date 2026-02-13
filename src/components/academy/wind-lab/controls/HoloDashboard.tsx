'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { DerivedPhysics, WindLabState } from '../physics/PhysicsEngine';

interface HoloDashboardProps {
    state: WindLabState;
    physics: DerivedPhysics;
}

export const HoloDashboard: React.FC<HoloDashboardProps> = ({ state, physics }) => {
    const t = useTranslations('wind_lab');

    return (
        <div className="grid grid-cols-2 gap-1 md:gap-2 bg-slate-900/40 p-2 md:p-3 rounded-2xl border border-white/5 backdrop-blur-md shadow-2xl">
            {/* Speed Gauge */}
            <div className="col-span-2 flex flex-col items-center justify-center p-1 md:p-2 border-b border-white/10 pb-2 md:pb-4 mb-0.5 md:mb-1">
                <span className="text-3xs font-bold text-cyan-500 tracking-[0.2em] mb-0.5 md:mb-1">{t('telemetry.boat_speed').toUpperCase()}</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl md:text-5xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        {state.boatSpeed.toFixed(1)}
                    </span>
                    <span className="text-2xs md:text-xl font-bold text-slate-500">NUDOS</span>
                </div>
            </div>

            {/* VMG Case (Velocity Made Good) - Simplified for this lab as Efficiency */}
            <div className="flex flex-col p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-3xs font-bold text-slate-400 tracking-wider mb-1">{t('telemetry.efficiency').toUpperCase()}</span>
                <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${physics.efficiency > 0.8 ? 'bg-emerald-400' : 'bg-cyan-500'}`}
                            style={{ width: `${physics.efficiency * 100}%` }}
                        />
                    </div>
                    <span className="text-sm font-mono font-bold text-white">{(physics.efficiency * 100).toFixed(0)}%</span>
                </div>
            </div>

            <div className="flex flex-col p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-3xs font-bold text-slate-400 tracking-wider mb-1">{t('telemetry.heel_angle').toUpperCase()}</span>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-mono font-bold text-white">{state.heelAngle.toFixed(0)}°</span>
                    <div className="flex-1 h-[1px] bg-slate-700 relative">
                        <div
                            className="absolute top-1/2 left-1/2 w-4 h-[2px] bg-cyan-400 origin-center"
                            style={{ transform: `translate(-50%, -50%) rotate(${state.heelAngle}deg)` }}
                        />
                    </div>
                </div>
            </div>

            {/* Small Telmetry Grid */}
            <div className="col-span-2 grid grid-cols-3 gap-2 mt-2">
                <TelemetryItem label={t('telemetry.apparent_wind').slice(0, 3).toUpperCase()} value={`${physics.apparentWindAngle.toFixed(1)}°`} color="text-sky-400" />
                <TelemetryItem label="AWS" value={`${physics.apparentWindSpeed.toFixed(1)} kn`} color="text-sky-400" />
                <TelemetryItem label={t('telemetry.aoa').substring(0, 3).toUpperCase()} value={`${physics.angleOfAttack.toFixed(1)}°`} color={physics.isStalled ? "text-red-400" : "text-emerald-400"} />
            </div>

            {/* Status Indicators */}
            <div className="col-span-2 flex gap-4 mt-2 md:mt-4 py-1 md:py-2 border-t border-white/5">
                <StatusTag active={!physics.isStalled && !physics.isLuffing} label="LAMINAR" color="bg-emerald-500" />
                <StatusTag active={physics.isStalled} label={t('feedback.stall')} color="bg-red-500" />
                <StatusTag active={physics.isLuffing} label="LUFFING" color="bg-yellow-500" />
            </div>
        </div>
    );
};

const TelemetryItem = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <div className="flex flex-col p-2 bg-slate-950/40 rounded border border-white/5">
        <span className="text-[8px] font-bold text-slate-500 mb-0.5">{label}</span>
        <span className={`text-sm font-mono font-bold ${color}`}>{value}</span>
    </div>
);

const StatusTag = ({ active, label, color }: { active: boolean, label: string, color: string }) => (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-3xs font-black tracking-widest transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-10'}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse`} />
        <span className="text-white uppercase">{label}</span>
    </div>
);
