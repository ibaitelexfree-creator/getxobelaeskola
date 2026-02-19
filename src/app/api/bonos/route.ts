
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data: bonos, error } = await supabase
            .from('tipos_bono')
            .select('*')
            .eq('activo', true)
            .order('precio', { ascending: true });

        if (error) {
            console.error('Error fetching bonos:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(bonos);
    } catch (err: any) {
        console.error('Unexpected error fetching bonos:', err);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
