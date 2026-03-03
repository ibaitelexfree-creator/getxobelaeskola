export interface InstructorFeedback {
	id: string;
	created_at: string;
	instructor_id: string;
	student_id: string;
	context_type: "logbook" | "evaluation";
	context_id: string;
	content?: string;
	audio_url?: string;
	is_read: boolean;
}

export interface FeedbackInput {
	student_id: string;
	context_type: "logbook" | "evaluation";
	context_id: string;
	content?: string;
	audioBlob?: Blob;
}
