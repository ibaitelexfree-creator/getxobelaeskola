'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Home,
    Share2,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    Sparkles,
    Gem
} from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Inventario', icon: Home, path: '/admin/inventory' },
    { name: 'Marketing AI', icon: Share2, path: '/admin/marketing' },
    { name: 'Leads / CRM', icon: Users, path: '/admin/crm' },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-[#0a0a0f]/80 backdrop-blur-2xl border-r border-white/5 z-50 flex flex-col">
            {/* Logo area */}
            <div className="p-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4a843] to-[#b8922e] flex items-center justify-center shadow-[0_0_20px_rgba(212,168,67,0.3)]">
                        <Gem className="text-[#0a0a0f]" size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold gold-text tracking-tight">Mission Control</h2>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-medium">Dubai Luxury Admin</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-grow p-4 mt-6">
                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link key={item.path} href={item.path}>
                                <div className={`group relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${isActive
                                        ? 'bg-gradient-to-r from-[#d4a843]/10 to-transparent border border-[#d4a843]/20'
                                        : 'hover:bg-white/5'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`transition-colors duration-300 ${isActive ? 'text-[#d4a843]' : 'text-zinc-500 group-hover:text-zinc-300'}`} size={20} />
                                        <span className={`font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                    {isActive && (
                                        <motion.div layoutId="active-pill">
                                            <ChevronRight size={14} className="text-[#d4a843]" />
                                        </motion.div>
                                    )}

                                    {/* Decoration */}
                                    {isActive && (
                                        <div className="absolute left-0 w-1 h-6 bg-[#d4a843] rounded-r-full" />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* AI Status Badge */}
                <div className="mt-12 mx-2 p-5 rounded-3xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={16} className="text-blue-400" />
                        <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">AI Engine Status</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-zinc-400">Gemini Flash 2.0</span>
                            <span className="text-emerald-400 font-bold uppercase">Ready</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                            />
                        </div>
                        <p className="text-[9px] text-zinc-500 leading-tight">n8n video generation pipeline is active and healthy.</p>
                    </div>
                </div>
            </nav>

            {/* User Profile / Logout */}
            <div className="p-6 border-t border-white/5">
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-zinc-200">User Admin</p>
                            <p className="text-[10px] text-zinc-500">Dubai Elite Agent</p>
                        </div>
                    </div>
                    <LogOut size={16} className="text-zinc-500 group-hover:text-red-400 transition-colors" />
                </button>
            </div>
        </aside>
    );
}
