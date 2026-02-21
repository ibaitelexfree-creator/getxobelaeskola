'use client';

import { motion } from 'framer-motion';
import { useMissionStore, Tab } from '@/store/useMissionStore';
import { LayoutDashboard, Rocket, ListOrdered, SlidersHorizontal } from 'lucide-react';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'tasks', label: 'Tasks', icon: <Rocket size={20} /> },
    { id: 'queue', label: 'Queue', icon: <ListOrdered size={20} /> },
    { id: 'control', label: 'Control', icon: <SlidersHorizontal size={20} /> },
];

export default function BottomNav() {
    const { activeTab, setActiveTab } = useMissionStore();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel safe-area-bottom">
            <div className="flex items-center justify-around py-2 px-4">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-colors relative"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white/5 rounded-xl"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className={`relative z-10 transition-colors ${isActive ? 'text-buoy-orange' : 'text-white/30'
                                }`}>
                                {tab.icon}
                            </span>
                            <span className={`relative z-10 text-2xs font-mono tracking-wider transition-colors ${isActive ? 'text-white/80' : 'text-white/20'
                                }`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
