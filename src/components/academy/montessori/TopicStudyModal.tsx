"use client";

import {
	BookOpen,
	Check,
	HelpCircle,
	Image as ImageIcon,
	X,
} from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useState } from "react";
import AccessibleModal from "@/components/shared/AccessibleModal";
import type { InteractionResult, MontessoriTopic } from "./types";

interface TopicStudyModalProps {
	isOpen: boolean;
	onClose: () => void;
	topic: MontessoriTopic | null;
	onRecordResult: (result: InteractionResult) => void;
}

const TopicStudyModal: React.FC<TopicStudyModalProps> = ({
	isOpen,
	onClose,
	topic,
	onRecordResult,
}) => {
	const [step, setStep] = useState<"study" | "feedback">("study");

	// Reset step when topic changes or modal opens
	useEffect(() => {
		if (isOpen) {
			setStep("study");
		}
	}, [isOpen, topic]);

	if (!topic) return null;

	const handleResult = (result: InteractionResult) => {
		onRecordResult(result);
		onClose();
	};

	return (
		<AccessibleModal
			isOpen={isOpen}
			onClose={onClose}
			title={topic.title}
			maxWidth="max-w-4xl"
		>
			<div className="space-y-8 animate-fade-in text-white">
				{/* Content Section */}
				<div className="grid md:grid-cols-2 gap-8 items-start">
					{/* Visual Content */}
					<div className="w-full aspect-video bg-white/5 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden relative group">
						{topic.imageUrl ? (
							// Determine if imageUrl is a full URL or a relative path or base64.
							// For now assuming valid src for Image or img tag.
							// Since some data might have emoji or text as placeholder, check type.
							topic.imageUrl.startsWith("http") ||
							topic.imageUrl.startsWith("/") ? (
								<Image
									src={topic.imageUrl}
									alt={topic.title}
									fill
									className="object-cover group-hover:scale-105 transition-transform duration-700"
								/>
							) : (
								<div className="text-6xl">{topic.imageUrl}</div>
							)
						) : (
							<div className="flex flex-col items-center gap-4 text-white/20">
								<ImageIcon size={48} />
								<span className="text-xs uppercase tracking-widest font-bold">
									Sin imagen visual
								</span>
							</div>
						)}

						<div className="absolute top-4 left-4 bg-nautical-deep/80 backdrop-blur px-3 py-1 rounded-full border border-white/10">
							<span className="text-[10px] uppercase tracking-widest font-black text-accent">
								{topic.category}
							</span>
						</div>
					</div>

					{/* Text Content */}
					<div className="space-y-6">
						<div>
							<h3 className="text-xl font-display italic text-white mb-4 flex items-center gap-2">
								<BookOpen className="w-5 h-5 text-accent" />
								Definición
							</h3>
							<p className="text-lg text-white/80 font-light leading-relaxed">
								{topic.description}
							</p>
						</div>

						{/* Additional Data (if any) */}
						<div className="p-6 bg-white/5 rounded-xl border border-white/10">
							<h4 className="text-xs uppercase tracking-widest font-black text-white/50 mb-4">
								Detalles Técnicos
							</h4>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="block text-white/40 text-[10px] uppercase tracking-wider mb-1">
										Dificultad
									</span>
									<div className="flex items-center gap-2">
										<div className="flex-1 h-1 bg-white/10 rounded-full max-w-[100px]">
											<div
												className="h-full bg-accent rounded-full"
												style={{ width: `${topic.difficulty * 100}%` }}
											/>
										</div>
										<span className="font-mono text-accent">
											{Math.round(topic.difficulty * 10)}/10
										</span>
									</div>
								</div>
								<div>
									<span className="block text-white/40 text-[10px] uppercase tracking-wider mb-1">
										Tipo
									</span>
									<span className="text-white capitalize">{topic.type}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Feedback Section */}
				<div className="pt-8 border-t border-white/10 flex flex-col items-center justify-center gap-6">
					{step === "study" ? (
						<button
							onClick={() => setStep("feedback")}
							className="group relative px-8 py-4 bg-white text-nautical-black font-black uppercase tracking-[0.2em] text-xs rounded-sm hover:bg-accent transition-all duration-300"
						>
							<span className="relative z-10 flex items-center gap-2">
								<HelpCircle className="w-4 h-4" />
								Evaluar mi conocimiento
							</span>
						</button>
					) : (
						<div className="animate-fade-in text-center space-y-6 w-full max-w-lg">
							<h3 className="text-lg font-display italic text-white">
								¿Conocías este concepto?
							</h3>
							<div className="grid grid-cols-2 gap-4">
								<button
									onClick={() => handleResult("success")}
									className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 hover:scale-[1.02] transition-all group flex flex-col items-center gap-3"
								>
									<div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-nautical-black transition-colors">
										<Check size={24} />
									</div>
									<span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">
										Sí, lo domino
									</span>
								</button>

								<button
									onClick={() => handleResult("failure")}
									className="p-6 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:scale-[1.02] transition-all group flex flex-col items-center gap-3"
								>
									<div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
										<X size={24} />
									</div>
									<span className="text-red-400 font-bold uppercase tracking-wider text-xs">
										No, necesito repaso
									</span>
								</button>
							</div>
							<p className="text-white/30 text-[10px] uppercase tracking-widest">
								Tu respuesta ajustará tu ruta de aprendizaje
							</p>
						</div>
					)}
				</div>
			</div>
		</AccessibleModal>
	);
};

export default TopicStudyModal;
