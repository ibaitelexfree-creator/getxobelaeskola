'use client';

import React, { useEffect, useRef, useState } from 'react';
import CheckpointQuestion from './CheckpointQuestion';

export interface Checkpoint {
    time: number; // seconds
    question: string;
    options: string[];
    correctOptionIndex: number;
}

interface VideoWithCheckpointsProps {
    videoUrl: string;
    videoType?: 'youtube' | 'native'; // default youtube
    checkpoints: Checkpoint[];
    onComplete?: () => void;
    poster?: string;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export default function VideoWithCheckpoints({
    videoUrl,
    videoType = 'youtube',
    checkpoints,
    onComplete,
    poster
}: VideoWithCheckpointsProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeCheckpoint, setActiveCheckpoint] = useState<Checkpoint | null>(null);
    const [completedCheckpoints, setCompletedCheckpoints] = useState<number[]>([]); // Store checkpoint times
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    const playerRef = useRef<any>(null); // YT Player or HTMLVideoElement
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize YouTube API
    useEffect(() => {
        if (videoType !== 'youtube') return;

        // Function to init player
        const init = () => {
            // Extract ID from URL if needed
            let videoId = videoUrl;
            if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                try {
                    const url = new URL(videoUrl);
                    if (url.hostname === 'youtu.be') {
                        videoId = url.pathname.slice(1);
                    } else {
                        videoId = url.searchParams.get('v') || videoId;
                    }
                } catch (e) {
                    // Fallback if URL parsing fails, assume it's already an ID
                }
            }

            // If player already exists, maybe destroy it first if ID changed?
            // For now assuming component unmounts before ID changes or we handle it in cleanup

            playerRef.current = new window.YT.Player('youtube-player', {
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
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        };

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                init();
            };
        } else {
            if (window.YT && window.YT.Player) {
                init();
            }
        }

        return () => {
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                playerRef.current.destroy();
                playerRef.current = null;
            }
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [videoUrl, videoType]);

    const onPlayerReady = (event: any) => {
        setIsPlayerReady(true);
        setDuration(event.target.getDuration());
    };

    const onPlayerStateChange = (event: any) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            startTracking();
        } else {
            setIsPlaying(false);
            stopTracking();
        }

        if (event.data === window.YT.PlayerState.ENDED) {
            if (onComplete) onComplete();
        }
    };

    const startTracking = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (!playerRef.current) return;

            let time = 0;
            if (videoType === 'youtube' && playerRef.current.getCurrentTime) {
                time = playerRef.current.getCurrentTime();
            } else if (videoType === 'native' && playerRef.current) {
                time = playerRef.current.currentTime;
            }

            setCurrentTime(time);
            checkCheckpoints(time);
        }, 500); // Check every 500ms
    };

    const stopTracking = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const checkCheckpoints = (time: number) => {
        // Find a checkpoint that is close to current time (within 1 second) and hasn't been completed
        const checkpoint = checkpoints.find(cp =>
            Math.abs(cp.time - time) < 1 &&
            !completedCheckpoints.includes(cp.time)
        );

        if (checkpoint) {
            pauseVideo();
            // Seek strictly to checkpoint time to ensure we don't drift past it visually?
            // Optional, but good for precision.
            if (videoType === 'youtube' && playerRef.current?.seekTo) {
               // playerRef.current.seekTo(checkpoint.time, true);
               // seeking might cause buffering or events loop, let's just pause.
            }
            setActiveCheckpoint(checkpoint);
        }
    };

    const pauseVideo = () => {
        if (videoType === 'youtube' && playerRef.current?.pauseVideo) {
            playerRef.current.pauseVideo();
        } else if (videoType === 'native' && playerRef.current) {
            playerRef.current.pause();
        }
        setIsPlaying(false);
        stopTracking();
    };

    const playVideo = () => {
        if (videoType === 'youtube' && playerRef.current?.playVideo) {
            playerRef.current.playVideo();
        } else if (videoType === 'native' && playerRef.current) {
            playerRef.current.play();
        }
        setIsPlaying(true);
    };

    const handleCheckpointComplete = () => {
        if (activeCheckpoint) {
            setCompletedCheckpoints(prev => [...prev, activeCheckpoint.time]);
            setActiveCheckpoint(null);
            playVideo();
        }
    };

    // Native Video Handlers
    const handleNativeTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const time = e.currentTarget.currentTime;
        setCurrentTime(time);
        checkCheckpoints(time);
    };

    const handleNativePlay = () => {
        setIsPlaying(true);
        // startTracking is redundant for native as we use onTimeUpdate,
        // but can be used for fallback polling if needed.
        // native onTimeUpdate fires frequently enough.
    };

    const handleNativePause = () => setIsPlaying(false);
    const handleNativeEnded = () => {
        setIsPlaying(false);
        if (onComplete) onComplete();
    };

    return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-white/10 group" ref={containerRef}>
            {videoType === 'youtube' ? (
                <div id="youtube-player" className="w-full h-full" />
            ) : (
                <video
                    ref={playerRef}
                    src={videoUrl}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                    poster={poster}
                    onTimeUpdate={handleNativeTimeUpdate}
                    onPlay={handleNativePlay}
                    onPause={handleNativePause}
                    onEnded={handleNativeEnded}
                    onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                />
            )}

            {/* Checkpoint Overlay */}
            {activeCheckpoint && (
                <div className="absolute inset-0 z-50 bg-nautical-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
                    <CheckpointQuestion
                        question={activeCheckpoint.question}
                        options={activeCheckpoint.options}
                        correctOptionIndex={activeCheckpoint.correctOptionIndex}
                        onCorrect={handleCheckpointComplete}
                    />
                </div>
            )}

            {!isPlayerReady && videoType === 'youtube' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-accent"></div>
                </div>
            )}
        </div>
    );
}
