'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send, Loader2 } from 'lucide-react';
import { useAcademyFeedback } from '@/hooks/useAcademyFeedback';

interface FeedbackRecorderProps {
    studentId: string;
    contextType: 'logbook' | 'evaluation';
    contextId: string;
    onSuccess?: () => void;
}

export default function FeedbackRecorder({ studentId, contextType, contextId, onSuccess }: FeedbackRecorderProps) {
    const { showMessage } = useAcademyFeedback();
    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isSending, setIsSending] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [recordingTime, setRecordingTime] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                chunksRef.current = [];
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            showMessage('Error', 'No se pudo acceder al micrófono', 'error');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const deleteAudio = () => {
        setAudioBlob(null);
    };

    const handleSubmit = async () => {
        if (!text.trim() && !audioBlob) {
            showMessage('Info', 'Añade texto o audio antes de enviar', 'warning');
            return;
        }

        setIsSending(true);
        const formData = new FormData();
        formData.append('student_id', studentId);
        formData.append('context_type', contextType);
        formData.append('context_id', contextId);
        if (text) formData.append('content', text);
        if (audioBlob) formData.append('audio', audioBlob, 'feedback.webm');

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to send feedback');

            showMessage('Éxito', 'Feedback enviado correctamente', 'success');
            setText('');
            setAudioBlob(null);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error sending feedback:', error);
            showMessage('Error', 'Error al enviar feedback', 'error');
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe tu feedback aquí..."
                className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent/30 min-h-[80px] resize-none"
            />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {!audioBlob ? (
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                                ${isRecording
                                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {isRecording ? <Square size={14} fill="currentColor" /> : <Mic size={14} />}
                            {isRecording ? formatTime(recordingTime) : 'Grabar Audio'}
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 px-4 py-2 rounded-full">
                            <span className="text-xs font-bold text-accent uppercase tracking-wider">Audio Grabado</span>
                            <button
                                onClick={deleteAudio}
                                className="text-white/40 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isSending || (!text && !audioBlob)}
                    className="bg-accent text-nautical-black px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center gap-2"
                >
                    {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Enviar
                </button>
            </div>
        </div>
    );
}
