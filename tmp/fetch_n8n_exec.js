import fs from 'fs';
const N8N_URL = 'https://n8n.srv1368175.hstgr.cloud/api/v1';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYmY3NGMyNS0yMTNjLTQ2YjktYTYzYi1lMzQ5ZGUwMjE5NWYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNmJiMDEyMWUtNDc0Yi00NTIyLWI3MWMtMWJhZTZkZGRmYmMzIiwiaWF0IjoxNzcyMDkxNjE3fQ.sXFkMQMerkFpR6cnmliYVR25yumpL92A8Yy_6Pu9rnI';

async function getExecutionDetails(executionId) {
    const url = `${N8N_URL}/executions/${executionId}?includeData=true`;
    const response = await fetch(url, {
        headers: { "X-N8N-API-KEY": N8N_API_KEY }
    });
    const data = await response.json();
    fs.writeFileSync(`exec_${executionId}.json`, JSON.stringify(data, null, 2));
    console.log(`Saved to exec_${executionId}.json`);
}

getExecutionDetails('987');
