'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Edit3, Save, Calendar, Wind, Compass, Award, Plus, Trash2 } from 'lucide-react';

interface LogEntry {
    id: string;
    date: string;
    content: string;
    mood: 'confident' | 'challenging' | 'discovery';
    tags: string[];
}

export default function Logbook() {
    const [entries, setEntries] = useState<LogEntry[]>([]);
    const [isWriting, setIsWriting] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [selectedMood, setSelectedMood] = useState<LogEntry['mood']>('discovery');

    // Persistence Mock (Local Storage for now)
    useEffect(() => {
        const saved = localStorage.getItem('nautical_logbook');
        if (saved) setEntries(JSON.parse(saved));
    }, []);

    const saveEntries = (newEntries: LogEntry[]) => {
        setEntries(newEntries);
        localStorage.setItem('nautical_logbook', JSON.stringify(newEntries));
    };

    const handleAddEntry = () => {
        if (!newNote.trim()) return;

        const entry: LogEntry = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('es-ES', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            }),
            content: newNote,
            mood: selectedMood,
            tags: []
        };

        const updated = [entry, ...entries];
        saveEntries(updated);
        setNewNote('');
        setIsWriting(false);
    };

    const deleteEntry = (id: string) => {
        const updated = entries.filter(e => e.id !== id);
        saveEntries(updated);
    };

    return (
        <div className="w-full max-w-4xl mx-auto h-full flex flex-col font-display p-6 relative">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                        <Book className="text-nautical-black" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white italic">Cuaderno de Bitácora</h1>
                        <p className="text-white/40 text-sm">Registro personal de navegación académica</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsWriting(true)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full border border-white/10 transition-all"
                >
                    <Plus size={18} /> Nueva Entrada
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar space-y-6">

                {/* Writing Interface */}
                <AnimatePresence>
                    {isWriting && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white/5 border border-accent/30 rounded-2xl p-6 backdrop-blur-md shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-accent text-2xs uppercase tracking-widest font-bold">Registro de hoy</span>
                                <div className="flex gap-2">
                                    {(['discovery', 'confident', 'challenging'] as const).map(mood => (
                                        <button
                                            key={mood}
                                            onClick={() => setSelectedMood(mood)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedMood === mood ? 'bg-accent text-nautical-black scale-110' : 'bg-white/5 text-white/40 hover:text-white'}`}
                                            title={mood}
                                        >
                                            {mood === 'discovery' && <Compass size={14} />}
                                            {mood === 'confident' && <Award size={14} />}
                                            {mood === 'challenging' && <Wind size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Hoy he aprendido que..."
                                className="w-full bg-transparent border-none text-white focus:ring-0 text-lg leading-relaxed placeholder:text-white/20 min-h-[150px] resize-none"
                            />

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    onClick={() => setIsWriting(false)}
                                    className="text-white/40 hover:text-white px-4 py-2 text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddEntry}
                                    className="bg-accent text-nautical-black font-bold px-6 py-2 rounded-full flex items-center gap-2 hover:scale-105 transition-transform"
                                >
                                    <Save size={16} /> Guardar Registro
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Entry List */}
                {entries.length === 0 && !isWriting && (
                    <div className="h-64 flex flex-col items-center justify-center text-white/20 border-2 border-dashed border-white/5 rounded-3xl">
                        <Edit3 size={48} className="mb-4 opacity-50" />
                        <p className="text-lg">Tu cuaderno está vacío</p>
                        <p className="text-sm">Empieza a registrar tus descubrimientos náuticos.</p>
                    </div>
                )}

                {entries.map((entry) => (
                    <motion.div
                        key={entry.id}
                        layout
                        className="group relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-8 transition-all hover:border-white/20"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${entry.mood === 'discovery' ? 'bg-blue-500/20 text-blue-400' : entry.mood === 'confident' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                    {entry.mood === 'discovery' && <Compass size={18} />}
                                    {entry.mood === 'confident' && <Award size={18} />}
                                    {entry.mood === 'challenging' && <Wind size={18} />}
                                </div>
                                <div>
                                    <p className="text-3xs text-white/40 uppercase tracking-tighter mb-0.5">Fecha Estelar</p>
                                    <p className="text-white text-sm font-bold opacity-80 capitalize">{entry.date}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => deleteEntry(entry.id)}
                                className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-opacity p-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <p className="text-white/80 text-lg leading-relaxed font-serif italic">
                            "{entry.content}"
                        </p>

                        {/* Visual Page Curl Effect (Bottom Right) */}
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-white/5 to-transparent rounded-br-2xl pointer-events-none" />
                    </motion.div>
                ))}
            </div>

            {/* Footer Stats / Personal Totals */}
            <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-white/30 text-3xs uppercase mb-1">Entradas</div>
                    <div className="text-white text-xl font-bold">{entries.length}</div>
                </div>
                <div>
                    <div className="text-white/30 text-3xs uppercase mb-1">Racha</div>
                    <div className="text-white text-xl font-bold">3 días</div>
                </div>
                <div>
                    <div className="text-white/30 text-3xs uppercase mb-1">Nivel Reflexión</div>
                    <div className="text-accent text-xl font-bold italic">Grancapitán</div>
                </div>
            </div>
        </div>
    );
}
