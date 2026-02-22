import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 1. Auth Check (Cron Secret)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

        // Allow manual trigger if admin? (Optional, but let's stick to cron strictness for now or allow if in dev)
        if (!isCron && process.env.NODE_ENV !== 'development') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAdminClient();

        // Time range: Last 24 hours
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const since = yesterday.toISOString();

        // 2. Fetch Data in parallel
        const [
            { data: bonos, error: bonosError },
            { data: desafios, error: desafiosError },
            { data: evaluaciones, error: evalError }
        ] = await Promise.all([
            supabase
                .from('movimientos_bono')
                .select('tipo_movimiento, horas')
                .gte('created_at', since),
            supabase
                .from('intentos_desafios')
                .select('correcto')
                .gte('creado_at', since),
            supabase
                .from('intentos_evaluacion')
                .select('aprobado')
                .gte('created_at', since)
        ]);

        if (bonosError) console.error('Error fetching bonos:', bonosError);
        if (desafiosError) console.error('Error fetching desafios:', desafiosError);
        if (evalError) console.error('Error fetching evaluaciones:', evalError);

        // 3. Process Stats
        // Bonos
        const consumedCredits = bonos
            ?.filter(b => b.tipo_movimiento === 'consumo')
            .reduce((acc, curr) => acc + Math.abs(curr.horas || 0), 0) || 0;

        const boughtCredits = bonos
            ?.filter(b => b.tipo_movimiento === 'compra')
            .reduce((acc, curr) => acc + (curr.horas || 0), 0) || 0;

        // Desafíos
        const totalDesafios = desafios?.length || 0;
        const correctDesafios = desafios?.filter(d => d.correcto).length || 0;

        // Evaluaciones
        const totalEvaluaciones = evaluaciones?.length || 0;
        const passedEvaluaciones = evaluaciones?.filter(e => e.aprobado).length || 0;

        // 4. Construct Message
        const dateStr = now.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const message = `
📊 *Resumen Diario de Actividad*
📅 _${dateStr}_

💳 *Créditos (Bonos)*
• 📉 Consumidos: \`${consumedCredits.toFixed(1)}h\`
• 📈 Comprados: \`${boughtCredits.toFixed(1)}h\`

📝 *Tareas y Desafíos*
• 🧩 Desafíos Diarios: \`${totalDesafios}\` intentos (${correctDesafios} correctos)
• 🎓 Evaluaciones: \`${totalEvaluaciones}\` realizadas (${passedEvaluaciones} aprobadas)

🚀 _¡Seguimos navegando!_
`.trim();

        // 5. Send Telegram Message
        const sent = await sendTelegramMessage(message);

        return NextResponse.json({
            success: sent,
            stats: {
                consumedCredits,
                boughtCredits,
                totalDesafios,
                correctDesafios,
                totalEvaluaciones,
                passedEvaluaciones
            }
        });

    } catch (error: any) {
        console.error('Daily stats cron error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
