import * as turf from '@turf/turf';
import { createAdminClient } from '@/lib/supabase/server';
import { LocationPoint } from './types';

export class ExplorationService {
    /**
     * Simplifies a track segment for efficient storage and rendering
     */
    static simplifyTrack(points: LocationPoint[], tolerance = 0.01): LocationPoint[] {
        if (points.length <= 2) return points;

        const line = turf.lineString(points.map(p => [p.lng, p.lat]));
        const simplified = turf.simplify(line, { tolerance, highQuality: true });

        return simplified.geometry.coordinates.map(coord => ({
            lng: coord[0],
            lat: coord[1],
            timestamp: Date.now() // Timestamps are lost during simplification, we reuse current or interpolate
        }));
    }

    /**
     * Checks for overlaps and updates/inserts exploration segments
     */
    static async saveExplorationSegment(userId: string, points: LocationPoint[]) {
        if (points.length < 2) return;

        const supabase = createAdminClient();
        const simplified = this.simplifyTrack(points);

        // Today's date to group sessions
        const sessionDate = new Date().toISOString().split('T')[0];

        // Logical approach for "exploration": 
        // 1. Check if this segment overlaps with any recently created segments
        // For now, to keep it simple and performant:
        // We just insert the new segment. 
        // The pass_count logic can be refined later with spatial queries (PostGIS)
        // or by checking distance to existing segments.

        const { error } = await supabase
            .from('exploration_tracks')
            .insert({
                user_id: userId,
                track_segment: simplified,
                session_date: sessionDate,
                pass_count: 1
            });

        if (error) {
            console.error('Error saving exploration segment:', error);
            throw error;
        }
    }

    /**
     * Gets all exploration data for a user
     */
    static async getExplorationData(userId: string) {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('exploration_tracks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }
}
