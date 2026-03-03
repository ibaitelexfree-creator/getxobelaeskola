'use client';
import React, { useRef, useEffect } from 'react';

export default function KioskVideoSlide() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
        }
    }, []);

    return (
        <div className="w-full h-full flex items-center justify-center bg-black relative">
            <video
                ref={videoRef}
                className="w-full h-full object-cover opacity-80"
                src="https://assets.mixkit.co/videos/preview/mixkit-sailing-boat-on-the-sea-during-sunset-34538-large.mp4"
                muted
                loop
                playsInline
                autoPlay
            />
            <div className="absolute bottom-20 left-12 bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 max-w-xl">
                <h2 className="text-5xl font-display text-white mb-4">Aprende a Navegar</h2>
                <p className="text-white/80 text-2xl font-light">Escuela de Vela y Club Náutico Getxo</p>
                <div className="mt-4 flex gap-4">
                     <span className="px-4 py-2 bg-accent text-nautical-black font-bold uppercase tracking-widest text-xs rounded-full">Cursos Disponibles</span>
                     <span className="px-4 py-2 bg-white/20 text-white font-bold uppercase tracking-widest text-xs rounded-full">Inscripciones Abiertas</span>
                </div>
            </div>
        </div>
    );
}
