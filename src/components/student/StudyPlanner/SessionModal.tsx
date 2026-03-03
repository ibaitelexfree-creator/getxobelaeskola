import React, { useState, useEffect } from 'react';
import { StudySession } from './types';
import { X, Trash } from 'lucide-react';
import { format } from 'date-fns';

interface SessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (session: Partial<StudySession>) => void;
    onDelete: (sessionId: string) => void;
    initialDate?: Date;
    initialHour?: number;
    sessionToEdit?: StudySession | null;
}

export default function SessionModal({
    isOpen,
    onClose,
    onSave,
    onDelete,
    initialDate,
    initialHour,
    sessionToEdit
}: SessionModalProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (sessionToEdit) {
                const start = new Date(sessionToEdit.start_time);
                const end = new Date(sessionToEdit.end_time);
                setTitle(sessionToEdit.title);
                setDate(format(start, 'yyyy-MM-dd'));
                setStartTime(format(start, 'HH:mm'));
                setEndTime(format(end, 'HH:mm'));
            } else if (initialDate) {
                setTitle('');
                setDate(format(initialDate, 'yyyy-MM-dd'));
                setStartTime(initialHour ? `${String(initialHour).padStart(2, '0')}:00` : '09:00');
                setEndTime(initialHour ? `${String(initialHour + 1).padStart(2, '0')}:00` : '10:00');
            }
        }
    }, [isOpen, sessionToEdit, initialDate, initialHour]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);

        onSave({
            id: sessionToEdit?.id,
            title,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            completed: sessionToEdit?.completed || false
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-nautical-black border border-white/10 rounded-lg shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-display font-bold text-white mb-6">
                        {sessionToEdit ? 'Editar Sesión' : 'Nueva Sesión de Estudio'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                                Título / Asignatura
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded p-3 text-white placeholder:text-white/20 focus:border-accent focus:outline-none transition-colors"
                                placeholder="Ej: Navegación Costera"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                                Fecha
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-accent focus:outline-none transition-colors"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                                    Hora Inicio
                                </label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-accent focus:outline-none transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                                    Hora Fin
                                </label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-accent focus:outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            {sessionToEdit && (
                                <button
                                    type="button"
                                    onClick={() => onDelete(sessionToEdit.id)}
                                    className="px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors"
                                >
                                    <Trash size={20} />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="flex-1 bg-accent text-nautical-black font-bold uppercase tracking-widest text-xs py-3 rounded hover:bg-white transition-colors"
                            >
                                {sessionToEdit ? 'Guardar Cambios' : 'Crear Sesión'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
