
import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
<<<<<<< HEAD
        const auth = await requireAdmin();
        if (auth.error) return auth.error;
        const { supabaseAdmin, user } = auth;
=======
        const { supabaseAdmin, user, error: authError } = await requireAdmin();
        if (authError) return authError;
>>>>>>> pr-286

        const { id, field, newValue, oldValue } = await request.json();

        if (!id || !field) {
            return NextResponse.json({ error: 'Missing ID or field' }, { status: 400 });
        }

        // 1. Update the record
        const { error: updateError } = await supabaseAdmin
            .from('reservas_alquiler')
            .update({ [field]: newValue })
            .eq('id', id);

        if (updateError) throw updateError;

        // 2. Log to history
        const { error: historyError } = await supabaseAdmin
            .from('financial_edits')
            .insert({
                reserva_id: id,
<<<<<<< HEAD
                staff_id: user.id,
=======
                staff_id: user?.id,
>>>>>>> pr-286
                field_name: field,
                old_value: String(oldValue),
                new_value: String(newValue)
            });

        if (historyError) {
            console.error('History logging error:', historyError);
            // We don't fail the whole request if history logging fails
        }

        return NextResponse.json({ success: true });
<<<<<<< HEAD
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Update financial record error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
=======
    } catch (error: any) {
        console.error('Update financial record error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
>>>>>>> pr-286
    }
}
