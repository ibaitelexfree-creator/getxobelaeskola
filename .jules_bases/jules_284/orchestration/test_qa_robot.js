import dotenv from 'dotenv';
import { sendTelegramMessage } from './lib/telegram.js';
import axios from 'axios';
import https from 'https';

dotenv.config();

const ORCHESTRATOR_URL = 'http://localhost:3323'; // Local orchestrator port

async function triggerManualQA() {
    console.log('⛵ Instando ejecución de prueba de Sailing Ghost...');

    const prompt = `MISSION: SAILING GHOST QA AUDIT (MANUAL TEST)
1. Access the web app at http://localhost:3100.
2. Navigate to the registration page and create a NEW test user account.
3. Go to the courses or membership section.
4. Select a product and use the Stripe Test Card (4242 4242 4242 4242) to complete a checkout.
5. Confirm that the membership is successfully activated in the user dashboard.
6. Capture screenshots of each critical step.
7. Record a video/log of the browser interaction.
8. If failure occurs, document it.
9. Report back with the summary.`;

    try {
        // Enviar notificación a Telegram
        await sendTelegramMessage(`⛵ *Sailing Ghost: Prueba Manual Iniciada*\nEstamos lanzando una auditoría E2E en vivo para verificar el flujo de registro y pagos Stripe.`);

        // Llamar directamente al orchestrator local para crear la sesion
        const response = await axios.post(`${ORCHESTRATOR_URL}/api/sessions`, {
            prompt: prompt,
            source: process.env.JULES_DEFAULT_SOURCE || 'sources/github/ibaitelexfree-creator/getxobelaeskola',
            title: '⛵ Sailing Ghost: LIVE TEST AUDIT',
            automationMode: 'AUTO_CREATE_PR' // Esto permite que trabaje solo
        }, {
            headers: {
                'x-api-key': process.env.JULES_API_KEY
            }
        });

        console.log('✅ Sesión de Jules creada:', response.data.id);
        console.log('🔗 Revisa Telegram para ver el progreso visual.');
    } catch (err) {
        console.error('❌ Error al lanzar la prueba:', err.response?.data || err.message);
    }
}

triggerManualQA();
