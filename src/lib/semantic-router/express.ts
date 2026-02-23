import { Router, Request, Response } from 'express';
import { SemanticRouter } from './index';

/**
 * Creates an Express Router configured with the SemanticRouter logic.
 * This module fulfills the "Express JS Route" requirement, allowing this logic
 * to be plugged into any Express application.
 */
export function createSemanticExpressRouter(): Router {
    const router = Router();
    const semanticRouter = new SemanticRouter(); // Using a fresh instance

    router.post('/classify', async (req: Request, res: Response) => {
        try {
            const { prompt } = req.body;

            if (!prompt || typeof prompt !== 'string') {
                return res.status(400).json({
                    error: 'Invalid or missing "prompt" parameter. Must be a string.'
                });
            }

            const result = await semanticRouter.route(prompt);

            return res.status(200).json(result);
        } catch (error) {
            console.error('[SemanticRouter] Processing Error:', error);
            return res.status(500).json({
                error: 'Internal processing error',
                details: error instanceof Error ? error.message : String(error)
            });
        }
    });

    return router;
}
