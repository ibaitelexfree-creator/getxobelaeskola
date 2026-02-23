import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // Use admin client to bypass RLS for global stats
    const supabase = createAdminClient();

    // Calculate yesterday's date range (UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const yesterdayStart = yesterday.toISOString();
    const yesterdayEnd = today.toISOString();

    try {
        // Query payments (inscripciones)
        const { count: completedCount, error: completedError } = await supabase
            .from('inscripciones')
            .select('*', { count: 'exact', head: true })
            .eq('estado_pago', 'pagado')
            .gte('created_at', yesterdayStart)
            .lt('created_at', yesterdayEnd);

        if (completedError) throw completedError;

        const { count: failedCount, error: failedError } = await supabase
            .from('inscripciones')
            .select('*', { count: 'exact', head: true })
            .eq('estado_pago', 'fallido')
            .gte('created_at', yesterdayStart)
            .lt('created_at', yesterdayEnd);

        if (failedError) throw failedError;

        const dateStr = yesterday.toISOString().split('T')[0];

        const message = `📊 *Daily Status Report (${dateStr})*\n\n` +
            `*Payments (Inscripciones):*\n` +
            `✅ Completed: ${completedCount || 0}\n` +
            `❌ Failed: ${failedCount || 0}`;

        await sendTelegramMessage(message);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in cron job:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
