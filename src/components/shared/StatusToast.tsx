'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function StatusToast() {
    const t = useTranslations('notifications');
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [config, setConfig] = useState<{
        show: boolean;
        type: 'success' | 'error' | 'info';
        title: string;
        message: string;
    }>({
        show: false,
        type: 'success',
        title: '',
        message: ''
    });

    useEffect(() => {
        const success = searchParams.get('success');
        const canceled = searchParams.get('canceled');
        const error = searchParams.get('error');

        if (success === 'true') {
            onShow('success', t('payment_success'), t('payment_success_desc'));
            removeQueryParam('success');
        } else if (canceled === 'true') {
            onShow('info', t('payment_canceled'), t('payment_canceled_desc'));
            removeQueryParam('canceled');
        } else if (error) {
            onShow('error', t('payment_error'), error || t('payment_error_desc'));
            removeQueryParam('error');
        }
    }, [searchParams]);

    const onShow = (type: 'success' | 'error' | 'info', title: string, message: string) => {
        setConfig({ show: true, type, title, message });

        // Auto hide after 6 seconds
        const timer = setTimeout(() => {
            setConfig(prev => ({ ...prev, show: false }));
        }, 6000);

        return () => clearTimeout(timer);
    };

    const removeQueryParam = (param: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(param);
        const newQuery = params.toString() ? `?${params.toString()}` : '';
        router.replace(`${pathname}${newQuery}`, { scroll: false });
    };

    return (
        <AnimatePresence>
            {config.show && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md"
                >
                    <div className="relative glass-panel bg-nautical-black/80 backdrop-blur-2xl border-white/10 p-6 shadow-2xl overflow-hidden group">
                        {/* Progress Bar */}
                        <motion.div
                            initial={{ scaleX: 1 }}
                            animate={{ scaleX: 0 }}
                            transition={{ duration: 6, ease: "linear" }}
                            className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${config.type === 'success' ? 'bg-green-500' :
                                    config.type === 'error' ? 'bg-accent' : 'bg-brass-gold'
                                }`}
                        />

                        <div className="flex items-start gap-4">
                            <div className={`mt-1 p-2 rounded-full ${config.type === 'success' ? 'bg-green-500/10 text-green-500' :
                                    config.type === 'error' ? 'bg-accent/10 text-accent' : 'bg-brass-gold/10 text-brass-gold'
                                }`}>
                                {config.type === 'success' && <CheckCircle2 size={20} />}
                                {config.type === 'error' && <XCircle size={20} />}
                                {config.type === 'info' && <AlertCircle size={20} />}
                            </div>

                            <div className="flex-grow">
                                <h3 className="text-sm font-display uppercase tracking-widest text-white mb-1">
                                    {config.title}
                                </h3>
                                <p className="text-xs text-foreground/60 font-light leading-relaxed">
                                    {config.message}
                                </p>
                            </div>

                            <button
                                onClick={() => setConfig(prev => ({ ...prev, show: false }))}
                                className="text-white/20 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
