'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface EmptyStateProps {
    icon?: string;
    title: string;
    subtitle: string;
    actionLabel: string;
    actionHref: string;
}

export default function EmptyState({ icon = '⚓', title, subtitle, actionLabel, actionHref }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="group bg-card/50 border border-card-border p-12 text-center rounded-sm relative overflow-hidden backdrop-blur-sm"
        >
            {/* Background elements */}
            <div className="absolute inset-0 bg-mesh opacity-[0.03]" />
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.05, 0.08, 0.05]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-accent/5 rounded-full blur-[60px] pointer-events-none"
            />

            <div className="relative z-10 space-y-6">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-4xl mx-auto shadow-2xl transition-all duration-700"
                >
                    <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {icon}
                    </motion.span>
                </motion.div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-display text-white italic">
                        {title}
                    </h3>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-foreground/40 font-light text-sm max-w-sm mx-auto"
                    >
                        {subtitle}
                    </motion.p>
                </div>

                <div className="pt-4">
                    <Link
                        href={actionHref}
                        className="inline-flex items-center px-8 py-3 bg-accent text-nautical-black font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]"
                    >
                        {actionLabel}
                        <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
