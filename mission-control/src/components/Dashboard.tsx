'use client';

<<<<<<< HEAD
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionStore, ServiceHealth } from '@/store/useMissionStore';
import { AlertTriangle, X, AlertCircle, ChevronRight, Server, ShieldCheck, Cpu, Activity } from 'lucide-react';
import TacticalRadar from '@/components/TacticalRadar';
import ResourceManager from '@/components/ResourceManager';
import HardwareStats from './HardwareStats';
import SyncHistoryGraph from './SyncHistoryGraph';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ConnectionDiagnostics from '@/components/ConnectionDiagnostics';

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
=======
import { motion } from 'framer-motion';
import { useMissionStore, ServiceHealth } from '@/store/useMissionStore';
import {
    Cpu, Zap, Bot, Globe, Thermometer, Eye,
    ArrowUpRight, ArrowDownRight, Activity,
} from 'lucide-react';

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

function ServiceCard({ name, icon, health, metric, detail, index }: ServiceCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card rounded-2xl p-4 flex flex-col gap-3"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="text-white/50">{icon}</div>
                    <span className="text-2xs font-mono uppercase tracking-widest text-white/40">{name}</span>
                </div>
                <span className={healthDot[health]} />
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <p className={`text-2xl font-display font-light ${healthColor[health]}`}>{metric}</p>
                    <p className="text-2xs text-white/30 mt-0.5">{detail}</p>
>>>>>>> pr-286
                </div>
            </div>
        </motion.div>
    );
}

<<<<<<< HEAD
/* ═══════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════ */
export default function Dashboard() {
    const { services, stats, pendingApproval, connected, lastSync, setActiveTab, julesWaiting } = useMissionStore();
    const { t } = useTranslation();
    const [alertService, setAlertService] = useState<ServiceItem | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const generateReport = async () => {
        setIsGeneratingReport(true);
        try {
            const { triggerNotebookLMReport } = await import('@/lib/api');
            const result = await triggerNotebookLMReport();

            if (result.success) {
                console.log("Report generation workflow triggered successfully:", result.message);
            } else {
                throw new Error(result.message || 'Error desconocido al generar informe');
            }
        } catch (e: any) {
            console.error("Error triggering NotebookLM Report:", e);
            alert(`Error: ${e.message}`);
        } finally {
            setIsGeneratingReport(false);
        }
    };


    const watchdogS = services.watchdog.state || 'UNKNOWN';

    if (!connected) {
        return <ConnectionDiagnostics />;
    }
    const watchdogH: ServiceHealth = watchdogS === 'ACTIVE' ? 'online' :
        ['STALLED', 'LOOPING', 'RECOVERING'].includes(watchdogS) ? 'degraded' :
            ['CRASHED', 'OFFLINE'].includes(watchdogS) ? 'offline' : 'unknown';

    const groups = [
        {
            title: t('dashboard.groups.core'),
            icon: <Cpu size={18} className="text-status-blue" />,
            items: [
                {
                    id: 'clawd',
                    name: 'CLAWD-BOT',
                    icon: '🤖',
                    health: services.clawdbot.health,
                    metric: `${services.clawdbot.delegations}`,
                    detail: t('dashboard.details.delegations'),
                    errorMsg: 'ClawdBot no detectado. Revisa el orquestador.'
                },
                {
                    id: 'jules',
                    name: 'JULES IDE',
                    icon: '🐙',
                    health: julesWaiting ? 'degraded' : services.jules.health,
                    metric: julesWaiting ? 'WAITING' : `${services.jules.active}`,
                    detail: julesWaiting ? t('dashboard.details.input_required') : `${t('dashboard.details.session')} ${services.jules.used}/${services.jules.total}`,
                    errorMsg: 'Jules API Offline o Cuota Agotada.'
                }
            ]
        },
        {
            title: t('dashboard.groups.infra'),
            icon: <Server size={18} className="text-status-amber" />,
            items: [
                {
                    id: 'flash',
                    name: 'FAST RELAY',
                    icon: '⚡',
                    health: services.flash.health,
                    metric: `${services.flash.tasksToday}`,
                    detail: t('dashboard.details.anthropic_tasks'),
                    errorMsg: 'Error de conexión con AWS/Claude.'
                },
                {
                    id: 'watchdog',
                    name: 'WATCHDOG',
                    icon: '🛡️',
                    health: watchdogH,
                    metric: watchdogS.substring(0, 4),
                    detail: `${services.watchdog.loops}L / ${services.watchdog.stalls}S`,
                    errorMsg: t('dashboard.details.manual_restart')
                },
                {
                    id: 'browserless',
                    name: 'BROWSERLESS',
                    icon: '🌐',
                    health: services.browserless.health,
                    metric: services.browserless.health === 'online' ? `${services.browserless.used}/${services.browserless.total}` : 'OFFLINE',
                    detail: t('dashboard.details.visual_cloud'),
                    errorMsg: 'Browserless Cloud inaccesible o cuota excedida.'
                },
                {
                    id: 'orchestrator',
                    name: 'ORCHESTRATOR',
                    icon: '🛰️',
                    health: services.orchestrator.health,
                    metric: 'v2.6',
                    detail: t('dashboard.details.node_api'),
                    errorMsg: 'Orquestrador Desconectado.'
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
                        <h1 className="text-white text-3xl font-black uppercase leading-none">{connected ? t('dashboard.system_ready') : t('dashboard.system_offline')}</h1>
                        <p className="text-white text-sm font-mono font-black mt-1 uppercase tracking-tighter">{t('dashboard.last_sync')}: {lastSync ? new Date(lastSync).toLocaleTimeString() : t('common.never')}</p>
                    </div>
                </div>
                {!connected ? (
                    <div className="flex flex-col items-end gap-2">
                        <AlertTriangle size={36} className="text-status-red" />
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setActiveTab('settings')}
                            className="bg-white/10 text-white text-[10px] font-black px-4 py-1.5 rounded-full border border-white/20 uppercase tracking-widest hover:bg-white/20 transition-all"
                        >
                            {t('nav.settings')}
                        </motion.button>
                    </div>
                ) : (
                    <Activity size={36} className="text-status-green/50" />
                )}
            </div>

            {/* ── Stats Bar ── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: t('dashboard.stats.pending'), val: stats.assigned, color: '#FFFFFF', bg: 'rgba(255,255,255,0.15)', tab: 'queue' },
                    { label: t('dashboard.stats.done'), val: stats.completed, color: '#00FF95', bg: 'rgba(0,255,149,0.15)', tab: 'queue' },
                    { label: t('dashboard.stats.fail'), val: stats.failed, color: '#FF3333', bg: 'rgba(255,51,51,0.15)', tab: 'queue' },
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
                        {t('dashboard.tactical_view')}
                    </h2>
                    <span className="bg-white/20 text-white text-[12px] font-black px-4 py-1.5 rounded-full">{services.thermal.label}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center gap-6">
                    <HardwareStats side="left" />
                    <TacticalRadar />
                    <HardwareStats side="right" />
                </div>
            </div>

            {/* ── Analytics Section ── */}
            <SyncHistoryGraph />

            {/* ── Resource Management ── */}
            <ResourceManager />

            {/* ── AI Intelligence Hub ── */}
            <div className="glass-panel p-6 rounded-[2.5rem] border-4 border-status-blue/20 bg-status-blue/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-status-blue/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h2 className="text-white text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                        <span className="text-status-blue text-3xl">🧠</span>
                        AI Intelligence Hub
                    </h2>
                    <span className="bg-status-blue text-black text-[12px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                        Notebook LM
                    </span>
                </div>

                <p className="text-white/70 mb-6 font-bold text-lg max-w-2xl">
                    Sintetiza la actividad técnica de los últimos 7 días y obtén una infografía y un podcast en audio español para compartir los avances del desarrollo.
                </p>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={isGeneratingReport}
                    onClick={generateReport}
                    className={`w-full lg:w-auto px-8 py-5 text-xl font-black rounded-3xl uppercase tracking-tighter border-2 flex items-center justify-center gap-3 transition-all ${isGeneratingReport
                        ? 'bg-status-amber text-black border-status-amber/40 animate-pulse'
                        : 'bg-status-blue text-black border-status-blue hover:bg-white hover:border-white shadow-[0_0_30px_rgba(0,180,216,0.3)]'
                        }`}
                >
                    {isGeneratingReport ? (
                        <>
                            <Activity className="animate-spin" size={24} />
                            Generando Reporte...
                        </>
                    ) : (
                        <>
                            🎙️ Crear Podcast e Infografía
                        </>
                    )}
                </motion.button>
            </div>

            {/* ── Pending Approvals (High Visibility) ── */}
            {pendingApproval && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 rounded-[3rem] bg-white border-8 border-status-amber shadow-[0_0_80px_rgba(255,255,255,0.4)]"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <AlertTriangle size={48} className="text-status-amber" />
                        <h2 className="text-black text-3xl font-black uppercase leading-tight">{t('dashboard.action_required')}</h2>
                    </div>
                    <p className="text-black font-black text-xl leading-snug mb-8">{pendingApproval.task}</p>
                    <div className="flex gap-4">
                        <button className="flex-1 py-5 bg-black text-white text-2xl font-black rounded-3xl uppercase tracking-tighter active:scale-95 transition-transform">{t('common.confirm')}</button>
                        <button className="flex-1 py-5 bg-black/10 text-black text-2xl font-black rounded-3xl uppercase tracking-tighter border-2 border-black/20">{t('common.skip')}</button>
=======
export default function Dashboard() {
    const { services, stats, queue, pendingApproval, connected, lastSync } = useMissionStore();

    const cards: Omit<ServiceCardProps, 'index'>[] = [
        {
            name: 'Jules Pool',
            icon: <Cpu size={16} />,
            health: services.jules.health,
            metric: `${services.jules.used}/${services.jules.total}`,
            detail: `${services.jules.active} active sessions`,
        },
        {
            name: 'Gemini Flash',
            icon: <Zap size={16} />,
            health: services.flash.health,
            metric: `${services.flash.tasksToday}`,
            detail: `${services.flash.tokensUsed.toLocaleString()} tokens`,
        },
        {
            name: 'ClawdBot',
            icon: <Bot size={16} />,
            health: services.clawdbot.health,
            metric: `${services.clawdbot.delegations}`,
            detail: 'delegations today',
        },
        {
            name: 'Browserless',
            icon: <Globe size={16} />,
            health: services.browserless.health,
            metric: services.browserless.health === 'online' ? 'Ready' : 'Off',
            detail: 'visual relay',
        },
        {
            name: 'Thermal',
            icon: <Thermometer size={16} />,
            health: services.thermal.level > 2 ? 'degraded' : 'online',
            metric: services.thermal.label,
            detail: `level ${services.thermal.level}`,
        },
        {
            name: 'Watchdog',
            icon: <Eye size={16} />,
            health: services.watchdog.state === 'ACTIVE' ? 'online'
                : services.watchdog.state === 'PAUSED' ? 'degraded' : 'offline',
            metric: services.watchdog.state,
            detail: `${services.watchdog.loops}L ${services.watchdog.stalls}S ${services.watchdog.crashes}C`,
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            {/* Connection Header */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between px-1"
            >
                <div className="flex items-center gap-2">
                    <span className={connected ? 'status-dot status-dot-green' : 'status-dot status-dot-red'} />
                    <span className="text-2xs font-mono uppercase tracking-widest text-white/40">
                        {connected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
                {lastSync && (
                    <span className="text-2xs text-white/20">
                        {new Date(lastSync).toLocaleTimeString()}
                    </span>
                )}
            </motion.div>

            {/* Stats Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel rounded-2xl p-4 flex items-center justify-around"
            >
                <div className="text-center">
                    <p className="text-lg font-display text-white">{stats.assigned}</p>
                    <div className="flex items-center gap-1 text-2xs text-white/40">
                        <ArrowUpRight size={10} />
                        <span>Assigned</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                    <p className="text-lg font-display text-status-green">{stats.completed}</p>
                    <div className="flex items-center gap-1 text-2xs text-white/40">
                        <Activity size={10} />
                        <span>Completed</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                    <p className="text-lg font-display text-status-red">{stats.failed}</p>
                    <div className="flex items-center gap-1 text-2xs text-white/40">
                        <ArrowDownRight size={10} />
                        <span>Failed</span>
                    </div>
                </div>
            </motion.div>

            {/* Pending Approval Alert */}
            {pendingApproval && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-2xl p-4 border-status-amber/30"
                    style={{ borderColor: 'rgba(255, 215, 64, 0.3)' }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <span className="status-dot status-dot-amber" />
                        <span className="text-xs font-mono uppercase tracking-widest text-status-amber">
                            Approval Required
                        </span>
                    </div>
                    <p className="text-sm text-white/80 mb-3">{pendingApproval.task}</p>
                    <p className="text-2xs text-white/40 mb-3">{pendingApproval.reason}</p>
                    <div className="flex gap-2">
                        <button className="btn-primary flex-1 text-xs py-2">✅ Approve</button>
                        <button className="btn-glass flex-1 text-xs py-2">❌ Reject</button>
>>>>>>> pr-286
                    </div>
                </motion.div>
            )}

<<<<<<< HEAD
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
                                {t('common.close')}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
=======
            {/* Service Grid */}
            <div className="grid grid-cols-2 gap-3">
                {cards.map((card, i) => (
                    <ServiceCard key={card.name} {...card} index={i} />
                ))}
            </div>

            {/* Queue Summary */}
            {queue.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card rounded-2xl p-3 flex items-center justify-between"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-status-amber">📋</span>
                        <span className="text-sm text-white/60">{queue.length} tasks queued</span>
                    </div>
                    <span className="text-2xs text-white/30 font-mono">TAP FOR DETAILS</span>
                </motion.div>
            )}
>>>>>>> pr-286
        </div>
    );
}
