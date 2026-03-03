'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KioskVideoSlide from './KioskVideoSlide';
import KioskNomenclatureSlide from './KioskNomenclatureSlide';
import KioskMapSlide from './KioskMapSlide';
import KioskStatsSlide from './KioskStatsSlide';

interface KioskContainerProps {
    locale: string;
}

export default function KioskContainer({ locale }: KioskContainerProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        { id: 'video', component: <KioskVideoSlide /> },
        { id: 'stats', component: <KioskStatsSlide /> },
        { id: 'map', component: <KioskMapSlide /> },
        { id: 'nomenclature', component: <KioskNomenclatureSlide locale={locale} /> },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 20000); // 20 seconds

        return () => clearInterval(timer);
    }, [slides.length]);

    // Manual Override (Touch)
    const handleNext = () => setCurrentSlide(prev => (prev + 1) % slides.length);
    const handlePrev = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="w-full h-full min-h-screen overflow-hidden bg-nautical-black relative">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="w-full h-full absolute inset-0"
                >
                    {slides[currentSlide].component}
                </motion.div>
            </AnimatePresence>

            {/* Progress Indicators */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-50">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-accent w-12' : 'bg-white/20 hover:bg-white/40'}`}
                    />
                ))}
            </div>

            {/* Invisible Touch Zones for Navigation */}
            <div className="absolute top-0 bottom-0 left-0 w-32 z-40 cursor-w-resize" onClick={handlePrev} />
            <div className="absolute top-0 bottom-0 right-0 w-32 z-40 cursor-e-resize" onClick={handleNext} />
        </div>
    );
}
