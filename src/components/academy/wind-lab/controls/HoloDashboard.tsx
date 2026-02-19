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

    const isMainEfficient = !physics.mainIsStalled && !physics.mainIsLuffing;
    const isJibEfficient = !physics.jibIsStalled && !physics.jibIsLuffing;
    const isLaminar = isMainEfficient && isJibEfficient;

    return (
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full px-2">

            {/* Wind Speed */}
            <div className="flex flex-col">
                <span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">WIND SPEED:</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-mono font-medium text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                        {physics.apparentWindSpeed.toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase">KTS</span>
                </div>
            </div>

            {/* Boat Speed */}
            <div className="flex flex-col">
                <span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">{t('telemetry.boat_speed').toUpperCase()}:</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-mono font-medium text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                        {state.boatSpeed.toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase">KTS</span>
                </div>
            </div>

            {/* Efficiency */}
            <div className="flex flex-col">
                <span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">{t('telemetry.efficiency').toUpperCase()}:</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-mono font-medium text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                        {(physics.efficiency * 100).toFixed(0)}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase">%</span>
                </div>
            </div>

            {/* Heel Angle */}
            <div className="flex flex-col">
                <span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">{t('telemetry.heel_angle').toUpperCase()}:</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-mono font-medium text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                        {state.heelAngle.toFixed(0)}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase">deg</span>
                </div>
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
