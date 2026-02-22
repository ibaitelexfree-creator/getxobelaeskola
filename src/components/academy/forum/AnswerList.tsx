import React from "react";
import AnswerItem from "./AnswerItem";

interface AnswerListProps {
	answers: any[];
	isStaff: boolean;
	onMarkCorrect: (id: string) => void;
}

export default function AnswerList({
	answers,
	isStaff,
	onMarkCorrect,
}: AnswerListProps) {
	if (answers.length === 0) {
		return (
			<div className="text-center py-10 text-white/40 italic font-light">
				No hay respuestas todavía. ¡Sé el primero en ayudar!
			</div>
		);
	}

	return (
		<div>
			{answers.map((answer) => (
				<AnswerItem
					key={answer.id}
					answer={answer}
					isStaff={isStaff}
					onMarkCorrect={onMarkCorrect}
				/>
			))}
		</div>
	);
}
