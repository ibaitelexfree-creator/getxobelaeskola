'use client';

import React, { useState } from 'react';
import { submitExerciseAttempt } from '@/actions/peer-review';

interface WrittenExerciseSubmissionProps {
    activity: any;
    existingAttempt?: any;
    unitId: string;
    locale: string;
}

export default function WrittenExerciseSubmission({
    activity,
    existingAttempt,
    unitId,
    locale
}: WrittenExerciseSubmissionProps) {
    const [content, setContent] = useState(existingAttempt?.datos_json?.text || '');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const isPending = existingAttempt?.estado_revision === 'pendiente';
    const isReviewed = existingAttempt?.estado_revision === 'revisado';
    const isApproved = existingAttempt?.estado_revision === 'aprobado';

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setSubmitting(true);
        setMessage(null);

        try {
            const res = await submitExerciseAttempt({
                activityId: activity.id,
                content: content,
                unitId: unitId
            });

            if (res.error) {
                setMessage({ type: 'error', text: res.error });
            } else {
                setMessage({ type: 'success', text: locale === 'eu' ? 'Bidalita! Zure ariketa berrikuspenaren zain dago.' : '¡Enviado! Tu ejercicio está pendiente de revisión.' });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-sm p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📝</span>
                <div>
                    <h3 className="text-xl font-display italic text-white">
                        {locale === 'eu' ? activity.titulo_eu : activity.titulo_es}
                    </h3>
                    <p className="text-white/70 text-sm">
                        {locale === 'eu' ? activity.descripcion_eu : activity.descripcion_es}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={submitting || isReviewed || isApproved}
                    className="w-full min-h-[200px] bg-black/30 border border-white/20 rounded p-4 text-white focus:border-accent outline-none font-mono text-sm"
                    placeholder={locale === 'eu' ? "Idatzi zure erantzuna hemen..." : "Escribe tu respuesta aquí..."}
                />

                <div className="flex justify-between items-center">
                    <div>
                        {existingAttempt && (
                            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                                isPending ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' :
                                isReviewed ? 'border-blue-500/50 text-blue-500 bg-blue-500/10' :
                                isApproved ? 'border-green-500/50 text-green-500 bg-green-500/10' :
                                'border-white/20 text-white/50'
                            }`}>
                                {isPending ? (locale === 'eu' ? 'Zain' : 'Pendiente') :
                                 isReviewed ? (locale === 'eu' ? 'Berrikusia' : 'Revisado') :
                                 isApproved ? (locale === 'eu' ? 'Onartua' : 'Aprobado') :
                                 existingAttempt.estado_revision}
                            </span>
                        )}
                        {message && (
                            <span className={`ml-4 text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {message.text}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !content.trim() || isReviewed || isApproved}
                        className="px-8 py-3 bg-accent text-nautical-black font-black uppercase tracking-widest text-xs hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? '...' : (existingAttempt ? (locale === 'eu' ? 'Eguneratu' : 'Actualizar') : (locale === 'eu' ? 'Bidali' : 'Enviar'))}
                    </button>
                </div>
            </div>
        </div>
    );
}
