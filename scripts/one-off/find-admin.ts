
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://xbledhifomblirxurtyv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
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
