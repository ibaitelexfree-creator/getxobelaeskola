'use client';

import React from 'react';
import { Wind, Thermometer, User, Anchor } from 'lucide-react';

export default function KioskStats() {
    return (
        <div className="w-full h-full bg-nautical-black flex flex-col p-12 text-white">
            <h1 className="text-6xl font-display italic text-accent mb-12">Estadísticas del Día</h1>

            <div className="grid grid-cols-2 gap-12 flex-grow">
                <div className="bg-white/5 rounded-2xl p-8 flex flex-col items-center justify-center border border-white/10 backdrop-blur-sm">
                    <Wind size={64} className="text-accent mb-4" />
                    <div className="text-8xl font-black font-display tracking-tight">12 <span className="text-4xl">Kn</span></div>
                    <div className="text-2xl text-white/60 font-light mt-2">Viento NE</div>
                </div>

                <div className="bg-white/5 rounded-2xl p-8 flex flex-col items-center justify-center border border-white/10 backdrop-blur-sm">
                    <Thermometer size={64} className="text-orange-400 mb-4" />
                    <div className="text-8xl font-black font-display tracking-tight">22<span className="text-4xl">ºC</span></div>
                    <div className="text-2xl text-white/60 font-light mt-2">Temperatura</div>
                </div>

                <div className="bg-white/5 rounded-2xl p-8 flex flex-col items-center justify-center border border-white/10 backdrop-blur-sm">
                    <User size={64} className="text-sky-400 mb-4" />
                    <div className="text-8xl font-black font-display tracking-tight">2</div>
                    <div className="text-2xl text-white/60 font-light mt-2">Clases Activas</div>
                </div>

                <div className="bg-white/5 rounded-2xl p-8 flex flex-col items-center justify-center border border-white/10 backdrop-blur-sm">
                    <Anchor size={64} className="text-white/80 mb-4" />
                    <div className="text-8xl font-black font-display tracking-tight">45 <span className="text-4xl">MN</span></div>
                    <div className="text-2xl text-white/60 font-light mt-2">Millas Navegadas Hoy</div>
                </div>
            </div>

            <div className="mt-12 text-center text-white/20 font-mono text-sm uppercase tracking-widest">
                Actualizado: {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
}
