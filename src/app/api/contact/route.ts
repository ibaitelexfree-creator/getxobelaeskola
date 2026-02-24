import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { resend, DEFAULT_FROM_EMAIL } from '@/lib/resend';
import { contactNotificationTemplate } from '@/lib/email-templates';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nombre, email, asunto, mensaje, telefono } = body;

        // 1. Validation
        if (!nombre || !email || !asunto || !mensaje) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        // 2. Save to Database
        const supabase = await createClient();

        // Check for duplicates (Idempotency)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { data: existingMessages } = await supabase
            .from('mensajes_contacto')
            .select('id')
            .eq('email', email)
            .eq('asunto', asunto)
            .eq('mensaje', mensaje)
            .gt('created_at', fiveMinutesAgo);

        if (existingMessages && existingMessages.length > 0) {
            console.log(`Duplicate message from ${email} detected. Skipping.`);
            return NextResponse.json({ success: true, message: 'Mensaje recibido correctamente' });
        }

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
            // We continue even if DB fails, as email is usually more critical for notification
        }

        // 3. Send Notification Email
        // Define internal admin email (could be an env var)
        const adminEmail = process.env.ADMIN_EMAIL || 'info@getxobelaeskola.com';

        if (resend) {
            try {
                await resend.emails.send({
                    from: DEFAULT_FROM_EMAIL,
                    to: adminEmail,
                    subject: `[Web Contact] ${asunto}`,
                    html: contactNotificationTemplate({ nombre, email, asunto, mensaje, telefono }),
                });
            } catch (emailError: unknown) {
                console.error('Email Error (Contact):', emailError);
            }
        } else {
            console.log('--- EMAIL SIMULATION (CONTACT) ---');
            console.log('To:', adminEmail);
            console.log('Subject:', asunto);
            console.log('Message:', mensaje);
            console.log('---------------------------------');
        }

        return NextResponse.json({ success: true, message: 'Mensaje recibido correctamente' });

    } catch (err: unknown) {
        console.error('API Contact Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
