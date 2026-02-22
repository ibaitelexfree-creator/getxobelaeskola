import React from "react";
import QuestionItem from "./QuestionItem";

interface QuestionListProps {
	questions: any[];
	onSelectQuestion: (question: any) => void;
}

export default function QuestionList({
	questions,
	onSelectQuestion,
}: QuestionListProps) {
	if (questions.length === 0) {
		return (
			<div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
				<div className="text-4xl mb-4 opacity-50">⚓</div>
				<p className="text-white/40 italic font-light">
					No hay preguntas en este módulo aún.
					<br />
					¡Sé el primero en lanzar una pregunta al mar!
				</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4">
			{questions.map((question) => (
				<QuestionItem
					key={question.id}
					question={question}
					onClick={() => onSelectQuestion(question)}
				/>
			))}
		</div>
	);
}
