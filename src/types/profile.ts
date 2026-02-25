export interface PublicProfile {
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
    bio?: string;
    created_at: string;
    is_public: boolean;
  };
  stats: {
    total_hours: number;
    total_points: number;
    levels_completed: number;
    global_progress: number;
    skills_unlocked: number;
    badges_earned: number;
    ranking_position: number;
    streak_days: number;
  };
  badges: Badge[];
  skills: Skill[];
  certificates: Certificate[];
  logbook: LogbookEntry[];
  activity_heatmap: ActivityDay[];
  skill_radar: SkillRadarItem[];
  boat_mastery: BoatMasteryItem[];
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  rarity: string;
  earned_at: string;
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  category: string;
  icon: string;
  earned_at: string;
}

export interface Certificate {
  id: string;
  name: string;
  course_name: string;
  issued_at: string;
  url?: string;
}

export interface LogbookEntry {
  id: string;
  date: string;
  duration_hours: number;
  boat_name: string;
  location?: string;
  conditions?: string;
  role?: string;
}

export interface ActivityDay {
  date: string;
  count: number;
}

export interface SkillRadarItem {
  subject: string;
  A: number;
  fullMark: number;
}

export interface BoatMasteryItem {
  name: string;
  hours: number;
  sessions: number;
  level: string;
  progress: number;
  lastUsed: string;
}
