export interface StudySession {
	id: string;
	user_id: string;
	title: string;
	start_time: string;
	end_time: string;
	completed: boolean;
	created_at?: string;
}

export interface StudyGoal {
	user_id: string;
	weekly_goal_minutes: number;
	updated_at?: string;
}
