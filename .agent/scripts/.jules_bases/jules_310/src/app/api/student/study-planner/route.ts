import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        if (!startDate || !endDate) {
            return NextResponse.json({ error: 'Missing date range' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch Planned Sessions
        const { data: plans, error: plansError } = await supabase
            .from('study_plans')
            .select('*')
            .eq('user_id', user.id)
            .gte('start_time', startDate)
            .lte('start_time', endDate);

        if (plansError) throw plansError;

        // 2. Fetch Weekly Goal
        const { data: profile } = await supabase
            .from('profiles')
            .select('weekly_study_goal_minutes')
            .eq('id', user.id)
            .single();

        // 3. Calculate Actual Progress
        // 3a. Evaluation Attempts (time spent)
        const { data: evaluations } = await supabase
            .from('intentos_evaluacion')
            .select('tiempo_empleado_seg, created_at')
            .eq('alumno_id', user.id)
            .gte('created_at', startDate)
            .lte('created_at', endDate);

        // 3b. Module Progress (15 min estimate per module)
        const { data: modules } = await supabase
            .from('progreso_alumno')
            .select('created_at')
            .eq('alumno_id', user.id)
            .gte('created_at', startDate)
            .lte('created_at', endDate);

        const evalMinutes = (evaluations || []).reduce((acc, curr) => acc + (curr.tiempo_empleado_seg || 0), 0) / 60;
        const moduleMinutes = (modules || []).length * 15;
        const totalActualMinutes = Math.round(evalMinutes + moduleMinutes);

        return NextResponse.json({
            plans: plans || [],
            weekly_goal: profile?.weekly_study_goal_minutes || 0,
            actual_minutes: totalActualMinutes
        });

    } catch (error: any) {
        console.error('Error fetching study planner data:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data, error } = await supabase
            .from('study_plans')
            .insert({
                user_id: user.id,
                ...json
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const json = await request.json();
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Handle Goal Update
        if (json.weekly_goal !== undefined) {
            const { error } = await supabase
                .from('profiles')
                .update({ weekly_study_goal_minutes: json.weekly_goal })
                .eq('id', user.id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        // Handle Session Update
        const { id, ...updates } = json;
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const { data, error } = await supabase
            .from('study_plans')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id) // Security check
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { error } = await supabase
            .from('study_plans')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // Security check

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
