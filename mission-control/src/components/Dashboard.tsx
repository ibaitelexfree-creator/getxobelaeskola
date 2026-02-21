'use client';

import { motion } from 'framer-motion';
import { useMissionStore, ServiceHealth } from '@/store/useMissionStore';
import {
    Cpu, Zap, Bot, Globe, Thermometer, Eye,
    ArrowUpRight, ArrowDownRight, Activity, AlertTriangle
} from 'lucide-react';
import TacticalRadar from '@/components/TacticalRadar';

const healthColor: Record<ServiceHealth, string> = {
    online: 'text-status-green',
    offline: 'text-status-red',
    degraded: 'text-status-amber',
    unknown: 'text-white/30',
};

const healthDot: Record<ServiceHealth, string> = {
    online: 'status-dot status-dot-green',
    offline: 'status-dot status-dot-red',
    degraded: 'status-dot status-dot-amber',
    unknown: 'status-dot',
};

interface ServiceCardProps {
    name: string;
    icon: React.ReactNode;
    health: ServiceHealth;
    metric: string;
    detail: string;
    index: number;
}

function Sparkline({ color }: { color: string }) {
    return (
        <svg className="w-16 h-8 opacity-40 shrink-0" viewBox="0 0 100 40">
            <motion.path
                d="M0 35 L10 25 L20 30 L35 15 L50 25 L65 10 L80 15 L100 5"
                fill="none"
                stroke={color.includes('green') ? '#00FF94' : color.includes('amber') ? '#FFB800' : '#FF3B3B'}
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            />
        </svg>
    );
}

function ServiceCard({ name, icon, health, metric, detail, index }: ServiceCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card rounded-xl p-4 flex flex-col gap-4 relative group"
        >
            {/* Subtle frame corners */}
            <div className="hud-frame-tl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="hud-frame-br opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="text-white/40 p-1.5 bg-white/5 rounded-lg">{icon}</div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/30">{name}</span>
                    </div>
                    <p className={`text-2xl font-display tracking-tight mt-1 ${healthColor[health]}`}>{metric}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={healthDot[health]} />
                    <Sparkline color={healthColor[health]} />
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-2">
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{detail}</span>
                <ArrowUpRight size={10} className="text-white/10 group-hover:text-buoy-orange transition-colors" />
            </div>
        </motion.div>
    );
}


export default function Dashboard() {
    const { services, stats, queue, pendingApproval, connected, lastSync } = useMissionStore();

    const cards: Omit<ServiceCardProps, 'index'>[] = [
        {
            name: 'Jules HQ',
            icon: <span className="text-sm">🐙</span>,
            health: services.jules.health,
            metric: `${services.jules.used}/${services.jules.total}`,
            detail: `${services.jules.active} Active`,
        },
        {
            name: 'Fast Relay',
            icon: <span className="text-sm">🐙</span>,
            health: services.flash.health,
            metric: `${services.flash.tasksToday}`,
            detail: `${services.flash.tokensUsed.toLocaleString()} TKN`,
        },
        {
            name: 'ClawdBot',
            icon: <span className="text-sm">🤖</span>,
            health: services.clawdbot.health,
            metric: `${services.clawdbot.delegations}`,
            detail: 'DELEGATIONS',
        },
        {
            name: 'Watchdog',
            icon: <span className="text-sm">📡</span>,
            health: services.watchdog.state === 'ACTIVE' ? 'online'
                : services.watchdog.state === 'PAUSED' ? 'degraded' : 'offline',
            metric: services.watchdog.state.slice(0, 6),
            detail: `${services.watchdog.loops}L • ${services.watchdog.stalls}S`,
        },
    ];

    return (
        <div className="flex flex-col gap-5 pb-24">
            {/* Mission Status Header */}
            <div className="flex items-center justify-between glass-panel px-4 py-2 rounded-xl border-white/5 mx-1">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Activity size={12} className={connected ? 'text-status-green' : 'text-status-red'} />
                        <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
                            Link: {connected ? 'Stabilized' : 'Offline'}
                        </span>
                    </div>
                </div>
                {lastSync && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-white/20 uppercase">Sync_Ok</span>
                        <span className="text-[10px] font-mono text-white/30">
                            {new Date(lastSync).toLocaleTimeString([], { hour12: false })}
                        </span>
                    </div>
                )}
            </div>

            {/* Tactical Radar Hero Section */}
            <div className="mx-1 glass-card rounded-2xl p-6 border-white/5 relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="absolute top-4 left-4 flex flex-col gap-1">
                    <h2 className="text-[10px] font-mono font-bold text-buoy-orange uppercase tracking-[0.3em]">Tactical Overview</h2>
                    <p className="text-[8px] font-mono text-white/20">ACTIVE_SONAR_RUNNING</p>
                </div>
                <TacticalRadar />
                <div className="flex justify-between items-end mt-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-mono text-white/20 uppercase">Environment</span>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-white/60">
                                <Thermometer size={10} className="text-buoy-orange" /> {services.thermal.label}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-white/60">
                                <Activity size={10} className="text-status-blue" /> OPTIMAL
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] font-mono text-white/20 uppercase">Grid_Coord</span>
                        <p className="text-[10px] font-mono text-white/40">43.3444° N • 3.0031° W</p>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Assigned', val: stats.assigned, clr: 'text-white' },
                    { label: 'Completed', val: stats.completed, clr: 'text-status-green' },
                    { label: 'Failed', val: stats.failed, clr: 'text-status-red' },
                ].map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="glass-card p-3 rounded-xl border-white/5 text-center"
                    >
                        <p className={`text-xl font-display ${s.clr}`}>{s.val}</p>
                        <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest mt-1">{s.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Emergency / Approval Alert */}
            {pendingApproval && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-5 rounded-2xl border-status-amber/40 bg-status-amber/5 relative overflow-hidden mx-1"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-status-amber to-transparent animate-pulse" />
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="text-status-amber" size={20} />
                        <h3 className="text-sm font-display uppercase tracking-widest text-status-amber">Intervention Required</h3>
                    </div>
                    <p className="text-xs text-white/70 mb-4 font-mono leading-tight">{pendingApproval.task}</p>
                    <div className="flex gap-3">
                        <button className="flex-1 py-3 bg-status-amber text-black text-[10px] font-bold uppercase tracking-widest rounded-xl">
                            Approve
                        </button>
                        <button className="flex-1 py-3 glass-panel border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest rounded-xl">
                            Reject
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Main Service Grid */}
            <div className="grid grid-cols-2 gap-4">
                {cards.map((card, i) => (
                    <ServiceCard key={card.name} {...card} index={i} />
                ))}
            </div>
        </div>
    );
}
