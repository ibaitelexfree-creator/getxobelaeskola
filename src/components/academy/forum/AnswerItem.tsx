"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import React from "react";
import VoteControl from "./VoteControl";

interface AnswerItemProps {
	answer: any;
	isStaff: boolean;
	onMarkCorrect: (id: string) => void;
}

export default function AnswerItem({
	answer,
	isStaff,
	onMarkCorrect,
}: AnswerItemProps) {
	return (
		<div
			className={`p-4 md:p-6 rounded-lg mb-4 border transition-all duration-300 ${answer.es_correcta ? "border-accent/40 bg-accent/[0.05]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"}`}
		>
			<div className="flex gap-4 md:gap-6">
				<div className="pt-2">
					<VoteControl
						itemId={answer.id}
						itemType="respuesta"
						initialVotes={answer.votos}
						initialUserVote={null}
					/>
				</div>
				<div className="flex-1 min-w-0">
					<header className="flex justify-between items-start mb-3 gap-4">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
								{answer.profiles?.avatar_url ? (
									<img
										src={answer.profiles.avatar_url}
										alt=""
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/40">
										{answer.profiles?.nombre?.[0] || "?"}
									</div>
								)}
							</div>
							<div className="flex flex-col">
								<span className="text-sm font-bold text-white/90 truncate">
									{answer.profiles?.nombre || "Usuario"}{" "}
									{answer.profiles?.apellidos || ""}
								</span>
								<span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
									{formatDistanceToNow(new Date(answer.created_at), {
										addSuffix: true,
										locale: es,
									})}
								</span>
							</div>
						</div>
						{answer.es_correcta && (
							<span className="bg-accent/20 text-accent text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest border border-accent/20">
								Solución Correcta
							</span>
						)}
					</header>

					<div className="text-white/80 prose prose-invert prose-sm max-w-none mb-4 font-light leading-relaxed">
						<p className="whitespace-pre-wrap">{answer.contenido}</p>
					</div>

					{isStaff && !answer.es_correcta && (
						<button
							onClick={() => onMarkCorrect(answer.id)}
							className="text-[10px] text-white/40 hover:text-accent transition-colors uppercase tracking-widest font-black flex items-center gap-2 group"
						>
							<span className="w-4 h-4 rounded-full border border-white/20 group-hover:border-accent flex items-center justify-center text-transparent group-hover:text-accent transition-all">
								✓
							</span>
							Marcar como correcta
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
