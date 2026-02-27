import { callOpenRouter } from './openrouter-client.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Classifier: Segmentación inteligente de tareas para el Swarm.
 * Fase 2.4 - Clasifica tareas en ARCHITECT, DATA o UI.
 */
export class Classifier {
    /**
     * Clasifica una tarea técnica basada en su descripción.
     * @param {string} taskDescription 
     * @returns {Promise<string>} Categoría: 'ARCHITECT', 'DATA' o 'UI'
     */
    static async classifyTask(taskDescription) {
        if (!taskDescription) return 'ARCHITECT';

        const systemPrompt = `Eres un agente de clasificación de tareas para un sistema Swarm multi-agente.
Tu objetivo es analizar una tarea técnica y asignarla EXCATAMENTE a una de estas tres categorías:

1. ARCHITECT: Lógica core, diseño de sistemas, seguridad, infraestructura, APIs backend, integraciones complejas.
2. DATA: Esquemas de base de datos, migraciones SQL, datos de semilla, queries, lógica de bases vectoriales (Qdrant).
3. UI: Componentes frontend, estilos CSS, maquetación HTML, UX, interactividad cliente, responsividad.

Responde ÚNICAMENTE con el nombre de la categoría en mayúsculas.`;

        try {
            const response = await callOpenRouter([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Clasifica esta tarea: "${taskDescription}"` }
            ], {
                model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
                temperature: parseFloat(process.env.OPENROUTER_CLASSIFIER_TEMP || '0.1')
            });

            const category = response.text.trim().toUpperCase();

            // Sanitización de respuesta
            const validCategories = ['ARCHITECT', 'DATA', 'UI'];
            for (const cat of validCategories) {
                if (category.includes(cat)) return cat;
            }

            console.warn(`[Classifier] Respuesta ambigua: "${category}". Usando ARCHITECT por defecto.`);
            return 'ARCHITECT';
        } catch (error) {
            console.error('[Classifier] Error en clasificación:', error.message);
            // Fallback seguro para no detener el flujo
            return 'ARCHITECT';
        }
    }
}

export default Classifier;
