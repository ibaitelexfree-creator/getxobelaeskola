
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';

export async function POST(req: Request) {
    try {
        const { user, error: authError } = await requireAuth();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { points, metadata } = await req.json();

        if (!points || !Array.isArray(points) || points.length < 2) {
            return NextResponse.json({ error: 'Insuficientes puntos para crear una travesía' }, { status: 400 });
        }

        // Calculate duration in hours
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];
        const durationMs = lastPoint.timestamp - firstPoint.timestamp;
        const durationH = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));

        const supabase = await createClient();

        // Simplify coordinates if there are too many (max 200 points for rendering efficiency)
        let simplifiedCoords = points.map(p => ({ lat: p.lat, lng: p.lng }));
        if (simplifiedCoords.length > 200) {
            const step = Math.ceil(simplifiedCoords.length / 200);
            simplifiedCoords = simplifiedCoords.filter((_, i) => i % step === 0);
        }

        const { data, error } = await supabase
            .from('horas_navegacion')
            .insert({
                alumno_id: user.id,
                fecha: new Date(firstPoint.timestamp).toISOString(),
                duracion_h: durationH > 0 ? durationH : 0.1, // Minimum 0.1h
                tipo: metadata?.tipo || 'Travesía Digital',
                embarcacion: metadata?.embarcacion || 'App Tracking',
                verificado: false,
                track_log: simplifiedCoords,
                ubicacion: { lat: firstPoint.lat, lng: firstPoint.lng }
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            sessionId: data.id,
            pointsCount: simplifiedCoords.length,
            durationH
        });

    } catch (err: any) {
        console.error('Error saving tracking session:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
