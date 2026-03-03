'use client';

import React, { useState } from 'react';
import { microLessons } from '@/data/academy/micro-lessons';
import MicroLessonFeed from './MicroLessonFeed';
import { Play } from 'lucide-react';
import Image from 'next/image';

export default function MicroLessonTray() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(undefined);

    const handleOpen = (id: string) => {
        setSelectedLessonId(id);
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        setSelectedLessonId(undefined);
    };

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    Micro-Lecciones
                </h2>
                <span className="text-[10px] uppercase tracking-widest text-white/40">Novedades Semanales</span>
            </div>

            <div
                className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                } as React.CSSProperties}
            >
                {microLessons.map((lesson) => (
                    <button
                        key={lesson.id}
                        onClick={() => handleOpen(lesson.id)}
                        className="relative flex-shrink-0 w-28 h-48 rounded-sm overflow-hidden snap-start group border border-white/10 hover:border-accent/50 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        {/* Thumbnail */}
                        <Image
                            src={lesson.thumbnailUrl}
                            alt={lesson.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        {/* Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

                        {/* Play Icon */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <div className="bg-accent/90 p-2 rounded-full text-black backdrop-blur-sm transform scale-75 group-hover:scale-100 transition-transform shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]">
                                <Play size={16} fill="currentColor" />
                             </div>
                        </div>

                        {/* Duration Badge */}
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-sm text-[9px] font-mono text-white border border-white/10">
                             {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                        </div>

                        {/* Text */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                            <p className="text-[9px] uppercase tracking-wider text-accent font-bold mb-0.5">{lesson.category}</p>
                            <h3 className="text-white text-xs font-bold leading-tight line-clamp-2 drop-shadow-sm font-display">
                                {lesson.title}
                            </h3>
                        </div>
                    </button>
                ))}
            </div>

            <MicroLessonFeed
                isOpen={isOpen}
                initialLessonId={selectedLessonId}
                onClose={handleClose}
            />
        </section>
    );
}
