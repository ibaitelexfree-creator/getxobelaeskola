"use client";

import React, { useEffect, useState } from "react";
import { getPendingReviews, submitReview } from "@/actions/peer-review";
import RubricForm, { type RubricCriterion } from "./RubricForm";
import SubmissionViewer from "./SubmissionViewer";

interface PeerReviewDashboardProps {
	moduleId: string;
	locale: string;
}

interface ReviewTask {
	id: string;
	submittedAt: string;
	content: any;
	activityTitleEs: string;
	activityTitleEu: string;
	rubric: any;
}

const UI_TEXT = {
	es: {
		loading: "Cargando revisiones...",
		noReviewsTitle: "No hay revisiones pendientes",
		noReviewsDesc:
			"¡Buen trabajo! Vuelve más tarde para ayudar a otros compañeros y ganar XP.",
		backToList: "Volver a la lista",
		feedbackLabel: "Feedback para el compañero",
		feedbackPlaceholder: "Escribe comentarios constructivos...",
		finalScore: "Nota Final",
		submitButton: "Enviar Revisión (+50 XP)",
		submitting: "Enviando...",
		successAlert: "Revisión enviada. ¡Has ganado 50 XP!",
		errorAlert: "Error: ",
		dashboardTitle: "Revisiones de Pares",
		dashboardSubtitle: "Gana XP revisando",
		cardDesc: "Ayuda a un compañero revisando este ejercicio y gana",
		reviewAction: "Revisar",
		defaultRubricLabel: "Valoración General",
		defaultRubricDesc: "Evalúa la calidad general del trabajo.",
	},
	eu: {
		loading: "Berrikuspenak kargatzen...",
		noReviewsTitle: "Ez dago berrikuspenik zain",
		noReviewsDesc:
			"Lan bikaina! Itzuli geroago beste ikaskideei laguntzeko eta XP irabazteko.",
		backToList: "Itzuli zerrendara",
		feedbackLabel: "Ikaskidearentzako feedbacka",
		feedbackPlaceholder: "Idatzi iruzkin eraikitzaileak...",
		finalScore: "Azken Nota",
		submitButton: "Bidali Berrikuspena (+50 XP)",
		submitting: "Bidaltzen...",
		successAlert: "Berrikuspena bidalita. 50 XP irabazi dituzu!",
		errorAlert: "Errorea: ",
		dashboardTitle: "Berdinen Arteko Berrikuspenak",
		dashboardSubtitle: "Irabazi XP berrikusiz",
		cardDesc: "Lagundu ikaskide bati ariketa hau berrikusiz eta irabazi",
		reviewAction: "Berrikusi",
		defaultRubricLabel: "Balorazio Orokorra",
		defaultRubricDesc: "Ebaluatu lanaren kalitate orokorra.",
	},
	en: {
		loading: "Loading reviews...",
		noReviewsTitle: "No pending reviews",
		noReviewsDesc: "Good job! Come back later to help others and earn XP.",
		backToList: "Back to list",
		feedbackLabel: "Feedback for your peer",
		feedbackPlaceholder: "Write constructive comments...",
		finalScore: "Final Score",
		submitButton: "Submit Review (+50 XP)",
		submitting: "Sending...",
		successAlert: "Review submitted. You earned 50 XP!",
		errorAlert: "Error: ",
		dashboardTitle: "Peer Reviews",
		dashboardSubtitle: "Earn XP by reviewing",
		cardDesc: "Help a peer by reviewing this exercise and earn",
		reviewAction: "Review",
		defaultRubricLabel: "General Assessment",
		defaultRubricDesc: "Evaluate the overall quality of the work.",
	},
	fr: {
		loading: "Chargement des avis...",
		noReviewsTitle: "Aucune revue en attente",
		noReviewsDesc:
			"Bon travail! Revenez plus tard pour aider les autres et gagner des XP.",
		backToList: "Retour à la liste",
		feedbackLabel: "Commentaires pour votre pair",
		feedbackPlaceholder: "Écrivez des commentaires constructifs...",
		finalScore: "Note Finale",
		submitButton: "Soumettre la revue (+50 XP)",
		submitting: "Envoi...",
		successAlert: "Revue soumise. Vous avez gagné 50 XP!",
		errorAlert: "Erreur: ",
		dashboardTitle: "Revues par les pairs",
		dashboardSubtitle: "Gagnez des XP en révisant",
		cardDesc: "Aidez un pair en révisant cet exercice et gagnez",
		reviewAction: "Réviser",
		defaultRubricLabel: "Évaluation Générale",
		defaultRubricDesc: "Évaluer la qualité globale du travail.",
	},
};

export default function PeerReviewDashboard({
	moduleId,
	locale,
}: PeerReviewDashboardProps) {
	const t = (UI_TEXT as any)[locale] || UI_TEXT.es;

	const [tasks, setTasks] = useState<ReviewTask[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedTask, setSelectedTask] = useState<ReviewTask | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [feedback, setFeedback] = useState("");
	const [scores, setScores] = useState<Record<string, number>>({});
	const [totalScore, setTotalScore] = useState(0);

	useEffect(() => {
		loadTasks();
	}, [moduleId]);

	async function loadTasks() {
		setLoading(true);
		const res = await getPendingReviews(moduleId);
		if (res.reviews) {
			setTasks(res.reviews);
		} else {
			console.error(res.error);
		}
		setLoading(false);
	}

	const handleSubmit = async () => {
		if (!selectedTask) return;
		setSubmitting(true);

		const res = await submitReview({
			intentoId: selectedTask.id,
			puntuacion: totalScore,
			rubricaValores: scores,
			feedback,
			moduleId,
		});

		if (res.success) {
			setTasks(tasks.filter((t) => t.id !== selectedTask.id));
			setSelectedTask(null);
			setFeedback("");
			setScores({});
			setTotalScore(0);
			alert(t.successAlert);
		} else {
			alert(t.errorAlert + res.error);
		}
		setSubmitting(false);
	};

	if (loading)
		return (
			<div className="text-white/60 animate-pulse text-center py-8">
				{t.loading}
			</div>
		);

	if (tasks.length === 0) {
		return (
			<div className="bg-white/5 border border-white/10 p-8 rounded-lg text-center max-w-2xl mx-auto">
				<div className="text-4xl mb-4">🤝</div>
				<h3 className="text-xl font-display italic text-white mb-2">
					{t.noReviewsTitle}
				</h3>
				<p className="text-white/60">{t.noReviewsDesc}</p>
			</div>
		);
	}

	if (selectedTask) {
		const rawRubric = selectedTask.rubric;
		const criteriaList = Array.isArray(rawRubric)
			? rawRubric
			: rawRubric?.criterios || [];

		const rubricData: RubricCriterion[] =
			criteriaList.length > 0
				? criteriaList.map((r: any) => ({
						id: r.id || r.label,
						label:
							locale === "eu" ? r.label_eu || r.label : r.label_es || r.label,
						maxPoints: r.maxPoints || r.max_puntos || 10,
						description: locale === "eu" ? r.description_eu : r.description_es,
					}))
				: [
						{
							id: "general",
							label: t.defaultRubricLabel,
							maxPoints: 100,
							description: t.defaultRubricDesc,
						},
					];

		return (
			<div className="bg-nautical-black/50 p-6 rounded-xl border border-accent/20 animate-fade-in">
				<button
					onClick={() => setSelectedTask(null)}
					className="mb-6 text-sm text-white/60 hover:text-white flex items-center gap-2 transition-colors"
				>
					<span>←</span> {t.backToList}
				</button>

				<SubmissionViewer
					content={selectedTask.content}
					activityTitle={
						locale === "eu"
							? selectedTask.activityTitleEu
							: selectedTask.activityTitleEs
					}
				/>

				<div className="bg-white/5 border border-white/10 rounded-lg p-6">
					<RubricForm
						rubric={rubricData}
						onChange={(s, t) => {
							setScores(s);
							setTotalScore(t);
						}}
					/>

					<div className="mt-6">
						<label className="block text-white font-bold mb-2">
							{t.feedbackLabel}
						</label>
						<textarea
							value={feedback}
							onChange={(e) => setFeedback(e.target.value)}
							className="w-full bg-black/30 border border-white/20 rounded p-4 text-white focus:border-accent outline-none min-h-[100px]"
							placeholder={t.feedbackPlaceholder}
						/>
					</div>

					<div className="mt-8 flex justify-end items-center gap-4">
						<div className="text-right">
							<span className="text-sm text-white/60 block uppercase tracking-widest">
								{t.finalScore}
							</span>
							<span className="text-3xl font-display italic text-accent">
								{totalScore} / 100
							</span>
						</div>
						<button
							onClick={handleSubmit}
							disabled={submitting}
							className="bg-accent text-nautical-black font-black uppercase tracking-widest py-3 px-8 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
						>
							{submitting ? t.submitting : t.submitButton}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<header className="flex justify-between items-end border-b border-white/10 pb-6 mb-10">
				<h2 className="text-3xl font-display italic text-white">
					{t.dashboardTitle}
				</h2>
				<div className="text-[10px] tracking-widest text-accent font-black uppercase">
					{t.dashboardSubtitle}
				</div>
			</header>

			<div className="grid gap-4">
				{tasks.map((task) => (
					<div
						key={task.id}
						onClick={() => setSelectedTask(task)}
						className="bg-white/5 border border-white/10 p-6 rounded-lg hover:border-accent/50 hover:bg-white/10 cursor-pointer transition-all group relative overflow-hidden"
					>
						<div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 text-6xl rotate-12 transition-opacity">
							📝
						</div>
						<div className="flex justify-between items-center relative z-10">
							<div>
								<h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
									{locale === "eu"
										? task.activityTitleEu
										: task.activityTitleEs}
								</h3>
								<p className="text-sm text-white/60 mt-2 max-w-md">
									{t.cardDesc}{" "}
									<span className="text-accent font-bold">50 XP</span>.
								</p>
							</div>
							<div className="text-right">
								<span className="text-xs font-mono text-white/50 block">
									{new Date(task.submittedAt).toLocaleDateString()}
								</span>
								<span className="mt-2 inline-block px-3 py-1 border border-accent/30 text-accent text-[10px] uppercase tracking-widest rounded-full group-hover:bg-accent group-hover:text-black transition-all">
									{t.reviewAction}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
