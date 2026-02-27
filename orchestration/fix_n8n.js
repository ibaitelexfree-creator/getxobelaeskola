import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const workflowPath = path.join(__dirname, 'n8n-workflows', 'Pipeline_5_Agentes.json');
const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

// Find Webhook Node
const webhookNode = workflowData.nodes.find(n => n.type === 'n8n-nodes-base.webhook');
if (webhookNode) {
    if (!webhookNode.webhookId) {
        webhookNode.webhookId = crypto.randomUUID();
    }
    webhookNode.parameters.responseMode = "responseNode";
}

fs.writeFileSync(workflowPath, JSON.stringify(workflowData, null, 2));
console.log("Updated Pipeline_5_Agentes.json locally with new webhookId and responseNode.");
