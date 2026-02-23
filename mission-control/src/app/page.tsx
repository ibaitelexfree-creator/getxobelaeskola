'use client';

import { usePolling } from '@/hooks/usePolling';
import { useMissionStore } from '@/store/useMissionStore';
import Dashboard from '@/components/Dashboard';
import TaskLauncher from '@/components/TaskLauncher';
import QueueHistory from '@/components/QueueHistory';
import ControlPanel from '@/components/ControlPanel';
import BottomNav from '@/components/BottomNav';

const views = {
    dashboard: Dashboard,
    tasks: TaskLauncher,
    queue: QueueHistory,
    control: ControlPanel,
} as const;

export default function MissionControlPage() {
    usePolling();
    const { activeTab } = useMissionStore();
    const ActiveView = views[activeTab];

    return (
        <main className="min-h-screen">
            {/* Header */}
            <header className="px-5 pt-4 pb-2 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-display text-glimmer tracking-tight">Mission Control</h1>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] active:text-status-blue transition-colors">Maestro v3</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-buoy-orange/10 flex items-center justify-center">
                    <span className="text-xs">🚀</span>
                </div>
            </header>

            {/* Content */}
            <div className="px-4 pb-safe">
                <ActiveView />
            </div>

            {/* Bottom Navigation */}
            <BottomNav />
        </main>
    );
}
