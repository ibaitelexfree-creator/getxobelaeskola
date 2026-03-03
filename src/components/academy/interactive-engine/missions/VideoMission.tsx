'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MissionData, VideoCheckpoint, VideoMissionData } from '../types';
import { useMissionStore } from '../store';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface VideoMissionProps {
    data: MissionData;
    onComplete?: (score: number) => void;
}

export const VideoMission: React.FC<VideoMissionProps> = ({ data, onComplete }) => {
    const missionData = data as VideoMissionData;
    const { videoUrl, checkpoints = [] } = missionData;

    const { completeMission, setFeedback } = useMissionStore();

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeCheckpoint, setActiveCheckpoint] = useState<VideoCheckpoint | null>(null);
    const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<number>>(new Set());
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isYouTube, setIsYouTube] = useState(false);
    const [ytPlayer, setYtPlayer] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // Use a unique ID for the player to avoid conflicts if multiple instances are mounted
    const [playerId] = useState(`yt-player-${Math.random().toString(36).substr(2, 9)}`);

    // YouTube API Load
    useEffect(() => {
        if (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))) {
            setIsYouTube(true);
            const videoId = extractYouTubeId(videoUrl);
            if (!videoId) {
                setError('Invalid YouTube URL');
                setIsLoading(false);
                return;
            }

            if (!(window as any).YT) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

                (window as any).onYouTubeIframeAPIReady = () => {
                   initPlayer(videoId);
                };
            } else {
                initPlayer(videoId);
            }
        } else {
            setIsYouTube(false);
            setIsLoading(false);
        }
    }, [videoUrl]);

    // Cleanup YouTube Player
    useEffect(() => {
        return () => {
            if (ytPlayer && typeof ytPlayer.destroy === 'function') {
                try {
                    ytPlayer.destroy();
                } catch (e) {
                    console.warn('Error destroying YouTube player', e);
                }
            }
        };
    }, [ytPlayer]);

    const initPlayer = (videoId: string) => {
        if ((window as any).YT && (window as any).YT.Player) {
             const player = new (window as any).YT.Player(playerId, {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1,
                    'controls': 1,
                    'modestbranding': 1,
                    'rel': 0
                },
                events: {
                    'onReady': (event: any) => {
                        setDuration(event.target.getDuration());
                        setYtPlayer(player);
                        setIsLoading(false);
                    },
                    'onStateChange': (event: any) => {
                         if (event.data === (window as any).YT.PlayerState.ENDED) {
                             handleVideoEnd();
                         }
                    }
                }
            });
        }
    };

    const extractYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Time Tracking Loop
    useEffect(() => {
        const interval = setInterval(() => {
            let time = 0;
            if (isYouTube && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
                time = ytPlayer.getCurrentTime();
            } else if (videoRef.current) {
                time = videoRef.current.currentTime;
            }
            setCurrentTime(time);
            checkCheckpoints(time);
        }, 500);

        return () => clearInterval(interval);
    }, [isYouTube, ytPlayer, checkpoints, completedCheckpoints]);

    const checkCheckpoints = (time: number) => {
        // Find the first uncompleted checkpoint that we have passed
        const passedCheckpointIndex = checkpoints.findIndex((cp, index) => {
             return time >= cp.time && !completedCheckpoints.has(index);
        });

        if (passedCheckpointIndex !== -1) {
            const checkpoint = checkpoints[passedCheckpointIndex];
            pauseVideo();

            // If we are significantly past the checkpoint (e.g. > 1 second), rewind to it
            // This prevents skipping content
            if (time - checkpoint.time > 1) {
                 seekTo(checkpoint.time);
            }

            setActiveCheckpoint(checkpoint);
        }
    };

    const pauseVideo = () => {
        if (isYouTube && ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
            ytPlayer.pauseVideo();
        } else if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    const playVideo = () => {
         if (isYouTube && ytPlayer && typeof ytPlayer.playVideo === 'function') {
            ytPlayer.playVideo();
        } else if (videoRef.current) {
            videoRef.current.play();
        }
    };

    const seekTo = (seconds: number) => {
        if (isYouTube && ytPlayer && typeof ytPlayer.seekTo === 'function') {
            ytPlayer.seekTo(seconds, true);
        } else if (videoRef.current) {
            videoRef.current.currentTime = seconds;
        }
    };

    const handleVideoEnd = () => {
        if (completedCheckpoints.size === checkpoints.length) {
            completeMission(100);
            if (onComplete) onComplete(100);
        }
    };

    const handleAnswer = () => {
        if (!activeCheckpoint || selectedOption === null) return;

        if (selectedOption === activeCheckpoint.correctAnswerIndex) {
            setFeedback('¡Correcto!', 'success');
            // Mark as completed
            const cpIndex = checkpoints.findIndex(cp => cp === activeCheckpoint);
            const newCompleted = new Set(completedCheckpoints);
            newCompleted.add(cpIndex);
            setCompletedCheckpoints(newCompleted);

            // Close question and resume
            setTimeout(() => {
                setActiveCheckpoint(null);
                setSelectedOption(null);
                setFeedback(null);
                playVideo();
            }, 1500);
        } else {
            setFeedback('Incorrecto. Inténtalo de nuevo.', 'error');
        }
    };

    if (error) {
        return <div className="p-4 text-red-400 border border-red-500/20 bg-red-900/10 rounded-lg">{error}</div>;
    }

    return (
        <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-nautical-black z-10">
                    <div className="animate-spin text-accent">⚓</div>
                </div>
            )}

            {isYouTube ? (
                <div id={playerId} className="w-full h-full"></div>
            ) : (
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    controls
                    onEnded={handleVideoEnd}
                    onLoadedMetadata={(e) => {
                        setDuration(e.currentTarget.duration);
                        setIsLoading(false);
                    }}
                />
            )}

            {/* Checkpoint Overlay */}
            {activeCheckpoint && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-nautical-black border border-white/20 p-8 rounded-xl max-w-lg w-full shadow-2xl relative overflow-hidden">
                        {/* Background mesh */}
                        <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6 text-accent">
                                <AlertCircle size={24} />
                                <h3 className="text-xl font-display italic">Pregunta de Control</h3>
                            </div>

                            <p className="text-white text-lg mb-8 leading-relaxed font-light">{activeCheckpoint.question}</p>

                            <div className="space-y-3">
                                {activeCheckpoint.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedOption(index)}
                                        className={`w-full text-left p-4 rounded-lg border transition-all duration-300 flex items-center justify-between group outline-none focus:ring-2 focus:ring-accent
                                            ${selectedOption === index
                                                ? 'bg-accent text-nautical-black border-accent font-bold shadow-lg shadow-accent/20'
                                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                            }
                                        `}
                                    >
                                        <span>{option}</span>
                                        {selectedOption === index && <CheckCircle2 size={18} />}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleAnswer}
                                    disabled={selectedOption === null}
                                    className="px-8 py-3 bg-accent text-nautical-black font-black uppercase tracking-widest text-xs rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all shadow-lg hover:shadow-xl"
                                >
                                    Responder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
