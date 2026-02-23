'use client';

import React, { useRef, useState, useEffect } from 'react';
import { VideoCheckpoint, QuestionData } from './types';
import QuizModal from './QuizModal';

interface InteractiveVideoProps {
    src: string;
    checkpoints: VideoCheckpoint[];
    questions: Record<string, QuestionData>;
    className?: string;
    poster?: string;
}

export default function InteractiveVideo({ src, checkpoints, questions, className = '', poster }: InteractiveVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<string>>(new Set());
    const [activeCheckpoint, setActiveCheckpoint] = useState<VideoCheckpoint | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Sort checkpoints by time
    const sortedCheckpoints = [...checkpoints].sort((a, b) => a.time - b.time);

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const time = videoRef.current.currentTime;
        setCurrentTime(time);

        // Check for checkpoints
        for (const cp of sortedCheckpoints) {
            // Trigger if within 0.5s of checkpoint time, not completed, and not currently active
            if (!completedCheckpoints.has(cp.questionId) &&
                Math.abs(time - cp.time) < 0.5 &&
                !activeCheckpoint) {

                // Pause video
                videoRef.current.pause();
                setIsPlaying(false);
                setActiveCheckpoint(cp);
                setIsModalOpen(true);
                break; // Only trigger one at a time
            }
        }
    };

    const handleQuizCorrect = () => {
        if (activeCheckpoint) {
            const newCompleted = new Set(completedCheckpoints);
            newCompleted.add(activeCheckpoint.questionId);
            setCompletedCheckpoints(newCompleted);

            setIsModalOpen(false);
            setActiveCheckpoint(null);

            // Resume video
            if (videoRef.current) {
                videoRef.current.play().catch(e => console.error("Error resuming video:", e));
                setIsPlaying(true);
            }
        }
    };

    const handleModalClose = () => {
        // Close modal, but do not mark as complete.
        // User must answer correctly to proceed past this checkpoint.
        setIsModalOpen(false);
        setActiveCheckpoint(null);
    };

    return (
        <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ${className}`}>
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-cover"
                poster={poster}
                controls
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            >
                <track kind="captions" />
                Tu navegador no soporta el elemento de video.
            </video>

            {activeCheckpoint && questions[activeCheckpoint.questionId] && (
                <QuizModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onCorrect={handleQuizCorrect}
                    question={questions[activeCheckpoint.questionId]}
                />
            )}
        </div>
    );
}
