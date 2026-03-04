'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BASE_PATH } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

export default function GoogleAuthButton({ returnTo }: { returnTo?: string | null }) {
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const supabase = createClient();

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const appUrl = isLocal
                ? window.location.origin
                : (process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || window.location.origin);

            const next = returnTo || '/';

            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${appUrl}${BASE_PATH}/api/auth/callback?next=${encodeURIComponent(next)}`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
        } catch (error) {
            console.error('Error logging in with Google:', error);
            setLoading(false);
        }
    };

    return (
        <div className="relative group w-full mt-2">
            {/* Ultra-luxury Ambient Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#d4a843]/0 via-[#d4a843]/25 to-[#d4a843]/0 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-1000 group-hover:duration-500" />

            <motion.button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                    y: -2,
                    borderColor: 'rgba(212, 168, 67, 0.8)',
                    boxShadow: '0 10px 30px -10px rgba(212, 168, 67, 0.3)'
                }}
                whileTap={{ scale: 0.98, y: 0 }}
                className="relative w-full h-[60px] rounded-2xl bg-gradient-to-b from-white/5 to-transparent backdrop-blur-2xl border border-white/10 flex items-center justify-center gap-4 text-white font-semibold text-xs tracking-[0.2em] uppercase overflow-hidden transition-all duration-500 disabled:opacity-50"
            >
                {/* Internal Shimmer Layer */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

                {/* Moving Light Ray */}
                <AnimatePresence>
                    {isHovered && !loading && (
                        <motion.div
                            initial={{ left: '-100%', opacity: 0 }}
                            animate={{ left: '100%', opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                repeat: Infinity,
                                duration: 2,
                                ease: "easeInOut",
                                repeatDelay: 1
                            }}
                            className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[35deg] z-0"
                        />
                    )}
                </AnimatePresence>

                {loading ? (
                    <div className="flex items-center gap-4">
                        <div className="w-5 h-5 border-[3px] border-[#d4a843]/20 border-t-[#d4a843] rounded-full animate-spin" />
                        <span className="text-[#d4a843] font-bold">AUTENTICANDO</span>
                    </div>
                ) : (
                    <>
                        <div className="relative z-10 flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-[#d4a843]/30 transition-all duration-500">
                            {/* Stylish Monochrome Google Icon */}
                            <svg className="w-5 h-5 transition-all duration-700 group-hover:drop-shadow-[0_0_8px_rgba(212,168,67,0.5)]" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    className="text-[#d4a843]"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    className="text-[#d4a843] opacity-80"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    className="text-[#d4a843] opacity-60"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                />
                                <path
                                    fill="currentColor"
                                    className="text-[#d4a843] opacity-80"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        </div>
                        <span className="relative z-10 transition-all duration-500 group-hover:tracking-[0.25em] group-hover:text-[#d4a843]">
                            Entrar con Google
                        </span>
                    </>
                )}

                {/* Corner Accents */}
                <div className="absolute top-3 left-3 w-1 h-1 rounded-full bg-[#d4a843]/0 group-hover:bg-[#d4a843]/50 transition-all duration-700" />
                <div className="absolute top-3 right-3 w-1 h-1 rounded-full bg-[#d4a843]/0 group-hover:bg-[#d4a843]/50 transition-all duration-700" />
                <div className="absolute bottom-3 left-3 w-1 h-1 rounded-full bg-[#d4a843]/0 group-hover:bg-[#d4a843]/50 transition-all duration-700" />
                <div className="absolute bottom-3 right-3 w-1 h-1 rounded-full bg-[#d4a843]/0 group-hover:bg-[#d4a843]/50 transition-all duration-700" />
            </motion.button>
        </div>
    );
}
