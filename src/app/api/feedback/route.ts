import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { PushService } from '@/lib/notifications/PushService';
import { getNotificationContent } from '@/lib/academy/notification-utils';

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single();

    const isInstructor = profile?.rol === 'admin' || profile?.rol === 'instructor';

    if (!isInstructor) {
        return NextResponse.json({ error: 'Forbidden: Instructors only' }, { status: 403 });
    }

    try {
        const formData = await req.formData();
        const student_id = formData.get('student_id') as string;
        const context_type = formData.get('context_type') as string;
        const context_id = formData.get('context_id') as string;
        const content = formData.get('content') as string;
        const audioFile = formData.get('audio') as File | null;

        if (!student_id || !context_type || !context_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let audio_url: string | null = null;

        // Upload Audio if present
        if (audioFile && audioFile.size > 0) {
            const fileName = `${student_id}/${Date.now()}_feedback.webm`;
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('feedback-audio')
                .upload(fileName, audioFile, {
                    contentType: audioFile.type,
                    upsert: true
                });

            if (uploadError) {
                console.error('Upload Error:', uploadError);
                return NextResponse.json({ error: 'Audio upload failed' }, { status: 500 });
            }

            const { data: publicUrlData } = supabase
                .storage
                .from('feedback-audio')
                .getPublicUrl(fileName);

            audio_url = publicUrlData.publicUrl;
        }

        // Insert Feedback
        const { data: feedback, error: insertError } = await supabase
            .from('instructor_feedback')
            .insert({
                instructor_id: user.id,
                student_id,
                context_type,
                context_id,
                content: content || null,
                audio_url,
                is_read: false
            })
            .select()
            .single();

        if (insertError) {
            console.error('Insert Error:', insertError);
            return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
        }

        // --- Notification System Integration ---

        // 1. Internal Notification Record (Best Effort)
        try {
            await supabase.from('notifications').insert({
                user_id: student_id,
                type: 'feedback',
                title: 'Nuevo Feedback del Instructor',
                message: `Has recibido feedback en tu ${context_type === 'logbook' ? 'bitácora' : 'evaluación'}.`,
                data: { context_id, context_type },
                read: false
            });
        } catch (e) {
            console.warn('Internal notification insert failed (optional):', e);
        }

        // 2. Push Notification (FCM) via PushService
        try {
            // Student locale defaults to 'es'
            const studentLocale = 'es';
            const notification = getNotificationContent('feedback', studentLocale, { contextType: context_type });

            await PushService.sendToUser(
                student_id,
                notification.title,
                notification.body,
                { context_id, context_type, type: 'feedback' }
            );
        } catch (e) {
            console.error('Push notification failed:', e);
        }

        return NextResponse.json({ success: true, feedback });

    } catch (error) {
        console.error('Feedback API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const supabase = createClient();
    const { searchParams } = new URL(req.url);
    const context_id = searchParams.get('context_id');

    if (!context_id) {
        return NextResponse.json({ error: 'Missing context_id' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('instructor_feedback')
        .select('*')
        .eq('context_id', context_id)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ feedback: data });
}
