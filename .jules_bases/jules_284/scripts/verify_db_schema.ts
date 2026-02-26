
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
  console.log('Verifying Interactive Missions Schema...');

  // Check if tables exist (indirectly by selecting count)
  // We can't query information_schema easily via client-js with RLS unless we use RPC or just try to select.
  // The 'missions' table is public read, so we can select from it.

  // 1. Verify missions table
  const { data: missions, error: missionsError } = await supabase
    .from('missions')
    .select('count', { count: 'exact', head: true });

  if (missionsError) {
    console.error('Error accessing missions table:', missionsError.message);
  } else {
    console.log('✅ missions table exists and is accessible.');
  }

  // 2. Verify mission_steps table
  const { data: steps, error: stepsError } = await supabase
    .from('mission_steps')
    .select('count', { count: 'exact', head: true });

  if (stepsError) {
    console.error('Error accessing mission_steps table:', stepsError.message);
  } else {
    console.log('✅ mission_steps table exists and is accessible.');
  }

  // 3. Verify mission_progress table
  // This might fail if user is not authenticated and RLS blocks it.
  // But we just want to know if table exists. If RLS blocks, error is usually "permission denied" or "empty".
  // If table doesn't exist, error is "relation does not exist".
  const { error: progressError } = await supabase
    .from('mission_progress')
    .select('count', { count: 'exact', head: true });

  if (progressError && progressError.code === '42P01') { // undefined_table
     console.error('❌ mission_progress table does not exist.');
  } else if (progressError) {
     console.log('✅ mission_progress table exists (accessed with error:', progressError.message, '- expected if RLS/Auth).');
  } else {
     console.log('✅ mission_progress table exists and is accessible.');
  }

  // 4. Verify Sample Mission
  const { data: sampleMission, error: sampleError } = await supabase
    .from('missions')
    .select('*')
    .eq('slug', 'rescate-alta-mar')
    .single();

  if (sampleError) {
    console.warn('⚠️ Sample mission "rescate-alta-mar" not found or error:', sampleError.message);
  } else {
    console.log('✅ Sample mission found:', sampleMission.title);
    if (sampleMission.initial_step_id) {
        console.log('   - Initial Step ID:', sampleMission.initial_step_id);
    } else {
        console.warn('   - ⚠️ Initial Step ID is missing!');
    }
  }
}

verifySchema().catch(console.error);
