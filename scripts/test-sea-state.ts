
import { fetchSeaState } from '../src/lib/puertos-del-estado';

async function test() {
    console.log('Testing Sea State Fetch...');
    try {
        const data = await fetchSeaState();
        console.log('Result:', JSON.stringify(data, null, 2));

        if (data.isSimulated) {
            console.log('⚠️  Note: Data is simulated (API unreachable or not implemented)');
        } else {
            console.log('✅  Success: Real data fetched!');
        }
    } catch (e: any) {
        console.error('❌  Error:', e);
    }
}

test();
