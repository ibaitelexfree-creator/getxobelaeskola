'use client';

import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import Image from 'next/image';

interface FlashcardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pregunta: any;
    isFlipped: boolean;
    onFlip: () => void;
    locale: string;
}

export default function Flashcard({ pregunta, isFlipped, onFlip, locale }: FlashcardProps) {
    const enunciado = locale === 'eu' ? pregunta.enunciado_eu : pregunta.enunciado_es;
    const explicacion = locale === 'eu' ? pregunta.explicacion_eu : pregunta.explicacion_es;

    return (
        <div className="w-full h-96 cursor-pointer perspective-1000 group" onClick={onFlip}>
            <motion.div
                className="w-full h-full relative"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front */}
                <div
                    className="absolute w-full h-full bg-white/5 border border-white/10 group-hover:border-accent/30 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-sm transition-colors"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-accent">Pregunta</span>
                    </div>
                    {pregunta.imagen_url && (
                        <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden border border-white/5">
                            <Image
                                src={pregunta.imagen_url}
                                alt="Imagen de pregunta"
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                    <h3 className="text-xl font-display text-white mb-2 leading-relaxed">{enunciado}</h3>
                    <div className="mt-auto text-white/40 text-xs flex items-center gap-2 uppercase tracking-widest">
                        <HelpCircle size={14} />
                        <span>Ver respuesta</span>
                    </div>
                </div>

                {/* Back */}
                <div
                    className="absolute w-full h-full bg-nautical-dark border border-accent/20 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-xl"
                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                >
                    <div className="mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Respuesta Correcta</span>
                    </div>
                    <div className="text-xl font-bold text-white mb-4 leading-relaxed">
                        {pregunta.respuesta_correcta}
                    </div>
                    {explicacion && (
                        <div className="text-white/70 text-sm italic border-t border-white/10 pt-4 mt-2 max-h-[150px] overflow-y-auto">
                            "{explicacion}"
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
