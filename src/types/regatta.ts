export interface RegattaMatch {
  id: string;
  code: string;
  host_id: string;
  status: "waiting" | "racing" | "finished";
  config: any;
  created_at: string;
}

export interface RegattaParticipant {
  id: string;
  match_id: string;
  user_id: string;
  username: string;
  score: number;
  joined_at: string;
  finished_at?: string;
}

export interface SerializableVector3 {
  x: number;
  y: number;
  z: number;
}

export interface OpponentState {
  userId: string;
  username: string;
  position: SerializableVector3;
  heading: number;
  heel: number;
  sailAngle: number;
  speed: number;
}
