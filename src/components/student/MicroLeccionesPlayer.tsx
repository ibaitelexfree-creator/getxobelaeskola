"use client";

import {
	ChevronDown,
	ChevronUp,
	Play,
	Volume2,
	VolumeX,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { MicroLeccion } from "./MicroLeccionesWidget";

interface MicroLeccionesPlayerProps {
	lessons: MicroLeccion[];
	initialIndex: number;
	onClose: () => void;
	locale: string;
}

export default function MicroLeccionesPlayer({
	lessons,
	initialIndex,
	onClose,
	locale,
}: MicroLeccionesPlayerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [activeIndex, setActiveIndex] = useState(initialIndex);
	const [isPlaying, setIsPlaying] = useState(true);
	const [isMuted, setIsMuted] = useState(false);
	const [progress, setProgress] = useState(0);
	const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

	useEffect(() => {
		// Scroll to initial index on mount
		if (containerRef.current) {
			const el = containerRef.current.children[initialIndex] as HTMLElement;
			if (el) {
				el.scrollIntoView({ behavior: "auto" });
			}
		}
	}, [initialIndex]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const index = Number(entry.target.getAttribute("data-index"));
						setActiveIndex(index);
						setProgress(0); // Reset progress on slide change
						setIsPlaying(true); // Auto play next
					}
				});
			},
			{
				threshold: 0.6, // 60% visibility triggers change
			},
		);

		const container = containerRef.current;
		if (container) {
			Array.from(container.children).forEach((child) =>
				observer.observe(child),
			);
		}

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		// Handle playback based on active index
		videoRefs.current.forEach((video, index) => {
			if (!video) return;

			if (index === activeIndex) {
				if (isPlaying) {
					video.play().catch((e) => console.log("Autoplay prevented:", e));
				} else {
					video.pause();
				}
			} else {
				video.pause();
				video.currentTime = 0; // Reset others
			}
		});
	}, [activeIndex, isPlaying]);

	const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
		const video = e.currentTarget;
		if (video.duration) {
			setProgress((video.currentTime / video.duration) * 100);
		}
	};

	const togglePlay = () => setIsPlaying(!isPlaying);
	const toggleMute = () => setIsMuted(!isMuted);

	return (
		<div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center backdrop-blur-3xl">
			<button
				onClick={onClose}
				className="absolute top-4 right-4 z-50 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
			>
				<X size={24} />
			</button>

			<div
				ref={containerRef}
				className="w-full h-full md:w-[400px] md:h-[85vh] md:max-h-[900px] md:rounded-2xl overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black relative shadow-2xl border-none md:border md:border-white/10"
				style={{ scrollBehavior: "smooth" }}
			>
				{lessons.map((lesson, index) => (
					<div
						key={lesson.id}
						data-index={index}
						className="w-full h-full snap-start relative flex items-center justify-center bg-nautical-black overflow-hidden"
					>
						<video
							ref={(el) => {
								videoRefs.current[index] = el;
							}}
							src={lesson.video_url}
							poster={lesson.thumbnail_url}
							className="w-full h-full object-cover"
							loop
							playsInline
							muted={isMuted}
							onClick={togglePlay}
							onTimeUpdate={handleTimeUpdate}
						/>

						{/* Overlay Controls */}
						<div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

						{/* Play/Pause Indicator (briefly shown) */}
						{!isPlaying && activeIndex === index && (
							<div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30 z-10">
								<div className="p-4 bg-black/40 rounded-full backdrop-blur-sm">
									<Play size={48} className="text-white fill-white" />
								</div>
							</div>
						)}

						{/* Info & Controls */}
						<div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-4 pointer-events-auto z-20">
							<div className="flex justify-between items-end">
								<div className="flex-1 mr-4">
									<h3 className="text-xl font-bold text-white mb-2 leading-tight drop-shadow-md">
										{locale === "es" ? lesson.titulo_es : lesson.titulo_eu}
									</h3>
									<p className="text-sm text-white/90 line-clamp-2 drop-shadow-sm font-medium">
										{locale === "es"
											? lesson.descripcion_es
											: lesson.descripcion_eu}
									</p>
								</div>
								<div className="flex flex-col gap-4">
									<button
										onClick={toggleMute}
										className="p-2 bg-white/10 rounded-full backdrop-blur-md text-white hover:bg-white/20"
									>
										{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
									</button>
								</div>
							</div>

							{/* Progress Bar */}
							<div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
								<div
									className="h-full bg-accent transition-all duration-100 ease-linear"
									style={{ width: `${activeIndex === index ? progress : 0}%` }}
								/>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Desktop Navigation Hints */}
			<div className="hidden md:flex flex-col gap-4 absolute right-10 top-1/2 -translate-y-1/2 text-white/20">
				<ChevronUp size={32} />
				<span className="text-[10px] uppercase tracking-widest rotate-90 origin-center translate-y-2">
					Scroll
				</span>
				<ChevronDown size={32} />
			</div>
		</div>
	);
}
