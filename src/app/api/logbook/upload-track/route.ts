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
        const sessionId = formData.get('sessionId') as string;

        // Allow missing sessionId (create new session)
        if (!file) {
            return NextResponse.json({ error: 'Missing file' }, { status: 400 });
        }

        const text = await file.text();

        // Robust GPX parsing using cheerio
        const $ = cheerio.load(text, { xmlMode: true });
        const coords: { lat: number, lng: number, time?: string }[] = [];

        $('trkpt').each((_, el) => {
            const $el = $(el);
            const lat = parseFloat($el.attr('lat') || '');
            const lon = parseFloat($el.attr('lon') || '');
            const time = $el.find('time').text();

            if (!isNaN(lat) && !isNaN(lon)) {
                coords.push({
                    lat,
                    lng: lon,
                    time: time || undefined
                });
            }
        });

        // Simplified Check: If coords empty, try to find any lat/lon attributes even if not strictly trkpt (unlikely for valid GPX)
        if (coords.length === 0) {
            // Fallback regex for very broken GPX
            const fallbackRegex = /lat="([-+]?\d*\.?\d+)"[^>]*lon="([-+]?\d*\.?\d+)"/g;
            let match;
            while ((match = fallbackRegex.exec(text)) !== null) {
                coords.push({
                    lat: parseFloat(match[1]),
                    lng: parseFloat(match[2])
                });
            }
        }

        // Calculate Stats using Turf
        let totalDistanceNm = 0;
        let maxSpeedKn = 0;
        let durationH = 0;

        if (coords.length > 1) {
            // 1. Calculate Distance & Speed
            for (let i = 0; i < coords.length - 1; i++) {
                const from = turf.point([coords[i].lng, coords[i].lat]);
                const to = turf.point([coords[i + 1].lng, coords[i + 1].lat]);
                const d = turf.distance(from, to, { units: 'nauticalmiles' });
                totalDistanceNm += d;

                if (coords[i].time && coords[i + 1].time) {
                    const t1 = new Date(coords[i].time!).getTime();
                    const t2 = new Date(coords[i + 1].time!).getTime();
                    const diffH = (t2 - t1) / (1000 * 3600);
                    if (diffH > 0) {
                        const speed = d / diffH;
                        // Filter unrealistic speeds (e.g. GPS jumps) - max 60kn
                        if (speed < 60 && speed > maxSpeedKn) {
                            maxSpeedKn = speed;
                        }
                    }
                }
            }

            // 2. Calculate Duration
            const statTimeStr = coords[0].time;
            const startTime = statTimeStr ? new Date(statTimeStr).getTime() : 0;
            const endTimeStr = coords[coords.length - 1].time;
            const endTime = endTimeStr ? new Date(endTimeStr).getTime() : 0;
            if (startTime && endTime) {
                durationH = (endTime - startTime) / (1000 * 3600);
            }
        }

        // Note: "Ruta más al viento" (Upwind Route) requires wind data which is not present in standard GPX.
        // We omit this statistic for imported tracks.

        // Simplify coordinates if there are too many (max 200 points for rendering)
        let simplifiedCoords = coords;
        if (coords.length > 200) {
            const step = Math.ceil(coords.length / 200);
            simplifiedCoords = coords.filter((_, i) => i % step === 0);
        }

        if (simplifiedCoords.length === 0) {
            return NextResponse.json({ error: 'No valid coordinates found in GPX' }, { status: 400 });
        }

        const supabase = createClient();
        const stats = {
            distance_nm: parseFloat(totalDistanceNm.toFixed(2)),
            avg_speed_kn: durationH > 0 ? parseFloat((totalDistanceNm / durationH).toFixed(2)) : 0,
            max_speed_kn: parseFloat(maxSpeedKn.toFixed(2)),
            duration_h: parseFloat(durationH.toFixed(2))
        };

        // 1. Upload original GPX to Storage
        // Use a generic name if sessionId is not provided
        const finalSessionId = sessionId || `imported_${Date.now()}`;
        const filePath = `tracks/${user.id}/${finalSessionId}.gpx`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('academy-assets')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Insert or Update horas_navegacion
        let resultData;

        if (sessionId) {
            const { data, error: updateError } = await supabase
                .from('horas_navegacion')
                .update({
                    track_log: simplifiedCoords, // Now includes timestamps if available
                    gpx_url: filePath,
                    duracion_h: durationH > 0 ? parseFloat(durationH.toFixed(2)) : undefined,
                    ubicacion: {
                        lat: simplifiedCoords[0].lat,
                        lng: simplifiedCoords[0].lng,
                        stats: stats
                    }
                })
                .eq('id', sessionId)
                .eq('alumno_id', user.id)
                .select()
                .single();

            if (updateError) throw updateError;
            resultData = data;
        } else {
            // Create new session
            const { data, error: insertError } = await supabase
                .from('horas_navegacion')
                .insert({
                    alumno_id: user.id,
                    fecha: coords[0].time ? new Date(coords[0].time!).toISOString() : new Date().toISOString(),
                    duracion_h: durationH > 0 ? parseFloat(durationH.toFixed(2)) : 0.1, // Minimum 0.1h
                    tipo: 'Travesía Importada',
                    embarcacion: 'Desconocido', // Can be edited later
                    verificado: false,
                    track_log: simplifiedCoords,
                    gpx_url: filePath,
                    ubicacion: {
                        lat: simplifiedCoords[0].lat,
                        lng: simplifiedCoords[0].lng,
                        stats: stats
                    }
                })
                .select()
                .single();

            if (insertError) throw insertError;
            resultData = data;
        }

        return NextResponse.json({
            success: true,
            sessionId: resultData.id,
            pointsCount: simplifiedCoords.length,
            stats: stats,
            track: simplifiedCoords
        });

    } catch (err) {
        console.error('Error processing GPX:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
