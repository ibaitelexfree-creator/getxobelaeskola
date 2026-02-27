import fs from 'fs';

const filePath = 'c:/Users/User/Desktop/getxobelaeskola/orchestration/n8n-workflows/Pipeline_5_Agentes.json';
const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const qdrantStoreNode = {
    "parameters": {
        "method": "POST",
        "url": "http://qdrant:6333/collections/swarm_v2_audit-history/points",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "{\n  \"points\": [\n    {\n      \"id\": \"{{ $guid }}\",\n      \"vector\": [0.0],\n      \"payload\": {\n        \"prompt\": \"{{ $node['Webhook'].json['body']['prompt'] }}\",\n        \"score\": {{ $node['Agent 6: Auditor'].json['score'] }},\n        \"recommendation\": \"{{ $node['Agent 6: Auditor'].json['recommendation'] }}\",\n        \"reason\": \"{{ $node['Agent 6: Auditor'].json['missed_requirements'].join(', ') }}\",\n        \"timestamp\": \"{{ new Date().toISOString() }}\"\n      }\n    }\n  ]\n}",
        "options": {}
    },
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.1,
    "position": [
        1500,
        0
    ],
    "id": "qdrant-audit-store",
    "name": "Qdrant: Store Audit Memory"
};

// Add the node
workflow.nodes.push(qdrantStoreNode);
if (workflow.activeVersion && workflow.activeVersion.nodes) {
    workflow.activeVersion.nodes.push(qdrantStoreNode);
}

// Connect Auditor to Store Memory and Store Memory to Response
const updateConnections = (conn) => {
    // Redirect Auditor -> Store Memory
    conn["Agent 6: Auditor"].main = [[{ "node": "Qdrant: Store Audit Memory", "type": "main", "index": 0 }]];

    // Add Store Memory -> Respond to Webhook
    conn["Qdrant: Store Audit Memory"] = {
        "main": [[{ "node": "Respond to Webhook", "type": "main", "index": 0 }]]
    };
};

updateConnections(workflow.connections);
if (workflow.activeVersion && workflow.activeVersion.connections) {
    updateConnections(workflow.activeVersion.connections);
}

fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
console.log('✅ Pipeline updated: Qdrant Store Memory node added.');
