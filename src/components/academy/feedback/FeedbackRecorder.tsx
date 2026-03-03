'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Save, Play, Trash2, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface FeedbackRecorderProps {
    entityType: 'logbook' | 'evaluation';
    entityId: string;
    studentId?: string; // Required for sending notification
    existingText?: string;
    existingAudioUrl?: string;
    onSave?: () => void;
    context?: any; // Extra context like question ID for evaluations
}

export default function FeedbackRecorder({
    entityType,
    entityId,
    studentId,
    existingText = '',
    existingAudioUrl = '',
    onSave,
    context
}: FeedbackRecorderProps) {
    const [text, setText] = useState(existingText);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
    const [isSaving, setIsSaving] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const supabase = createClient();

    // Sync state with props when they change
    useEffect(() => {
        setText(existingText);
        setAudioUrl(existingAudioUrl || null);
    }, [existingText, existingAudioUrl]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('No se pudo acceder al micrófono');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const deleteRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let finalAudioUrl = existingAudioUrl;

            // Upload audio if new blob exists
            if (audioBlob) {
                const fileName = `feedback/${entityType}/${entityId}_${Date.now()}.webm`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('academy-assets')
                    .upload(fileName, audioBlob);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('academy-assets')
                    .getPublicUrl(fileName);

                finalAudioUrl = publicUrl;
            } else if (audioUrl === null) {
                // If explicitly deleted
                finalAudioUrl = '';
            }

            // Save to DB
            if (entityType === 'logbook') {
                const { error } = await supabase
                    .from('horas_navegacion')
                    .update({
                        feedback_text: text,
                        feedback_audio_url: finalAudioUrl
                    })
                    .eq('id', entityId);

                if (error) throw error;
            } else if (entityType === 'evaluation') {
                // For evaluations, we might insert or update
                // Need to check if context has pregunta_id
                const payload: any = {
                    intento_id: entityId,
                    feedback_text: text,
                    feedback_audio_url: finalAudioUrl,
                    instructor_id: (await supabase.auth.getUser()).data.user?.id
                };

                if (context?.preguntaId) {
                    payload.pregunta_id = context.preguntaId;
                }

                const { error } = await supabase
                    .from('evaluacion_feedback')
                    .insert(payload); // Assuming insert for now, logic to update if exists would be better but keeping simple

                if (error) throw error;
            }

            // Send Notification
            if (studentId) {
                await supabase.from('notifications').insert({
                    user_id: studentId,
                    title: 'Nuevo Feedback de Instructor',
                    message: entityType === 'logbook' ? 'Tienes feedback en tu bitácora.' : 'Tienes feedback en tu evaluación.',
                    type: entityType === 'logbook' ? 'feedback_logbook' : 'feedback_evaluation',
                    data: { entityId, entityType }
                });
            }

            if (onSave) onSave();
            alert('Feedback guardado');

        } catch (error) {
            console.error('Error saving feedback:', error);
            alert('Error al guardar feedback');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-nautical-black/80 border border-white/10 rounded-xl p-4 space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-accent font-bold">Feedback del Instructor</h4>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe un comentario..."
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-accent/50 outline-none min-h-[80px]"
            />

            <div className="flex items-center gap-4">
                {!isRecording && !audioUrl && (
                    <button
                        onClick={startRecording}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white transition-colors border border-white/10"
                    >
                        <Mic size={14} />
                        Grabar Audio
                    </button>
                )}

                {isRecording && (
                    <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs transition-colors animate-pulse border border-red-500/30"
                    >
                        <Square size={14} />
                        Detener Grabación
                    </button>
                )}

                {audioUrl && (
                    <div className="flex items-center gap-2 bg-accent/10 px-3 py-2 rounded-lg border border-accent/20">
                        <Play size={14} className="text-accent cursor-pointer" onClick={() => new Audio(audioUrl).play()} />
                        <span className="text-xs text-accent font-mono">Audio grabado</span>
                        <button onClick={deleteRecording} className="text-white/40 hover:text-red-400 ml-2">
                            <Trash2 size={12} />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-nautical-black font-bold rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                    {isSaving ? (
                        <span className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                        <Send size={14} />
                    )}
                    {isSaving ? 'Guardando...' : 'Enviar Feedback'}
                </button>
            </div>
        </div>
    );
}
