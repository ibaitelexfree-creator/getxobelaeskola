import axios from 'axios';

const prompt = "Crear sistema de comentarios usando una tabla llamada comments que ya existe y con una columna duplicada.";
const name = "Validation Swarm (Deliberate Error)";

async function trigger() {
    try {
        console.log(`Triggering swarm with: "${prompt}"`);
        const response = await axios.post('http://localhost:3000/api/v2/swarm', {
            prompt,
            name
        });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error triggering swarm:', error.response?.data || error.message);
    }
}

trigger();
