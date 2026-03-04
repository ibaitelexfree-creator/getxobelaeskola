
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function configureStorage() {
    console.log('Configuring Supabase Storage buckets...');

    const buckets = ['depth-maps', 'property-videos'];

    for (const bucketName of buckets) {
        console.log(`Checking bucket: ${bucketName}...`);
        const { data, error } = await supabase.storage.getBucket(bucketName);

        if (error && error.message.includes('not found')) {
            console.log(`Creating bucket: ${bucketName}...`);
            const { error: createError } = await supabase.storage.createBucket(bucketName, {
                public: true,
                allowedMimeTypes: bucketName === 'depth-maps' ? ['image/png', 'image/jpeg'] : ['video/mp4', 'video/quicktime'],
                fileSizeLimit: 52428800 // 50MB
            });

            if (createError) {
                console.error(`Error creating bucket ${bucketName}:`, createError.message);
            } else {
                console.log(`Bucket ${bucketName} created successfully (Public).`);
            }
        } else if (error) {
            console.error(`Error checking bucket ${bucketName}:`, error.message);
        } else {
            console.log(`Bucket ${bucketName} already exists.`);
            // Update to public just in case
            await supabase.storage.updateBucket(bucketName, { public: true });
            console.log(`Bucket ${bucketName} updated to Public.`);
        }
    }
}

configureStorage();
