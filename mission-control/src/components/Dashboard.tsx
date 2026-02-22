'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMissionStore, ServiceHealth } from '@/store/useMissionStore';
import { AlertTriangle, X, AlertCircle, ChevronRight, Server, ShieldCheck, Cpu } from 'lucide-react';
import TacticalRadar from '@/components/TacticalRadar';
import ResourceManager from '@/components/ResourceManager';
import HardwareStats from './HardwareStats';
import { useState } from 'react';

/* ═══════════════════════════════════════════════════
   SERVICE ITEM COMPONENT
═══════════════════════════════════════════════════ */
interface ServiceItem {
    id: string;
    name: string;
    icon: string;
    health: ServiceHealth;
    metric: string;
    detail: string;
    errorMsg?: string;
    onClick?: () => void;
}

function ServiceItemCard({ service, index, onAlert }: {
    service: ServiceItem;
    index: number;
    onAlert: (s: ServiceItem) => void
}) {
    const isError = service.health === 'offline';
    const isWarning = service.health === 'degraded';
    const statusBg = service.health === 'online' ? 'rgba(0, 255, 149, 0.15)' :
        isError ? 'rgba(255, 51, 51, 0.2)' :
            isWarning ? 'rgba(255, 170, 0, 0.2)' : 'rgba(255,255,255,0.05)';
    const statusBorder = service.health === 'online' ? 'rgba(0, 255, 149, 0.4)' :
        isError ? 'rgba(255, 51, 51, 0.6)' :
            isWarning ? 'rgba(255, 170, 0, 0.6)' : 'rgba(255,255,255,0.2)';

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => isError ? onAlert(service) : service.onClick?.()}
            className="flex items-center gap-4 p-4 rounded-2xl border-2 mb-3 cursor-pointer active:scale-95 transition-all"
            style={{ backgroundColor: statusBg, borderColor: statusBorder }}
        >
            <span className="text-3xl">{service.icon}</span>
            <div className="flex-1">
                <p className="text-white text-lg font-black uppercase tracking-tight">{service.name}</p>
                <p className="text-white/80 text-xs font-bold leading-none mt-1">{service.detail}</p>
            </div>
            <div className="text-right">
                <p className="text-xl font-black font-mono text-white">{service.metric}</p>
                <div className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded-full inline-block mt-1 ${service.health === 'online' ? 'bg-status-green text-black' :
                    isError ? 'bg-status-red text-white' :
                        isWarning ? 'bg-status-amber text-black' : 'bg-white/20 text-white'
                    }`}>
                    {service.health}
                </div>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════ */
export default function Dashboard() {
    const { services, stats, pendingApproval, connected, lastSync, setActiveTab, julesWaiting } = useMissionStore();
    const [alertService, setAlertService] = useState<ServiceItem | null>(null);

    const watchdogS = services.watchdog.state || 'UNKNOWN';
    const watchdogH: ServiceHealth = watchdogS === 'ACTIVE' ? 'online' :
        ['STALLED', 'LOOPING', 'RECOVERING'].includes(watchdogS) ? 'degraded' :
            ['CRASHED', 'OFFLINE'].includes(watchdogS) ? 'offline' : 'unknown';

    const groups = [
        {
            title: 'CORE AGENTS',
            icon: <Cpu size={18} className="text-status-blue" />,
            items: [
                {
                    id: 'clawd',
                    name: 'CLAWD-BOT',
                    icon: '🤖',
                    health: services.clawdbot.health,
                    metric: `${services.clawdbot.delegations}`,
                    detail: 'Delegaciones Master',
                    errorMsg: 'ClawdBot no detectado. Revisa el orquestador.'
                },
                {
                    id: 'jules',
                    name: 'JULES IDE',
                    icon: '🐙',
                    health: julesWaiting ? 'degraded' : services.jules.health,
                    metric: julesWaiting ? 'WAITING' : `${services.jules.active}`,
                    detail: julesWaiting ? 'Input Requerido' : `Sesión ${services.jules.used}/${services.jules.total}`,
                    errorMsg: 'Jules API Offline o Cuota Agotada.'
                }
            ]
        },
        {
            title: 'INFRASTRUCTURE',
            icon: <Server size={18} className="text-status-amber" />,
            items: [
                {
                    id: 'flash',
                    name: 'FAST RELAY',
                    icon: '⚡',
                    health: services.flash.health,
                    metric: `${services.flash.tasksToday}`,
                    detail: 'Tareas Anthropic hoy',
                    errorMsg: 'Error de conexión con AWS/Claude.'
                },
                {
                    id: 'watchdog',
                    name: 'WATCHDOG',
                    icon: '🛡️',
                    health: watchdogH,
                    metric: watchdogS.substring(0, 4),
                    detail: `${services.watchdog.loops}L / ${services.watchdog.stalls}S`,
                    errorMsg: 'Watchdog STALLED. Requiere reinicio manual.'
                },
                {
                    id: 'browserless',
                    name: 'BROWSERLESS',
                    icon: '🌐',
                    health: services.browserless.health,
                    metric: services.browserless.health === 'online' ? `${services.browserless.used}/${services.browserless.total}` : 'OFFLINE',
                    detail: 'Cloud Visualization',
                    errorMsg: 'Browserless Cloud inaccesible o cuota excedida.'
                }
            ]
        }
    ];

    return (
        <div className="flex flex-col gap-6 pb-28">

            {/* ── Status Banner ── */}
            <div className={`p-5 rounded-3xl border-2 flex items-center justify-between ${connected ? 'bg-status-green/20 border-status-green/40' : 'bg-status-red/20 border-status-red/40 animate-pulse'
                }`}>
                <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${connected ? 'bg-status-green' : 'bg-status-red'}`} />
                    <div>
                        <h1 className="text-white text-3xl font-black uppercase leading-none">SYSTEM {connected ? 'READY' : 'OFFLINE'}</h1>
                        <p className="text-white text-sm font-mono font-black mt-1 uppercase tracking-tighter">LAST SYNC: {lastSync ? new Date(lastSync).toLocaleTimeString() : 'NEVER'}</p>
                    </div>
                </div>
                {!connected && <AlertTriangle size={36} className="text-status-red" />}
            </div>

            {/* ── Stats Bar ── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'PENDING', val: stats.assigned, color: '#FFFFFF', bg: 'rgba(255,255,255,0.15)', tab: 'queue' },
                    { label: 'DONE', val: stats.completed, color: '#00FF95', bg: 'rgba(0,255,149,0.15)', tab: 'queue' },
                    { label: 'FAIL', val: stats.failed, color: '#FF3333', bg: 'rgba(255,51,51,0.15)', tab: 'queue' },
                ].map((s) => (
                    <motion.div
                        key={s.label}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab(s.tab as any)}
                        className="p-4 rounded-3xl border-2 text-center cursor-pointer transition-premium bg-black/40 border-white/10 hover:border-white/30"
                        style={{ backgroundColor: s.bg }}
                    >
                        <p className="text-4xl font-black" style={{ color: s.color }}>{s.val}</p>
                        <p className="text-white/60 text-[12px] font-black uppercase tracking-widest mt-1">{s.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── Radar Section ── */}
            <div className="glass-panel p-6 rounded-[2.5rem] border-4 border-white/20">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                        <ShieldCheck size={24} className="text-buoy-orange" />
                        Tactical View
                    </h2>
                    <span className="bg-white/20 text-white text-[12px] font-black px-4 py-1.5 rounded-full">{services.thermal.label}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center gap-6">
                    <HardwareStats side="left" />
                    <TacticalRadar />
                    <HardwareStats side="right" />
                </div>
            </div>

            {/* ── Resource Management ── */}
            <ResourceManager />

            {/* ── Pending Approvals (High Visibility) ── */}
            {pendingApproval && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 rounded-[3rem] bg-white border-8 border-status-amber shadow-[0_0_80px_rgba(255,255,255,0.4)]"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <AlertTriangle size={48} className="text-status-amber" />
                        <h2 className="text-black text-3xl font-black uppercase leading-tight">Acción Requerida</h2>
                    </div>
                    <p className="text-black font-black text-xl leading-snug mb-8">{pendingApproval.task}</p>
                    <div className="flex gap-4">
                        <button className="flex-1 py-5 bg-black text-white text-2xl font-black rounded-3xl uppercase tracking-tighter active:scale-95 transition-transform">Confirmar</button>
                        <button className="flex-1 py-5 bg-black/10 text-black text-2xl font-black rounded-3xl uppercase tracking-tighter border-2 border-black/20">Omitir</button>
                    </div>
                </motion.div>
            )}

            {/* ── Service Groups ── */}
            {groups.map((group) => (
                <div key={group.title} className="mb-10">
                    <div className="flex items-center gap-4 mb-6 px-2">
                        {group.icon}
                        <h3 className="text-white text-lg font-black uppercase tracking-[0.2em]">{group.title}</h3>
                    </div>
                    {group.items.map((item, i) => (
                        <ServiceItemCard
                            key={item.id}
                            service={item as any}
                            index={i}
                            onAlert={(s) => setAlertService(s)}
                        />
                    ))}
                </div>
            ))}

            {/* ── Error Modal (High Emphasis) ── */}
            <AnimatePresence>
                {alertService && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
                        onClick={() => setAlertService(null)}
                    >
                        <motion.div
                            initial={{ y: 50, scale: 0.9 }}
                            animate={{ y: 0, scale: 1 }}
                            className="w-full max-w-sm bg-status-red p-8 rounded-[3rem] border-4 border-white text-white text-center shadow-[0_40px_100px_rgba(255,51,51,0.5)]"
                        >
                            <div className="text-6xl mb-4">{alertService.icon}</div>
                            <h2 className="text-4xl font-black uppercase mb-2 leading-none">{alertService.name}</h2>
                            <p className="text-white/80 font-black uppercase mb-6 tracking-widest">{alertService.health}</p>

                            <div className="bg-black/20 p-5 rounded-3xl mb-8 border-2 border-white/20">
                                <p className="text-lg font-bold leading-relaxed">{alertService.errorMsg}</p>
                            </div>

                            <button
                                onClick={() => setAlertService(null)}
                                className="w-full py-5 bg-white text-status-red text-2xl font-black rounded-[2rem] uppercase tracking-tighter shadow-2xl active:scale-95 transition-transform"
                            >
                                Entendido
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
