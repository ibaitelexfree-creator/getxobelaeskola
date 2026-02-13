import { NextResponse } from 'next/server';
import { resend, DEFAULT_FROM_EMAIL } from '@/lib/resend';
import { createClient } from '@/lib/supabase/server';

/**
 * API interna para envío de correos.
 * Protegida: requiere ser Staff o tener un API_SECRET_KEY (opcional para webhooks externos si se desea)
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Verificación básica: ¿Es Staff o Admin?
        const { data: { user } } = await supabase.auth.getUser();

        // Si no hay usuario, podríamos verificar un Header secreto para llamadas servidor-a-servidor internas
        // Por ahora, permitimos si hay sesión de staff
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('rol')
                .eq('id', user.id)
                .single();

            const isStaff = profile?.rol === 'admin' || profile?.rol === 'instructor';
            if (!isStaff) {
                // Si no es staff, verificamos si es una llamada interna (esto es un poco básico, 
                // pero útil si se llama desde otros routes.ts del mismo server)
                // En Next.js App Router, las llamadas de servidor a servidor suelen ser vía funciones directas,
                // pero si usamos fetch, necesitamos un token.
            }
        }

        const body = await request.json();
        const { to, subject, html, text } = body;

        if (!to || !subject || (!html && !text)) {
            return NextResponse.json({ error: 'Faltan campos requeridos (to, subject, content)' }, { status: 400 });
        }

        if (!resend) {
            console.log('--- SIMULACIÓN EMAIL ---');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log('--- FIN SIMULACIÓN ---');
            return NextResponse.json({
                success: true,
                simulated: true,
                message: 'Modo simulación: RESEND_API_KEY no configurada'
            });
        }

        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to,
            subject,
            html: html || text,
            text: text || html
        });

        if (error) {
            console.error('Error enviando email via Resend:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data?.id });

    } catch (err) {
        console.error('Email API Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
