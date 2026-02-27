import { callOpenRouter } from './openrouter-client.js';

/**
 * Advanced Vulnerability Scanner using AI
 * Based on OWASP 2025 principles
 */
export async function scanCodeSecurity(filePath, codeContent) {
    const systemPrompt = `
You are the Swarm Security Auditor (OWASP 2025 Expert).
Scan the following code for vulnerabilities:
1. SQL Injection / NoSQL Injection.
2. Cross-Site Scripting (XSS).
3. Hardcoded Secrets (Keys, Passwords).
4. Unprotected API Endpoints.
5. Insecure Dependency Usage.

RESPONSE FORMAT: JSON
{
    "risk_score": 0-10,
    "vulnerabilities": [
        {
            "type": "Vulnerability Type",
            "severity": "CRITICAL | HIGH | MEDIUM | LOW",
            "line": 0,
            "description": "Short explanation",
            "fix": "Recommended fix"
        }
    ],
    "recommendations": ["General best practices"]
}
`;

    try {
        const result = await callOpenRouter({
            model: process.env.OPENROUTER_SECURITY_MODEL || process.env.OPENROUTER_MODEL,
            prompt: `Scan this file [${filePath}]:\n\n${codeContent}`,
            systemPrompt,
            temperature: 0.1,
            jsonMode: true
        });

        return result;
    } catch (error) {
        console.error('Security Scan Error:', error.message);
        return { risk_score: 0, vulnerabilities: [], error: error.message };
    }
}
