'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MicroLesson } from '@/data/academy/micro-lessons';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Play } from 'lucide-react';

interface MicroLessonPlayerProps {
    lesson: MicroLesson;
    isActive: boolean;
    isMuted: boolean;
    onToggleMute: () => void;
}

export default function MicroLessonPlayer({
    lesson,
    isActive,
    isMuted,
    onToggleMute
}: MicroLessonPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isActive) {
            // Reset to start if coming into view
            if (videoRef.current) {
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsPlaying(true);
                        })
                        .catch((error) => {
                            console.log("Autoplay prevented:", error);
                            setIsPlaying(false);
                        });
                }
            }
        } else {
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
            setIsPlaying(false);
        }
    }, [isActive]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current && videoRef.current.duration) {
            const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(progress);
        }
    };

    return (
        <div className="relative w-full h-full bg-black snap-center flex-shrink-0 overflow-hidden">
            <video
                ref={videoRef}
                src={lesson.videoUrl}
                className="absolute inset-0 w-full h-full object-cover"
                loop
                playsInline
                muted={isMuted}
                onClick={handlePlayPause}
                onTimeUpdate={handleTimeUpdate}
            />

            {/* Play/Pause Overlay Indicator */}
            {!isPlaying && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 z-10">
                    <Play className="w-16 h-16 text-white/80 fill-white/80 opacity-50" />
                 </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

            {/* Content Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 flex flex-col gap-2 z-20 pointer-events-auto">
                <div className="flex items-center gap-2 mb-1">
                    <span className="bg-accent/20 text-accent text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider backdrop-blur-sm border border-accent/20">
                        {lesson.category}
                    </span>
                    <span className="text-white/60 text-xs flex items-center gap-1 font-mono">
                        {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                    </span>
                </div>

                <h3 className="text-white font-display text-xl leading-tight drop-shadow-md">
                    {lesson.title}
                </h3>

                <p className="text-white/80 text-sm line-clamp-2 drop-shadow-sm max-w-[85%] font-light leading-relaxed">
                    {lesson.description}
                </p>
            </div>

            {/* Right Side Actions */}
            <div className="absolute bottom-24 right-4 flex flex-col items-center gap-6 z-30">
                <button className="flex flex-col items-center gap-1 group">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-full group-hover:bg-white/20 transition-all border border-white/10 shadow-lg">
                        <Heart className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] font-medium text-white drop-shadow">{lesson.likes}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-full group-hover:bg-white/20 transition-all border border-white/10 shadow-lg">
                        <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] font-medium text-white drop-shadow">Chat</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-full group-hover:bg-white/20 transition-all border border-white/10 shadow-lg">
                        <Share2 className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] font-medium text-white drop-shadow">Share</span>
                </button>
            </div>

            {/* Top Mute Control */}
            <button
                onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
                className="absolute top-20 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors z-30"
            >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
                <div
                    className="h-full bg-accent transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
