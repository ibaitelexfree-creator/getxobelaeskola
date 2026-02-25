import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAdmin() {
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, rol')
    .eq('rol', 'admin');

  if (error) {
    console.error('Error fetching admins:', error);
    return;
  }

  console.log('Admins found:', users);
}

findAdmin();
