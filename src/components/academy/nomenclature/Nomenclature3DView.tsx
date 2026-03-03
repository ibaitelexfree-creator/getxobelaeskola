'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import SailboatModel from './SailboatModel';
import { NAUTICAL_TERMS } from '@/data/academy/nautical-nomenclature';
import { motion, AnimatePresence } from 'framer-motion';

interface Nomenclature3DViewProps {
    locale: string;
}

export default function Nomenclature3DView({ locale }: Nomenclature3DViewProps) {
    const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);

    const activeCard = hoveredPartId
        ? NAUTICAL_TERMS.find(t => t.id === hoveredPartId)
        : null;

    return (
        <div className="w-full h-[600px] relative rounded-xl overflow-hidden bg-gradient-to-b from-sky-200 to-sky-500 border border-white/20 shadow-xl">
            {/* 3D Canvas */}
            <div className="absolute inset-0">
                <Canvas shadows camera={{ position: [8, 6, 8], fov: 45 }}>
                    <Environment preset="sunset" />
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                    <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />

                    <SailboatModel onHover={setHoveredPartId} />
                </Canvas>
            </div>

            {/* Overlay Info Card */}
            <AnimatePresence mode="wait">
                {activeCard && (
                    <motion.div
                        key={activeCard.id}
                        initial={{ opacity: 0, y: 20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: 20, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-6 right-6 w-80 bg-white/95 backdrop-blur-md p-6 rounded-lg shadow-2xl border border-white/50 text-slate-800 pointer-events-none select-none z-10"
                    >
                        <h3 className="text-2xl font-bold text-sky-600 mb-2 uppercase tracking-wide">
                            {locale === 'eu' ? activeCard.term_eu : activeCard.term_es}
                        </h3>

                        <div className="mb-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Función</h4>
                            <p className="text-sm leading-relaxed text-slate-700">
                                {locale === 'eu' ? activeCard.definition_eu : activeCard.definition_es}
                            </p>
                        </div>

                        <div className="bg-sky-50 p-3 rounded-md border border-sky-100">
                             <h4 className="text-xs font-bold text-sky-500 uppercase mb-1 flex items-center gap-1">
                                <span>?</span> Pregunta de Repaso
                            </h4>
                            <p className="text-sm font-medium text-sky-900 italic">
                                {locale === 'eu' ? activeCard.question_eu : activeCard.question_es}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instructions Overlay (if nothing selected) */}
            {!activeCard && (
                 <div className="absolute bottom-6 left-6 bg-black/30 text-white px-4 py-2 rounded-full backdrop-blur-sm text-sm pointer-events-none">
                    Rotar: Click + Arrastrar • Zoom: Rueda • Hover para detalles
                </div>
            )}
        </div>
    );
}
