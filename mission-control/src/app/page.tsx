'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePolling } from '@/hooks/usePolling';
import { useMissionStore } from '@/store/useMissionStore';
import Dashboard from '@/components/Dashboard';
import TaskLauncher from '@/components/TaskLauncher';
import QueueHistory from '@/components/QueueHistory';
import ControlPanel from '@/components/ControlPanel';
import BottomNav from '@/components/BottomNav';
import VisualRelay from '@/components/VisualRelay';
import Settings from '@/components/Settings';
import AtmosphericHUD from '@/components/AtmosphericHUD';
import JulesUrgentBanner from '@/components/JulesUrgentBanner';
import { Camera, Settings as SettingsIcon, X, Activity } from 'lucide-react';

const views: Record<string, React.ComponentType<any>> = {
    dashboard: Dashboard,
    tasks: TaskLauncher,
    queue: QueueHistory,
    visual: VisualRelay,
    control: ControlPanel,
    settings: Settings,
};

export default function MissionControlPage() {
    usePolling();
    const { activeTab, setActiveTab } = useMissionStore();
    const [sonarActive, setSonarActive] = useState(false);

    // Fallback safe indexing
    const ActiveView = views[activeTab] || Dashboard;

    const triggerDeepScan = () => {
        setSonarActive(true);
        setTimeout(() => setSonarActive(false), 3000);
    };

    return (
        <main className={`min-h-screen relative overflow-hidden transition-colors duration-1000 ${sonarActive ? 'bg-status-blue/10' : ''}`}>
            <div className="bg-mission-mesh fixed inset-0 -z-10" />

            {/* Pro Atmosphere Layer */}
            <AtmosphericHUD />

            <AnimatePresence>
                {sonarActive && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 4 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2 }}
                        className="fixed inset-0 pointer-events-none z-[200] flex items-center justify-center"
                    >
                        <div className="w-[100vw] h-[100vw] rounded-full border-[10px] border-status-blue/20 blur-md" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 z-30 bg-nautical-deep/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div
                        onClick={triggerDeepScan}
                        className="w-10 h-10 rounded-xl bg-buoy-orange/10 flex items-center justify-center border border-buoy-orange/20 shadow-lg shadow-buoy-orange/5 relative overflow-hidden cursor-pointer"
                    >
                        <motion.div
                            className="absolute inset-0 bg-buoy-orange/20"
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-xl relative z-10">🚀</span>
                    </div>
                    <div className="cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                        <h1 className="text-xl font-display text-glimmer tracking-tight">Mission Control</h1>
                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] active:text-status-blue transition-colors">Maestro v3 • HQ Relay</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('visual')}
                        className={`p-2.5 rounded-xl transition-all border ${activeTab === 'visual' ? 'bg-buoy-orange border-buoy-orange text-white shadow-[0_0_15px_rgba(255,107,0,0.3)]' : 'glass-card border-white/10 text-white/60 hover:text-white'}`}
                    >
                        <Camera size={18} />
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`p-2.5 rounded-xl transition-all border ${activeTab === 'settings' ? 'bg-brass-gold border-brass-gold text-white shadow-[0_0_15px_rgba(184,134,11,0.3)]' : 'glass-card border-white/10 text-white/60 hover:text-white'}`}
                    >
                        <SettingsIcon size={18} />
                    </button>
                </div>
            </header>

            <JulesUrgentBanner />

            {/* Content Area */}
            <div className="px-4 pt-4 pb-32 custom-scrollbar">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <ActiveView />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <BottomNav />
        </main>
    );
}
