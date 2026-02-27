import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const workflowPath = path.join(__dirname, 'n8n-workflows', 'Pipeline_5_Agentes.json');
const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

// Fix JSON body on all HTTP nodes (remove the `=` prefix)
workflowData.nodes.forEach(n => {
    if (n.type === 'n8n-nodes-base.httpRequest' && n.parameters && n.parameters.jsonBody) {
        if (n.parameters.jsonBody.startsWith('=')) {
            n.parameters.jsonBody = n.parameters.jsonBody.substring(1).trim();
        }
    }
});

// Also fix the Webhook Response node. We need to actually send back the data from the Synthesizer node!
const webhookResp = workflowData.nodes.find(n => n.type === 'n8n-nodes-base.respondToWebhook');
if (webhookResp) {
    webhookResp.parameters.respondWith = "allIncomingItems";
}

fs.writeFileSync(workflowPath, JSON.stringify(workflowData, null, 2));
console.log("Updated Pipeline_5_Agentes.json to fix JSON interpolation and Webhook Response parameters.");
