"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import QuizView from "@/components/academy/evaluation/QuizView";
import {
	type DetailedResult,
	type EvaluationResult,
	Question,
} from "@/components/academy/evaluation/types";
import { ExamQuestion, perExamQuestions } from "./data";

// ----------------------------------------------------------------------
// TYPES & HELPERS
// ----------------------------------------------------------------------

type ExamStatus = "intro" | "active" | "finished";

interface BlockScore {
	category: string;
	correct: number;
	total: number;
	percentage: number;
}

// ----------------------------------------------------------------------
// INTRO VIEW
// ----------------------------------------------------------------------

const IntroView = ({ onStart }: { onStart: () => void }) => (
	<div className="min-h-screen bg-nautical-black flex items-center justify-center p-6 relative overflow-hidden">
		{/* Background Image */}
		<div className="absolute inset-0 z-0 opacity-40">
			<Image
				src="https://images.unsplash.com/photo-1500930248553-7071bd63a72f?q=80&w=2070&auto=format&fit=crop"
				alt="Mar abierto"
				fill
				className="object-cover"
				priority
			/>
			<div className="absolute inset-0 bg-gradient-to-t from-nautical-black via-nautical-black/80 to-transparent" />
		</div>

		<div className="max-w-3xl w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center relative z-10 shadow-2xl animate-in zoom-in-95 duration-500">
			<div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
				<span className="text-5xl">⚓</span>
			</div>

			<h1 className="text-5xl md:text-6xl font-display italic text-white mb-6">
				Examen <span className="text-blue-500">PER</span>
			</h1>

			<p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
				Simulacro oficial del examen de{" "}
				<strong className="text-white">
					Patrón de Embarcaciones de Recreo
				</strong>
				. Pon a prueba tus conocimientos con el temario completo de la DGMM.
			</p>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
				<div className="p-4 rounded-2xl bg-white/5 border border-white/10">
					<div className="text-3xl mb-2">⏱️</div>
					<div className="font-bold text-white text-lg">90 Minutos</div>
					<div className="text-sm text-slate-400">Tiempo límite</div>
				</div>
				<div className="p-4 rounded-2xl bg-white/5 border border-white/10">
					<div className="text-3xl mb-2">📝</div>
					<div className="font-bold text-white text-lg">60 Preguntas</div>
					<div className="text-sm text-slate-400">Test multirespuesta</div>
				</div>
				<div className="p-4 rounded-2xl bg-white/5 border border-white/10">
					<div className="text-3xl mb-2">📊</div>
					<div className="font-bold text-white text-lg">Por Bloques</div>
					<div className="text-sm text-slate-400">Análisis temático</div>
				</div>
			</div>

			<button
				onClick={onStart}
				className="w-full md:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
			>
				Comenzar Examen
			</button>
		</div>
	</div>
);

// ----------------------------------------------------------------------
// RESULT VIEW (CUSTOM)
// ----------------------------------------------------------------------

const PerResultScreen = ({
	result,
	blockScores,
	onRetry,
}: {
	result: EvaluationResult;
	blockScores: BlockScore[];
	onRetry: () => void;
}) => {
	const isPassing = result.passed;
	const [showDetails, setShowDetails] = useState(false);

	return (
		<div className="min-h-screen bg-nautical-black py-20 px-6">
			<div className="max-w-5xl mx-auto space-y-8">
				{/* Header Card */}
				<div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center relative overflow-hidden">
					<div
						className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 blur-[120px] pointer-events-none opacity-20 ${isPassing ? "bg-green-500" : "bg-red-500"}`}
					/>

					<div className="relative z-10">
						<div
							className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 text-6xl shadow-2xl ${
								isPassing
									? "bg-green-500/20 text-green-400 ring-1 ring-green-500/50"
									: "bg-red-500/20 text-red-400 ring-1 ring-red-500/50"
							}`}
						>
							{isPassing ? "🏆" : "⚠️"}
						</div>

						<h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
							{isPassing ? "¡Aprobado!" : "No Apto"}
						</h2>

						<div className="flex items-baseline justify-center gap-2 mb-8">
							<span
								className={`text-7xl font-black tracking-tighter ${isPassing ? "text-green-400" : "text-red-400"}`}
							>
								{Math.round(result.score)}
							</span>
							<span className="text-2xl text-slate-500 font-medium">/ 100</span>
						</div>

						<p className="text-lg text-slate-300 max-w-2xl mx-auto">
							{result.feedback}
						</p>
					</div>
				</div>

				{/* Block Breakdown */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{blockScores.map((block) => (
						<div
							key={block.category}
							className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col gap-4"
						>
							<div className="flex justify-between items-start">
								<h3 className="font-bold text-white text-sm uppercase tracking-wide h-10 flex items-center">
									{block.category}
								</h3>
								<div
									className={`px-2 py-1 rounded text-xs font-bold ${
										block.percentage >= 70
											? "bg-green-500/20 text-green-400"
											: block.percentage >= 50
												? "bg-yellow-500/20 text-yellow-400"
												: "bg-red-500/20 text-red-400"
									}`}
								>
									{Math.round(block.percentage)}%
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex justify-between text-xs text-slate-400">
									<span>Aciertos</span>
									<span className="text-white font-mono">
										{block.correct} / {block.total}
									</span>
								</div>
								<div className="h-2 bg-white/5 rounded-full overflow-hidden">
									<div
										className={`h-full rounded-full transition-all duration-1000 ${
											block.percentage >= 70
												? "bg-green-500"
												: block.percentage >= 50
													? "bg-yellow-500"
													: "bg-red-500"
										}`}
										style={{ width: `${block.percentage}%` }}
									/>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Details Toggle */}
				<div className="text-center pt-8">
					<button
						onClick={() => setShowDetails(!showDetails)}
						className="text-sm uppercase tracking-widest font-bold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2"
					>
						{showDetails ? "Ocultar Respuestas" : "Ver Revisión Detallada"}
						<svg
							className={`w-4 h-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
				</div>

				{/* Detailed Review */}
				{showDetails && result.details && (
					<div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
						{result.details.map((detail, idx) => (
							<div
								key={idx}
								className={`p-6 rounded-2xl border ${
									detail.isCorrect
										? "bg-green-500/5 border-green-500/20"
										: "bg-red-500/5 border-red-500/20"
								}`}
							>
								<div className="flex gap-4">
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
											detail.isCorrect
												? "bg-green-500/20 text-green-400"
												: "bg-red-500/20 text-red-400"
										}`}
									>
										{idx + 1}
									</div>
									<div className="flex-1 space-y-3">
										<p className="font-medium text-white text-lg">
											{detail.enunciado_es}
										</p>

										<div className="grid md:grid-cols-2 gap-4 text-sm">
											<div className="space-y-1">
												<span className="text-slate-500 uppercase text-xs font-bold">
													Tu Respuesta
												</span>
												<div
													className={`p-3 rounded-lg border ${
														detail.isCorrect
															? "bg-green-500/10 border-green-500/30 text-green-300"
															: "bg-red-500/10 border-red-500/30 text-red-300"
													}`}
												>
													{detail.userAnswer || "Sin responder"}
												</div>
											</div>
											{!detail.isCorrect && (
												<div className="space-y-1">
													<span className="text-slate-500 uppercase text-xs font-bold">
														Respuesta Correcta
													</span>
													<div className="p-3 rounded-lg border border-green-500/30 bg-green-500/5 text-green-300">
														{detail.correctAnswer}
													</div>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Actions */}
				<div className="flex justify-center gap-4 pt-8 pb-20">
					<button
						onClick={onRetry}
						className="px-8 py-4 bg-white text-nautical-black rounded-xl font-bold uppercase tracking-widest hover:bg-slate-200 transition-all shadow-lg active:scale-95"
					>
						Intentar de Nuevo
					</button>
					<Link
						href="/academy/dashboard" // Adjust if needed
						className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
					>
						Salir
					</Link>
				</div>
			</div>
		</div>
	);
};

// ----------------------------------------------------------------------
// MAIN PAGE COMPONENT
// ----------------------------------------------------------------------

export default function SkillsPage() {
	const [status, setStatus] = useState<ExamStatus>("intro");
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [timeLeft, setTimeLeft] = useState(5400); // 90 mins
	const [result, setResult] = useState<EvaluationResult | null>(null);
	const [blockScores, setBlockScores] = useState<BlockScore[]>([]);

	// Timer logic
	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (status === "active" && timeLeft > 0) {
			timer = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						clearInterval(timer);
						handleSubmit(); // Auto-submit
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}
		return () => clearInterval(timer);
	}, [status, timeLeft]);

	const handleStart = () => {
		setStatus("active");
		setTimeLeft(5400);
		setAnswers({});
		setCurrentQuestionIndex(0);
		setResult(null);
	};

	const handleAnswer = (answerId: string) => {
		const currentQ = perExamQuestions[currentQuestionIndex];
		setAnswers((prev) => ({
			...prev,
			[currentQ.id]: answerId,
		}));
	};

	const handleSubmit = () => {
		// Calculate Score
		let correctCount = 0;
		const totalQuestions = perExamQuestions.length;
		const details: DetailedResult[] = [];
		const blocks: Record<string, { correct: number; total: number }> = {};

		perExamQuestions.forEach((q) => {
			const userAnswerId = answers[q.id];
			const isCorrect = userAnswerId === q.correctAnswer;

			if (isCorrect) correctCount++;

			// Block Score
			if (!blocks[q.category]) blocks[q.category] = { correct: 0, total: 0 };
			blocks[q.category].total++;
			if (isCorrect) blocks[q.category].correct++;

			// Detailed Result
			// Find option text for user answer
			const userOption = q.opciones_json?.find(
				(opt) => opt.id === userAnswerId,
			);
			const correctOption = q.opciones_json?.find(
				(opt) => opt.id === q.correctAnswer,
			);

			details.push({
				questionId: q.id,
				enunciado_es: q.enunciado_es,
				userAnswer: userOption ? userOption.texto : "Sin responder",
				correctAnswer: correctOption ? correctOption.texto : "Error en datos",
				isCorrect,
			});
		});

		const score = (correctCount / totalQuestions) * 100;
		const passed = score >= 70; // 70% to pass (approx < 18 errors out of 60)

		// Format Blocks
		const blockScoresArray: BlockScore[] = Object.keys(blocks).map((cat) => ({
			category: cat,
			correct: blocks[cat].correct,
			total: blocks[cat].total,
			percentage: (blocks[cat].correct / blocks[cat].total) * 100,
		}));

		setResult({
			passed,
			score,
			pointsObtained: correctCount,
			pointsTotal: totalQuestions,
			feedback: passed
				? "¡Enhorabuena! Has demostrado un conocimiento sólido del temario. Estás listo para navegar."
				: "Aún necesitas repasar algunos conceptos clave. Revisa los bloques con menor puntuación.",
			details,
		});
		setBlockScores(blockScoresArray);
		setStatus("finished");
	};

	if (status === "intro") {
		return <IntroView onStart={handleStart} />;
	}

	if (status === "finished" && result) {
		return (
			<PerResultScreen
				result={result}
				blockScores={blockScores}
				onRetry={handleStart}
			/>
		);
	}

	const currentQuestion = perExamQuestions[currentQuestionIndex];

	return (
		<div className="min-h-screen bg-nautical-black">
			<div className="pt-20 px-6">
				{" "}
				{/* Padding for header */}
				<QuizView
					question={currentQuestion}
					allQuestionIds={perExamQuestions.map((q) => q.id)}
					currentQuestionIndex={currentQuestionIndex}
					totalQuestions={perExamQuestions.length}
					onAnswer={handleAnswer}
					isSubmitting={false}
					timeLeft={timeLeft}
					durationSecs={5400}
					answers={answers}
					onNavigate={setCurrentQuestionIndex}
					onSubmit={handleSubmit}
					lastSaved={null}
					variant="nautical"
				/>
			</div>
		</div>
	);
}
