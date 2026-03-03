'use client';

import React from 'react';
import { Play, Pause, Volume2, MessageSquare } from 'lucide-react';

interface FeedbackItem {
    id: string;
    content?: string;
    audio_url?: string;
    created_at: string;
    instructor_id: string;
    is_read: boolean;
}

interface FeedbackDisplayProps {
    feedback: FeedbackItem[];
    onPlayAudio?: (url: string) => void;
}

export default function FeedbackDisplay({ feedback, onPlayAudio }: FeedbackDisplayProps) {
    if (!feedback || feedback.length === 0) return null;

    return (
        <div className="space-y-4 mt-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
                <MessageSquare size={14} /> Feedback del Instructor
            </h4>

            <div className="space-y-3">
                {feedback.map((item) => (
                    <div
                        key={item.id}
                        className={`bg-white/[0.03] border ${item.is_read ? 'border-white/5' : 'border-accent/30 bg-accent/[0.02]'} rounded-xl p-4 transition-all hover:border-accent/20 relative group`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                                {item.content && (
                                    <p className="text-sm text-white/80 leading-relaxed italic font-serif">
                                        "{item.content}"
                                    </p>
                                )}

                                {item.audio_url && (
                                    <div className="mt-3 flex items-center gap-3">
                                        <audio controls className="h-8 w-full max-w-[200px] rounded-full opacity-60 hover:opacity-100 transition-opacity">
                                            <source src={item.audio_url} type="audio/webm" />
                                            Tu navegador no soporta audio.
                                        </audio>
                                    </div>
                                )}

                                <div className="text-[10px] uppercase tracking-widest text-white/30 pt-2">
                                    {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
