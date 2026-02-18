
import { NextResponse } from 'next/server';
import { fetchEuskalmetAlerts } from '@/lib/euskalmet';
import { resend, DEFAULT_FROM_EMAIL } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // Basic protection (could use a secret key in header)
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    if (process.env.CRON_SECRET && key !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const alerts = await fetchEuskalmetAlerts();

        // Filter alerts for the area (Costa Bizkaia)
        // Euskalmet alerts usually have a 'level' (amarillo, naranja, rojo) and 'description'
        if (alerts && alerts.length > 0) {
            const activeAlerts = alerts.filter((a: any) => a.level !== 'verde' && a.level !== 'green');

            if (activeAlerts.length > 0) {
                // Formatting for email
                const emailContent = activeAlerts.map((a: any) => `
                    <h3>ALERTA: ${a.phenomenon || 'Meteorológica'}</h3>
                    <p><strong>Nivel:</strong> ${a.level}</p>
                    <p><strong>Comienzo:</strong> ${a.start || '---'}</p>
                    <p><strong>Fin:</strong> ${a.end || '---'}</p>
                    <p>${a.description || ''}</p>
                `).join('<hr/>');

                if (resend) {
                    await resend.emails.send({
                        from: DEFAULT_FROM_EMAIL,
                        to: ['info@getxobelaeskola.com'],
                        subject: `⚠️ ADVERTENCIA METEOROLÓGICA: ${activeAlerts.length} Alertas Activas`,
                        html: `
                            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                                <h2 style="color: #d32f2f;">Avisos Meteorológicos Euskalmet - Getxo</h2>
                                <p>Se han detectado avisos activos para la zona de Costa Bizkaia:</p>
                                ${emailContent}
                                <br/>
                                <p style="font-size: 10px; color: #999;">Este es un aviso automático del sistema de Getxo Bela Eskola.</p>
                            </div>
                        `
                    });

                    return NextResponse.json({ success: true, email_sent: true, alerts_count: activeAlerts.length });
                } else {
                    return NextResponse.json({ success: true, email_sent: false, note: 'Resend not configured' });
                }
            }
        }

        return NextResponse.json({ success: true, alerts_found: 0 });

    } catch (error) {
        console.error('Cron Alert Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
