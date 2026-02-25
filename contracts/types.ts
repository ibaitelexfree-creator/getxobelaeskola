/**
 * 📝 CONTRACT TYPES
 * Este archivo es la fuente de verdad para el intercambio de datos entre
 * el Data Master (Backend) y el UI Engine (Frontend).
 */

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    role: 'student' | 'instructor' | 'admin';
    created_at: string;
}

export interface Course {
    id: string;
    slug: string;
    title: string; // Título localizado (es o eu) según la sesión
    description?: string;
    price: number;
    image_url?: string;
    level: 'beginner' | 'intermediate' | 'advanced';
}

export interface Enrollment {
    id: string;
    user_id: string;
    course_id: string;
    status: 'active' | 'completed' | 'cancelled';
    progress: number; // 0-100
    enrolled_at: string;
}

export interface LogbookEntry {
    id: string;
    user_id: string;
    date: string;
    title: string;
    content: string;
    weather_conditions?: {
        wind_speed: number;
        wind_direction: string;
        wave_height: number;
    };
    track_url?: string;
}

export interface APIResponse<T> {
    data: T | null;
    error: string | null;
    meta?: {
        total?: number;
        page?: number;
    };
}
