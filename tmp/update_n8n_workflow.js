import fs from 'fs';

const filePath = 'c:/Users/User/Desktop/getxobelaeskola/orchestration/n8n-workflows/Pipeline_5_Agentes.json';
const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const qdrantNode = {
    "parameters": {
        "method": "POST",
        "url": "http://qdrant:6333/collections/swarm_v2_audit-history/points/search",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "{\n  \"vector\": [0.0],\n  \"limit\": 3,\n  \"with_payload\": true,\n  \"filter\": {\n    \"must\": [\n      { \"key\": \"recommendation\", \"match\": { \"value\": \"RETRY\" } }\n    ]\n  }\n}",
        "options": {}
    },
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.4,
    "position": [
        1100,
        0
    ],
    "id": "qdrant-audit-fetch",
    "name": "Qdrant: Fetch Audit Context"
};

const auditorNode = {
    "parameters": {
        "method": "POST",
        "url": "https://openrouter.ai/api/v1/chat/completions",
        "sendHeaders": true,
        "headerParameters": {
            "parameters": [
                {
                    "name": "Authorization",
                    "value": "Bearer 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"
                },
                {
                    "name": "HTTP-Referer",
                    "value": "https://scarmonit.com"
                },
                {
                    "name": "X-Title",
                    "value": "n8n Swarm"
                }
            ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "{\n  \"model\": \"google/gemini-2.0-flash-001\",\n  \"temperature\": 0.0,\n  \"response_format\": { \"type\": \"json_object\" },\n  \"messages\": [\n    {\n      \"role\": \"system\",\n      \"content\": \"You are the Quality Auditor. Temperature=0.0. You are DETERMINISTIC.\\n\\nYou receive:\\n1. Original user prompt\\n2. Synthesized instruction (from 5 agents)\\n3. Qdrant historical failures (may be empty)\\n\\nYour job: Score the quality, detect security issues, check for missed requirements, and flag Qdrant conflicts.\\n\\nA Qdrant conflict = true means the synthesized solution is SIMILAR to a solution that previously failed (found in Qdrant history).\\n\\nRESPOND ONLY with this exact JSON schema:\\n{\\n  \\\"score\\\": <1-10>,\\n  \\\"security_check\\\": \\\"PASS\\\" | \\\"FAIL\\\",\\n  \\\"missed_requirements\\\": [\\\"list of missing items\\\"],\\n  \\\"qdrant_conflict\\\": true | false,\\n  \\\"qdrant_similar_failures\\\": [\\\"descriptions of similar past failures\\\"],\\n  \\\"confidence_delta\\\": <-1.0 to +1.0>,\\n  \\\"recommendation\\\": \\\"MERGE\\\" | \\\"RETRY\\\" | \\\"HUMAN_REVIEW\\\"\\n}\\n\\nScoring rules:\\n- 9-10: Perfect, addresses all requirements, no security issues, no past conflicts\\n- 7-8: Good, minor omissions that don't affect core functionality\\n- 5-6: Mediocre, significant gaps or partial security concerns\\n- 1-4: Fail, critical issues, security vulnerabilities, or repeats a known failure\\n\\nrecommendation rules:\\n- MERGE: score >= 7 AND security_check = PASS AND qdrant_conflict = false\\n- HUMAN_REVIEW: score 5-6 OR qdrant_conflict = true with score >= 7\\n- RETRY: score <= 4 OR security_check = FAIL\"\n    },\n    {\n      \"role\": \"user\",\n      \"content\": \"ORIGINAL PROMPT:\\n{{ $node['Webhook'].json['body']['prompt'] }}\\n\\nSYNTHESIZED INSTRUCTION:\\n{{ $node['Agent 5: Synthesizer'].json['choices'][0]['message']['content'] }}\\n\\nQDRANT HISTORICAL FAILURES:\\n{{ $node['Qdrant: Fetch Audit Context'].json['result'] ? JSON.stringify($node['Qdrant: Fetch Audit Context'].json['result'].map(r => r.payload)) : 'No historical failures found.' }}\"\n    }\n  ]\n}",
        "options": {}
    },
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.4,
    "position": [
        1300,
        0
    ],
    "id": "auditor-node",
    "name": "Agent 6: Auditor"
};

// Insert nodes into nodes and activeVersion.nodes
workflow.nodes.splice(6, 0, qdrantNode, auditorNode);
if (workflow.activeVersion && workflow.activeVersion.nodes) {
    workflow.activeVersion.nodes.splice(6, 0, qdrantNode, auditorNode);
}

// Update connections
const updateConnections = (conn) => {
    // Agent 5: Synthesizer should now point to Qdrant: Fetch Audit Context
    conn["Agent 5: Synthesizer"].main = [[{ "node": "Qdrant: Fetch Audit Context", "type": "main", "index": 0 }]];

    // Add Qdrant: Fetch Audit Context -> Agent 6: Auditor
    conn["Qdrant: Fetch Audit Context"] = {
        "main": [[{ "node": "Agent 6: Auditor", "type": "main", "index": 0 }]]
    };

    // Add Agent 6: Auditor -> Respond to Webhook
    conn["Agent 6: Auditor"] = {
        "main": [[{ "node": "Respond to Webhook", "type": "main", "index": 0 }]]
    };
};

updateConnections(workflow.connections);
if (workflow.activeVersion && workflow.activeVersion.connections) {
    updateConnections(workflow.activeVersion.connections);
}

fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
console.log('✅ Pipeline_5_Agentes.json updated with Agent 6 nodes.');
