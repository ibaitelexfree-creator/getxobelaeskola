import { NextResponse } from 'next/server';
import { processMarketingAutomations } from '@/lib/marketing/automation-service';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Endpoint para procesar automatizaciones de marketing.
 * Puede ser llamado por un Cron Job o manualmente por un Admin.
 */
export async function POST(request: Request) {
    try {
        // 1. Verificación de Seguridad
        const authHeader = request.headers.get('authorization');
        // Usamos una variable de entorno para proteger la llamada del CRON
        const cronSecret = process.env.CRON_SECRET;

        const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
        let isAdmin = false;

        if (!isCron) {
            try {
                const supabase = await createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('rol')
                        .eq('id', user.id)
                        .single();
                    isAdmin = profile?.rol === 'admin';
                }
            } catch (e) {
                // Probablemente llamado desde un entorno sin cookies (servidor)
                console.log('No session found or error in auth check');
            }
        }

        if (!isCron && !isAdmin) {
            return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
        }

        // 2. Ejecutar Automatizaciones
        console.log('Iniciando procesamiento de automatizaciones de marketing...');
        const result = await processMarketingAutomations();

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            ...result
        });

    } catch (error: any) {
        console.error('Marketing process API error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Error interno del servidor'
        }, { status: 500 });
    }
}

/**
 * Permitimos GET para pruebas rápidas en desarrollo o si se protege adecuadamente.
 */
export async function GET(request: Request) {
    return POST(request);
}
