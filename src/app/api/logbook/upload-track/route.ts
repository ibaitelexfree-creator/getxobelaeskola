
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import * as turf from '@turf/turf';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
    try {
        const { user, error: authError } = await requireAuth();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const sessionId = formData.get('sessionId') as string; // Optional

        if (!file) {
            return NextResponse.json({ error: 'Missing file' }, { status: 400 });
        }

        const text = await file.text();
        const $ = cheerio.load(text, { xmlMode: true });

        const points: { lat: number, lng: number, time: Date | null }[] = [];

        // Parse GPX using Cheerio (safer than Regex)
        $('trkpt').each((_, el) => {
            const latStr = $(el).attr('lat');
            const lonStr = $(el).attr('lon');

            if (latStr && lonStr) {
                const lat = parseFloat(latStr);
                const lng = parseFloat(lonStr);
                const timeStr = $(el).find('time').text();

                if (!isNaN(lat) && !isNaN(lng)) {
                    points.push({
                        lat,
                        lng,
                        time: timeStr ? new Date(timeStr) : null
                    });
                }
            }
        });

        if (points.length < 2) {
            return NextResponse.json({ error: 'No valid track points found (minimum 2 required)' }, { status: 400 });
        }

        // Simplify coordinates if there are too many (max 500 points for rendering/storage)
        // We keep the first and last point always.
        let simplifiedPoints = points;
        if (points.length > 500) {
            const step = Math.ceil(points.length / 500);
            simplifiedPoints = points.filter((_, i) => i === 0 || i === points.length - 1 || i % step === 0);
        }

        // --- CALCULATE STATISTICS ---

        // 1. Total Distance
        // Convert points to GeoJSON LineString for Turf
        const coordinates = points.map(p => [p.lng, p.lat]); // Turf uses [lng, lat]
        const lineString = turf.lineString(coordinates);
        const totalDistanceKm = turf.length(lineString, { units: 'kilometers' });
        const totalDistanceNm = totalDistanceKm * 0.539957; // 1 km = 0.539957 nm

        // 2. Duration
        let durationHours = 0;
        const startTime = points[0].time;
        const endTime = points[points.length - 1].time;

        if (startTime && endTime) {
            const diffMs = endTime.getTime() - startTime.getTime();
            durationHours = diffMs / (1000 * 60 * 60);
        }

        // 3. Average Speed (Knots)
        // If duration is 0 or very small, avoid division by zero
        const avgSpeedKn = (durationHours > 0.01) ? (totalDistanceNm / durationHours) : 0;

        // 4. Max Speed (Knots)
        let maxSpeedKn = 0;
        // Iterate through segments to find max speed
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            if (p1.time && p2.time) {
                const timeDiffHours = (p2.time.getTime() - p1.time.getTime()) / (1000 * 60 * 60);
                if (timeDiffHours > 0.0001) { // Avoid tiny time diffs (noise)
                    const segmentDistKm = turf.distance(
                        [p1.lng, p1.lat],
                        [p2.lng, p2.lat],
                        { units: 'kilometers' }
                    );
                    const segmentDistNm = segmentDistKm * 0.539957;
                    const speed = segmentDistNm / timeDiffHours;

                    // Filter unrealistic speeds (e.g., > 100 knots for sailing, maybe GPS jump)
                    if (speed < 100 && speed > maxSpeedKn) {
                        maxSpeedKn = speed;
                    }
                }
            }
        }

        // Prepare data for DB
        const trackLog = simplifiedPoints.map(p => ({
            lat: p.lat,
            lng: p.lng,
        }));

        const stats = {
            total_distance_nm: parseFloat(totalDistanceNm.toFixed(2)),
            average_speed_kn: parseFloat(avgSpeedKn.toFixed(2)),
            max_speed_kn: parseFloat(maxSpeedKn.toFixed(2)),
            duration_h: parseFloat(durationHours.toFixed(2)),
            start_time: startTime,
            end_time: endTime
        };

        const supabase = createClient();

        // 1. Upload original GPX to Storage
        const filePath = `tracks/${user.id}/${Date.now()}_import.gpx`;
        const { error: uploadError } = await supabase.storage
            .from('academy-assets')
            .upload(filePath, file);

        if (uploadError) {
             console.error('Storage Upload Error:', uploadError);
             return NextResponse.json({ error: 'Failed to upload GPX file' }, { status: 500 });
        }

        // 2. Insert or Update Database
        let data, error;

        // Note: We cannot calculate "Ruta más al viento" (Upwind VMG/Angle) without wind data.
        const notesContent = `Importado de GPX.\n` +
                             `Distancia: ${stats.total_distance_nm} NM\n` +
                             `Vel. Media: ${stats.average_speed_kn} kn\n` +
                             `Vel. Max: ${stats.max_speed_kn} kn\n` +
                             `Ruta más al viento: N/A (sin datos de viento)`;

        if (sessionId) {
            // Update existing
             const { data: d, error: e } = await supabase
                .from('horas_navegacion')
                .update({
                    track_log: trackLog,
                    gpx_url: filePath,
                    duracion_h: stats.duration_h || 0,
                    notas: notesContent,
                    ubicacion: { lat: trackLog[0].lat, lng: trackLog[0].lng }
                })
                .eq('id', sessionId)
                .eq('alumno_id', user.id)
                .select()
                .single();
            data = d;
            error = e;
        } else {
            // Create new
            const { data: d, error: e } = await supabase
                .from('horas_navegacion')
                .insert({
                    alumno_id: user.id,
                    fecha: stats.start_time ? stats.start_time.toISOString() : new Date().toISOString(),
                    tipo: 'Travesía Importada',
                    duracion_h: stats.duration_h || 0,
                    embarcacion: 'Desconocida',
                    track_log: trackLog,
                    gpx_url: filePath,
                    notas: notesContent,
                    ubicacion: { lat: trackLog[0].lat, lng: trackLog[0].lng },
                    verificado: false,
                    condiciones_meteo: `Viento: -`
                })
                .select()
                .single();
            data = d;
            error = e;
        }

        if (error) {
            console.error('Database Error:', error);
            return NextResponse.json({ error: 'Failed to save session to database' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            stats,
            session: data
        });

    } catch (err) {
        console.error('Error processing GPX:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
