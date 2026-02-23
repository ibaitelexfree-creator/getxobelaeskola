import express from 'express';
import { createSemanticExpressRouter } from '../src/lib/semantic-router/express';

const app = express();
const PORT = 4001;

app.use(express.json());

// Mount the semantic router
app.use('/api', createSemanticExpressRouter());

const server = app.listen(PORT, () => {
    console.log(`Semantic Router Verification Server running on port ${PORT}`);
});

// Handle graceful shutdown for testing
process.on('SIGTERM', () => {
    server.close();
});
