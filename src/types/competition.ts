export interface RaceLobby {
	id: string;
	code: string;
	host_id: string;
	status: "waiting" | "starting" | "racing" | "finished";
	created_at: string;
	settings: {
		wind_direction?: number;
		wind_speed?: number;
		laps?: number;
		max_players?: number;
	};
}

export interface RaceParticipant {
	id: string;
	lobby_id: string;
	user_id: string;
	username: string;
	score: number;
	finished_at: string | null;
	created_at: string;
}

export interface SerializedVector3 {
	x: number;
	y: number;
	z: number;
}

export interface MultiplayerBoatState {
	userId: string;
	position: SerializedVector3;
	heading: number;
	sailAngle: number;
	heel: number;
	speed: number;
	timestamp: number;
}
