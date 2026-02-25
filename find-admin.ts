
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://xbledhifomblirxurtyv.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function findAdmin() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('email, rol')
        .eq('rol', 'admin')
        .limit(1);

    if (error) {
        console.error(error);
        return;
    }
    console.log('Admin found:', profiles[0]?.email);
}

findAdmin();
