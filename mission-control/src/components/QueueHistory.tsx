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
    const { queue, history, approveTask, deleteTask, updateTask, serverUrl } = useMissionStore();

    const pendingApproval = queue.filter(t => t.status === 'pending_approval' || t.requiresApproval);
    const activeAndQueued = queue.filter(t => t.status !== 'pending_approval' && !t.requiresApproval);

    const handleClearLegacy = async () => {
        try {
            await fetch(`${serverUrl}/api/tasks/clear-deprecated`, { method: 'POST' });
            // The next sync will refresh the queue
        } catch (e) {
            console.error('Failed to clear legacy tasks:', e);
        }
    };

    const renderTaskItem = (item: any, i: number, isPending: boolean = false) => (
        <motion.div
            key={item.id || i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card rounded-xl p-3 flex items-center gap-3 ${isPending ? 'border-status-amber/30' : ''}`}
        >
            <span className="text-2xs font-mono text-white/20 w-6">#{item.position || i + 1}</span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-white/70 truncate">{item.title}</p>
                    {isPending && (
                        <span className="px-1.5 py-0.5 rounded-full bg-status-amber/10 text-status-amber text-[10px] font-bold uppercase tracking-wider">
                            Pending Approval
                        </span>
                    )}
                </div>
                <p className="text-2xs text-white/20">
                    {formatRelativeTime(item.createdAt)} • {item.id}
                </p>
            </div>

            <div className="flex items-center gap-2">
                {isPending && (
                    <button
                        onClick={() => approveTask(item.id)}
                        className="p-1.5 rounded-lg bg-status-green/10 text-status-green hover:bg-status-green/20 transition-colors"
                        title="Approve"
                    >
                        <CheckCircle2 size={14} />
                    </button>
                )}
                <button
                    onClick={() => {
                        const newTitle = prompt('Edit Task Title:', item.title);
                        if (newTitle) updateTask(item.id, { title: newTitle });
                    }}
                    className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                    title="Edit"
                >
                    <Bot size={14} />
                </button>
                <button
                    onClick={() => {
                        if (confirm('Delete this task?')) deleteTask(item.id);
                    }}
                    className="p-1.5 rounded-lg bg-status-red/10 text-status-red hover:bg-status-red/20 transition-colors"
                    title="Delete"
                >
                    <XCircle size={14} />
                </button>
            </div>
        </motion.div>
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-display text-glimmer">Mission Queue</h2>
                <button
                    onClick={handleClearLegacy}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-status-amber/10 text-status-amber hover:bg-status-amber/20 transition-all text-xs font-bold uppercase tracking-wider"
                >
                    <Bot size={12} />
                    Clear Legacy Tasks
                </button>
            </div>

            {/* Pending Approvals Section */}
            {pendingApproval.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center justify-between mb-3 px-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-status-amber">Awaiting Approval</h3>
                        <span className="text-2xs font-mono text-status-amber/50">{pendingApproval.length} blocked</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {pendingApproval.map((item, i) => renderTaskItem(item, i, true))}
                    </div>
                </motion.div>
            )}

            {/* Main Queue Section */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-3 px-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Active & Queued</h3>
                    <span className="text-2xs font-mono text-white/30">{activeAndQueued.length} scheduled</span>
                </div>

                {activeAndQueued.length === 0 ? (
                    <div className="glass-card rounded-2xl p-8 text-center border-dashed border-white/5">
                        <p className="text-sm text-white/30 italic">No tasks active or queued</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {activeAndQueued.map((item, i) => renderTaskItem(item, i))}
                    </div>
                )}
            </motion.div>

            {/* History Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-4"
            >
                <div className="flex items-center justify-between mb-3 px-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Recent History</h3>
                    <span className="text-2xs font-mono text-white/30">{history.length} completed</span>
                </div>

                {history.length === 0 ? (
                    <div className="glass-card rounded-2xl p-6 text-center border-dashed border-white/5">
                        <p className="text-sm text-white/30">No history yet</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all">
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
