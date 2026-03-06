
import React, { useRef, useState, useEffect } from 'react';
import { MissionData } from '../types';
import { useMissionStore } from '../store';
import { Play, Pause, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Checkpoint {
    time: number; // seconds
    question: string;
    options: string[];
    correct: number; // index of correct option
    explanation?: string;
}

interface VideoCheckpointMissionProps {
    data: MissionData;
    onComplete?: (score: number) => void;
}

export const VideoCheckpointMission: React.FC<VideoCheckpointMissionProps> = ({ data, onComplete }) => {
    const {
        startMission,
        completeMission,
        setFeedback
    } = useMissionStore();

    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeCheckpoint, setActiveCheckpoint] = useState<Checkpoint | null>(null);
    const [processedCheckpoints, setProcessedCheckpoints] = useState<Set<number>>(new Set());
    const [showQuiz, setShowQuiz] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [quizFeedback, setQuizFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const videoUrl = data.video_url as string;
    const checkpoints = (data.checkpoints as Checkpoint[]) || [];

    // Sort checkpoints by time just in case
    const sortedCheckpoints = React.useMemo(() => {
        return [...checkpoints].sort((a, b) => a.time - b.time);
    }, [checkpoints]);

    useEffect(() => {
        startMission();
    }, [startMission]);

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const time = videoRef.current.currentTime;
        setCurrentTime(time);

        // Check for checkpoints
        // Find the first checkpoint that:
        // 1. Is in the past (time >= checkpoint.time)
        // 2. Has NOT been processed yet
        // 3. Is within a reasonable window (e.g., 1 second) to avoid triggering old checkpoints if user seeks forward
        // Actually, preventing seeking past uncompleted checkpoints is better, but for now simple logic:

        const checkpoint = sortedCheckpoints.find(cp =>
            time >= cp.time &&
            time < cp.time + 1.5 && // window of 1.5s
            !processedCheckpoints.has(cp.time)
        );

        if (checkpoint) {
            pauseVideo();
            setActiveCheckpoint(checkpoint);
            setShowQuiz(true);
            setProcessedCheckpoints(prev => new Set(prev).add(checkpoint.time));
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleVideoEnded = () => {
        setIsPlaying(false);
        const score = 100; // Full score for watching and passing all checkpoints
        completeMission(score);
        if (onComplete) onComplete(score);
        setFeedback('¡Video completado!', 'success');
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const pauseVideo = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleOptionSelect = (index: number) => {
        if (quizFeedback?.type === 'success') return; // Already correct

        setSelectedOption(index);

        if (activeCheckpoint) {
            if (index === activeCheckpoint.correct) {
                setQuizFeedback({ type: 'success', message: '¡Correcto!' });

                // Auto resume after delay
                setTimeout(() => {
                    closeQuiz();
                    if (videoRef.current) {
                        videoRef.current.play();
                        setIsPlaying(true);
                    }
                }, 1500);
            } else {
                setQuizFeedback({
                    type: 'error',
                    message: activeCheckpoint.explanation || 'Respuesta incorrecta, intenta de nuevo.'
                });
            }
        }
    };

    const closeQuiz = () => {
        setShowQuiz(false);
        setActiveCheckpoint(null);
        setSelectedOption(null);
        setQuizFeedback(null);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!videoUrl) {
        return <div className="text-red-400 p-4">Error: No se proporcionó URL de video.</div>;
    }

    return (
        <div className="w-full max-w-4xl mx-auto bg-black/40 rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
            {/* Video Player */}
            <div className="relative aspect-video bg-black group">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleVideoEnded}
                    playsInline
                    controls={false} // Custom controls
                />

                {/* Custom Controls Overlay */}
                {!showQuiz && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-white/20 rounded-full cursor-pointer relative overflow-hidden"
                             onClick={(e) => {
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 const pos = (e.clientX - rect.left) / rect.width;
                                 if (videoRef.current) {
                                     videoRef.current.currentTime = pos * duration;
                                 }
                             }}>
                            <div
                                className="absolute top-0 left-0 h-full bg-accent transition-all duration-100"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                            {/* Checkpoint Markers */}
                            {sortedCheckpoints.map((cp, idx) => (
                                <div
                                    key={idx}
                                    className={`absolute top-0 w-0.5 h-full ${processedCheckpoints.has(cp.time) ? 'bg-green-500' : 'bg-yellow-500'}`}
                                    style={{ left: `${(cp.time / duration) * 100}%` }}
                                />
                            ))}
                        </div>

                        {/* Buttons & Time */}
                        <div className="flex items-center justify-between text-white">
                            <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                            </button>
                            <span className="text-xs font-mono opacity-80">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Big Play Button Overlay (when paused and not quiz) */}
                {!isPlaying && !showQuiz && currentTime < duration && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                            <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                    </div>
                )}
            </div>

            {/* Quiz Overlay */}
            <AnimatePresence>
                {showQuiz && activeCheckpoint && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <div className="w-full max-w-lg">
                            <div className="mb-6 text-center">
                                <span className="inline-block px-3 py-1 bg-accent/20 text-accent text-xs font-bold uppercase tracking-widest rounded-full mb-3">
                                    Video Checkpoint
                                </span>
                                <h3 className="text-2xl font-display text-white mb-2">{activeCheckpoint.question}</h3>
                                <p className="text-white/50 text-sm">Responde correctamente para continuar.</p>
                            </div>

                            <div className="space-y-3">
                                {activeCheckpoint.options.map((option, idx) => {
                                    const isSelected = selectedOption === idx;
                                    const isCorrect = idx === activeCheckpoint.correct;
                                    let btnClass = "bg-white/5 border-white/10 hover:bg-white/10 text-white/80";

                                    if (isSelected) {
                                        if (quizFeedback?.type === 'success' && isCorrect) {
                                            btnClass = "bg-green-500/20 border-green-500 text-green-100";
                                        } else if (quizFeedback?.type === 'error') {
                                            btnClass = "bg-red-500/20 border-red-500 text-red-100";
                                        } else {
                                            btnClass = "bg-accent/20 border-accent text-white";
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionSelect(idx)}
                                            className={`w-full p-4 text-left rounded-lg border transition-all duration-200 flex items-center justify-between group ${btnClass}`}
                                            disabled={quizFeedback?.type === 'success'}
                                        >
                                            <span>{option}</span>
                                            {isSelected && quizFeedback?.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                            {isSelected && quizFeedback?.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {quizFeedback && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className={`mt-6 p-4 rounded-lg flex items-start gap-3 border ${
                                        quizFeedback.type === 'success'
                                            ? 'bg-green-500/10 border-green-500/20'
                                            : 'bg-red-500/10 border-red-500/20'
                                    }`}
                                >
                                    {quizFeedback.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                                    <p className={`text-sm ${
                                        quizFeedback.type === 'success' ? 'text-green-200' : 'text-red-200'
                                    }`}>
                                        {quizFeedback.message}
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
