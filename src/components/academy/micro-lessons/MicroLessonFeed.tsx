"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { microLessons } from "@/data/academy/micro-lessons";
import MicroLessonPlayer from "./MicroLessonPlayer";

interface MicroLessonFeedProps {
	isOpen: boolean;
	initialLessonId?: string;
	onClose: () => void;
}

export default function MicroLessonFeed({
	isOpen,
	initialLessonId,
	onClose,
}: MicroLessonFeedProps) {
	const [mounted, setMounted] = useState(false);
	const [activeLessonId, setActiveLessonId] = useState<string | null>(
		initialLessonId || null,
	);
	const [isMuted, setIsMuted] = useState(true); // Default to muted for autoplay policy
	const containerRef = useRef<HTMLDivElement>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	// Scroll to initial
	useEffect(() => {
		if (isOpen && initialLessonId && containerRef.current) {
			// Small timeout to ensure render
			setTimeout(() => {
				const el = containerRef.current?.querySelector(
					`[data-id="${initialLessonId}"]`,
				);
				if (el) {
					el.scrollIntoView({ behavior: "auto" });
					setActiveLessonId(initialLessonId);
				}
			}, 50);
		} else if (isOpen && !activeLessonId && microLessons.length > 0) {
			setActiveLessonId(microLessons[0].id);
		}
	}, [isOpen, initialLessonId]);

	// Intersection Observer
	useEffect(() => {
		if (!isOpen || !containerRef.current) return;

		// Disconnect previous
		if (observerRef.current) observerRef.current.disconnect();

		observerRef.current = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const id = entry.target.getAttribute("data-id");
						if (id) setActiveLessonId(id);
					}
				});
			},
			{ threshold: 0.6 },
		);

		const elements = containerRef.current.querySelectorAll("[data-id]");
		elements.forEach((el) => observerRef.current?.observe(el));

		return () => {
			if (observerRef.current) observerRef.current.disconnect();
		};
	}, [isOpen, mounted, microLessons]); // Re-run when mounted/open

	if (!mounted) return null;

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0, y: "100%" }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: "100%" }}
					transition={{ type: "spring", damping: 25, stiffness: 200 }}
					className="fixed inset-0 z-[100] bg-black"
				>
					<button
						onClick={onClose}
						className="absolute top-4 left-4 z-50 p-3 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors"
					>
						<X size={24} />
					</button>

					<div
						ref={containerRef}
						className="h-full w-full overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden"
						style={
							{
								scrollBehavior: "smooth",
								scrollbarWidth: "none",
								msOverflowStyle: "none",
							} as React.CSSProperties
						}
					>
						{microLessons.map((lesson) => (
							<div
								key={lesson.id}
								data-id={lesson.id}
								className="h-full w-full snap-center"
							>
								<MicroLessonPlayer
									lesson={lesson}
									isActive={activeLessonId === lesson.id}
									isMuted={isMuted}
									onToggleMute={() => setIsMuted(!isMuted)}
								/>
							</div>
						))}
					</div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	);
}
