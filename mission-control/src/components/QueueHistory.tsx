'use client';

import { motion } from 'framer-motion';
import { useMissionStore } from '@/store/useMissionStore';
import { Clock, Zap, Bot, Cpu, CheckCircle2, XCircle, Loader2, Globe } from 'lucide-react';

const executorIcon: Record<string, React.ReactNode> = {
    jules: <Cpu size={14} className="text-buoy-orange" />,
    flash: <Zap size={14} className="text-status-amber" />,
    clawdbot: <Bot size={14} className="text-status-blue" />,
    antigravity: <Globe size={14} className="text-status-green" />,
};

const statusIcon: Record<string, React.ReactNode> = {
    completed: <CheckCircle2 size={14} className="text-status-green" />,
    failed: <XCircle size={14} className="text-status-red" />,
    running: <Loader2 size={14} className="text-status-amber animate-spin" />,
    queued: <Clock size={14} className="text-white/30" />,
};

function formatRelativeTime(timestamp: number) {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 10) return 'Justo ahora';
    if (seconds < 60) return `Hace ${seconds}s`;
    if (minutes < 60) return `Hace ${minutes}m`;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function QueueHistory() {
    const { queue, history } = useMissionStore();

    return (
        <div className="flex flex-col gap-4">
            {/* Queue Section */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-display text-glimmer">Queue</h2>
                    <span className="text-2xs font-mono text-white/30">{queue.length} pending</span>
                </div>

                {queue.length === 0 ? (
                    <div className="glass-card rounded-2xl p-6 text-center">
                        <p className="text-sm text-white/30">No tasks in queue</p>
                        <p className="text-2xs text-white/15 mt-1">Tasks will appear here when capacity is full</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {queue.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card rounded-xl p-3 flex items-center gap-3"
                            >
                                <span className="text-2xs font-mono text-white/20 w-6">#{item.position}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white/70 truncate">{item.title}</p>
                                    <p className="text-2xs text-white/20">
                                        {formatRelativeTime(item.createdAt)}
                                    </p>
                                </div>
                                <Clock size={12} className="text-white/20" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-white/5" />

            {/* History Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-display text-glimmer">History</h2>
                    <span className="text-2xs font-mono text-white/30">{history.length} tasks</span>
                </div>

                {history.length === 0 ? (
                    <div className="glass-card rounded-2xl p-6 text-center">
                        <p className="text-sm text-white/30">No tasks yet</p>
                        <p className="text-2xs text-white/15 mt-1">Launch a task to see history</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {history.map((entry, i) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="glass-card rounded-xl p-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        {executorIcon[entry.executor]}
                                        {statusIcon[entry.status]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white/70 truncate">{entry.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-2xs text-white/20">
                                                {formatRelativeTime(entry.timestamp)}
                                            </span>
                                            {entry.latencyMs && (
                                                <span className="text-2xs text-status-amber">{entry.latencyMs}ms</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
