'use client';

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
                </div>
            </div>
        </motion.div>
    );
}

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
                    </div>
                </motion.div>
            )}

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
        </div>
    );
}
