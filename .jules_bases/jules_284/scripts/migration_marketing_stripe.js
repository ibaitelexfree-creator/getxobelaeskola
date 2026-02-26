const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join('=').trim().replace(/"/g, '');
            }
        });
    }
}

loadEnv();

async function run() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Adding stripe_coupon_id column to marketing_campaigns...');

    const sql = `
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketing_campaigns' AND column_name = 'stripe_coupon_id') THEN
                ALTER TABLE public.marketing_campaigns ADD COLUMN stripe_coupon_id TEXT;
            END IF;
        END $$;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.error('Error applying migration:', error);
    } else {
        console.log('Migration applied successfully.');
    }
}

run();
