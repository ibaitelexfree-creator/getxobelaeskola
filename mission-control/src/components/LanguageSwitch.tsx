'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function LanguageSwitch() {
    const { i18n } = useTranslation();
    const currentLang = i18n.language.split('-')[0]; // Handle cases like 'en-US'

    const toggleLanguage = async () => {
        const nextLang = currentLang === 'en' ? 'es' : 'en';
        try {
            await Haptics.impact({ style: ImpactStyle.Medium });
            await i18n.changeLanguage(nextLang);
        } catch (error) {
            console.error('Failed to change language:', error);
        }
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group active:scale-95"
        >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${currentLang === 'es' ? 'bg-brass-gold/20 text-brass-gold' : 'bg-status-blue/20 text-status-blue'}`}>
                <Globe size={18} className="group-hover:rotate-12 transition-transform" />
            </div>

            <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold font-mono uppercase tracking-widest ${currentLang === 'en' ? 'text-white' : 'text-white/40'}`}>EN</span>
                    <div className="w-4 h-[1px] bg-white/10" />
                    <span className={`text-[10px] font-bold font-mono uppercase tracking-widest ${currentLang === 'es' ? 'text-white' : 'text-white/40'}`}>ES</span>
                </div>
                <div className="relative w-full h-[2px] bg-white/5 mt-1 rounded-full overflow-hidden">
                    <motion.div
                        className={`absolute top-0 bottom-0 w-1/2 ${currentLang === 'es' ? 'bg-brass-gold' : 'bg-status-blue'}`}
                        animate={{ x: currentLang === 'es' ? '100%' : '0%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                </div>
            </div>
        </button>
    );
}
