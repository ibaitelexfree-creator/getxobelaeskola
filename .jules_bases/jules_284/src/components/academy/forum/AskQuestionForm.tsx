'use client';

import React, { useState } from 'react';
import { apiUrl } from '@/lib/api';

interface AskQuestionFormProps {
    moduloId: string;
    onSuccess: (question: any) => void;
    onCancel: () => void;
}

export default function AskQuestionForm({ moduloId, onSuccess, onCancel }: AskQuestionFormProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(apiUrl('/api/forum/questions'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modulo_id: moduloId,
                    titulo: title,
                    contenido: content
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error creating question');
            }

            onSuccess(data.question);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-200 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="title" className="block text-xs uppercase tracking-widest text-white/50 font-bold">
                    Título de tu pregunta
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: ¿Cómo calculo la deriva?"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="content" className="block text-xs uppercase tracking-widest text-white/50 font-bold">
                    Detalles
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Explica tu duda con detalle..."
                    required
                    rows={6}
                    className="w-full bg-white/[0.03] border border-white/10 rounded px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-y min-h-[120px]"
                />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-8 py-2 bg-accent text-nautical-black font-black uppercase tracking-widest text-xs rounded hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? 'Publicando...' : 'Publicar Pregunta'}
                </button>
            </div>
        </form>
    );
}
