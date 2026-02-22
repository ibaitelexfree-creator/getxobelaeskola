import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { resend, DEFAULT_FROM_EMAIL } from '@/lib/resend';
import { contactNotificationTemplate } from '@/lib/email-templates';
import { logToExternalWebhook } from '@/lib/external-logger';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nombre, email, asunto, mensaje, telefono } = body;

        // 1. Validation
        if (!nombre || !email || !asunto || !mensaje) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        const supabase = await createClient();

        // 2. Idempotency / Debounce Check
        // Check if a message with same email, subject and body was sent in the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        let query = supabase
            .from('mensajes_contacto')
            .select('id')
            .eq('email', email)
            .eq('mensaje', mensaje)
            .gte('created_at', fiveMinutesAgo);

        if (asunto) {
            query = query.eq('asunto', asunto);
        }

        const { data: duplicates, error: checkError } = await query;

        if (checkError) {
            console.error('[Contact] Error checking for duplicates:', checkError);
            // Proceed anyway if check fails, better to have duplicate than lost message
        } else if (duplicates && duplicates.length > 0) {
            console.warn(`[Contact] Duplicate message detected from ${email}. Debouncing.`);
            await logToExternalWebhook('CONTACT_DUPLICATE_PREVENTED', { email, asunto });

            // Return success to client so they don't retry, as we already have it
            return NextResponse.json({ success: true, message: 'Mensaje recibido correctamente (cached)' });
        }

        // 3. Save to Database
        const { error: dbError } = await supabase
            .from('mensajes_contacto')
            .insert([{
                nombre,
                email,
                asunto,
                mensaje,
                telefono,
                created_at: new Date().toISOString()
            }]);

        if (dbError) {
            console.error('Database Error (Contact):', dbError);
            await logToExternalWebhook('CONTACT_DB_ERROR', { email, error: dbError.message });
            // We continue even if DB fails, as email is usually more critical for notification
        } else {
             await logToExternalWebhook('CONTACT_DB_SAVED', { email, asunto });
        }

        // 4. Send Notification Email
        // Define internal admin email (could be an env var)
        const adminEmail = process.env.ADMIN_EMAIL || 'info@getxobelaeskola.com';

        if (resend) {
            try {
                const data = await resend.emails.send({
                    from: DEFAULT_FROM_EMAIL,
                    to: adminEmail,
                    subject: `[Web Contact] ${asunto}`,
                    html: contactNotificationTemplate({ nombre, email, asunto, mensaje, telefono }),
                });

                if (data.error) {
                     throw new Error(data.error.message);
                }

                console.log(`[Contact] Notification sent to ${adminEmail}`);
                await logToExternalWebhook('CONTACT_EMAIL_SENT', {
                    email,
                    recipient: adminEmail,
                    messageId: data.data?.id
                });

            } catch (emailError: any) {
                console.error('Email Error (Contact):', emailError);
                await logToExternalWebhook('CONTACT_EMAIL_FAILED', {
                    email,
                    error: emailError.message || emailError
                });
            }
        } else {
            console.log('--- EMAIL SIMULATION (CONTACT) ---');
            console.log('To:', adminEmail);
            console.log('Subject:', asunto);
            console.log('Message:', mensaje);
            console.log('---------------------------------');
            await logToExternalWebhook('CONTACT_EMAIL_SIMULATED', { email, recipient: adminEmail });
        }

        return NextResponse.json({ success: true, message: 'Mensaje recibido correctamente' });

    } catch (err: any) {
        console.error('API Contact Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
