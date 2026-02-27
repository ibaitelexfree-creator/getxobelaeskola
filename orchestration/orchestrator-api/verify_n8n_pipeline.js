import { run5AgentPipeline } from './src/lib/pipeline-5agents.js';

async function main() {
    console.log('--- Verification: n8n 5-Agent Pipeline ---');
    const prompt = 'Necesito crear un sistema de votación en tiempo real usando Redis y Node.js. El sistema debe permitir crear encuestas, votar y ver resultados en vivo.';

    try {
        console.log('Original Prompt:', prompt);
        const result = await run5AgentPipeline(prompt);
        console.log('\n--- Pipeline Result ---');
        console.log(result);
        console.log('\nVerification Successful ✅');
    } catch (error) {
        console.error('\nVerification Failed ❌');
        console.error('Error:', error.message);
    }
}

main();
