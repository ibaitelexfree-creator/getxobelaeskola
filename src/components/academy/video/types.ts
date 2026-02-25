export interface VideoCheckpoint {
    time: number; // in seconds
    questionId: string;
}

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface QuestionData {
    id: string;
    text: string;
    options: QuestionOption[];
    explanation?: string;
}
