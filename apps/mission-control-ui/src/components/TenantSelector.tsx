'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Shield, Layout, Briefcase } from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';

const TENANT_ICONS: Record<string, any> = {
    core: <Shield size={14} />,
    getxo: <Layout size={14} />,
    realstate: <Briefcase size={14} />,
    default: <Database size={14} />
};

export default function TenantSelector() {
    const { activeTenant, setActiveTenant, tenants } = useMissionStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest">Active Tenant / Product</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-status-blue/20 text-status-blue">
                    {activeTenant.toUpperCase()}
                </span>
            </div>

            <div className="flex flex-wrap gap-2">
                {tenants.map((tenant) => (
                    <button
                        key={tenant}
                        onClick={() => setActiveTenant(tenant)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${activeTenant === tenant
                            ? 'bg-status-blue/20 border-status-blue text-white shadow-[0_0_15px_rgba(0,180,216,0.2)]'
                            : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white/80'
                            }`}
                    >
                        <span className={activeTenant === tenant ? 'text-status-blue' : ''}>
                            {TENANT_ICONS[tenant] || TENANT_ICONS.default}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-tighter">{tenant}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
