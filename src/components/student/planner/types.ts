export interface StudySession {
    id: string;
    user_id: string;
    start_time: string;
    duration_minutes: number;
    topic?: string;
    notes?: string;
    completed: boolean;
    created_at: string;
}
