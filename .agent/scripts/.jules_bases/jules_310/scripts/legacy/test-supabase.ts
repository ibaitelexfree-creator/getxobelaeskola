import { createClient } from './src/lib/supabase/server';

async function testConnection() {
    console.log('Testing Supabase connection...');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    const supabase = createClient();

    try {
        const { data, error } = await supabase.from('cursos').select('*').limit(1);

        if (error) {
            if (error.code === '42P01') {
                console.log('✅ Connected to Supabase!');
                console.log('ℹ️ Table "cursos" not found - This is expected if you haven\'t run the SQL schema yet.');
            } else {
                console.error('❌ Connection error:', error.message);
            }
        } else {
            console.log('✅ Connected to Supabase!');
            console.log('📊 Table "cursos" exists and returned', data.length, 'rows.');
        }
    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

testConnection();
