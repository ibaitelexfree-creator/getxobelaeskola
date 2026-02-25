/**
 * GitHub Integration Module
 * Fetch issues, PRs, and repository information for Jules session context
 */

import https from 'https';

const GITHUB_API = 'api.github.com';

/**
 * Make authenticated GitHub API request
 */
function githubRequest(path, token = null, isBinary = false, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: GITHUB_API,
      port: 443,
      path: path,
      method: method,
      headers: {
        'User-Agent': 'Jules-MCP-Server/1.5.0',
        'Accept': isBinary ? 'application/octet-stream' : 'application/vnd.github.v3+json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `token ${token}`;
    }

    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }

    const req = https.request(options, (response) => {
      if (isBinary) {
        resolve(response);
        return;
      }

      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          try {
            resolve(data ? JSON.parse(data) : { success: true });
          } catch {
            resolve(data);
          }
        } else {
          reject(new Error(`GitHub API error: ${response.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Trigger a GitHub workflow via workflow_dispatch
 */
export async function triggerWorkflowDispatch(owner, repo, workflowId, ref, inputs = {}, token = null) {
  return await githubRequest(`/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`, token, false, 'POST', {
    ref,
    inputs
  });
}

/**
 * List workflow runs for a specific workflow
 */
export async function listWorkflowRuns(owner, repo, workflowId, token = null) {
  return await githubRequest(`/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs?per_page=10`, token);
}

/**
 * Get details of a specific workflow run
 */
export async function getWorkflowRun(owner, repo, runId, token = null) {
  return await githubRequest(`/repos/${owner}/${repo}/actions/runs/${runId}`, token);
}

/**
 * Get jobs for a workflow run to see errors
 */
export async function listWorkflowJobs(owner, repo, runId, token = null) {
  return await githubRequest(`/repos/${owner}/${repo}/actions/runs/${runId}/jobs`, token);
}

/**
 * Fetch a GitHub issue with full context
 */
export async function getIssue(owner, repo, issueNumber, token = null) {
  const issue = await githubRequest(`/repos/${owner}/${repo}/issues/${issueNumber}`, token);

  // Get issue comments for additional context
  let comments = [];
  try {
    comments = await githubRequest(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, token);
  } catch (e) {
    console.warn('[GitHub] Could not fetch comments:', e.message);
  }

  return {
    number: issue.number,
    title: issue.title,
    body: issue.body || '',
    state: issue.state,
    labels: issue.labels?.map(l => l.name) || [],
    author: issue.user?.login,
    createdAt: issue.created_at,
    url: issue.html_url,
    comments: comments.map(c => ({
      author: c.user?.login,
      body: c.body,
      createdAt: c.created_at
    }))
  };
}

/**
 * Fetch all issues with a specific label
 */
export async function getIssuesByLabel(owner, repo, label, token = null) {
  const issues = await githubRequest(
    `/repos/${owner}/${repo}/issues?labels=${encodeURIComponent(label)}&state=open`,
    token
  );

  return issues.map(issue => ({
    number: issue.number,
    title: issue.title,
    body: issue.body || '',
    labels: issue.labels?.map(l => l.name) || [],
    author: issue.user?.login,
    url: issue.html_url
  }));
}

/**
 * Format issue context for Jules prompt
 */
export function formatIssueForPrompt(issue) {
  let prompt = `Fix GitHub Issue #${issue.number}: ${issue.title}\n\n`;
  prompt += `## Issue Description\n${issue.body}\n\n`;

  if (issue.labels?.length > 0) {
    prompt += `## Labels\n${issue.labels.join(', ')}\n\n`;
  }

  if (issue.comments?.length > 0) {
    prompt += `## Discussion Context\n`;
    issue.comments.slice(-3).forEach(c => {
      prompt += `- @${c.author}: ${c.body.substring(0, 200)}${c.body.length > 200 ? '...' : ''}\n`;
    });
  }

  prompt += `\n## Instructions\n`;
  prompt += `1. Analyze the issue and identify the root cause\n`;
  prompt += `2. Implement a fix that addresses the problem\n`;
  prompt += `3. Add appropriate tests to prevent regression\n`;
  prompt += `4. Update any relevant documentation\n`;

  return prompt;
}

/**
 * Find a Pull Request by branch name
 */
export async function getPrByBranch(owner, repo, branch, token = null) {
  const prs = await githubRequest(`/repos/${owner}/${repo}/pulls?head=${owner}:${branch}&state=open`, token);
  return prs.length > 0 ? prs[0] : null;
}

/**
 * Get repository information
 */
export async function getRepoInfo(owner, repo, token = null) {
  return await githubRequest(`/repos/${owner}/${repo}`, token);
}

/**
 * List all releases for a repository
 */
export async function listReleases(owner, repo, token = null) {
  return await githubRequest(`/repos/${owner}/${repo}/releases`, token);
}

/**
 * Get a specific release asset by ID
 */
export async function getAsset(owner, repo, assetId, token = null) {
  return await githubRequest(`/repos/${owner}/${repo}/releases/assets/${assetId}`, token);
}

/**
 * Download a specific release asset binary
 */
export async function downloadAsset(owner, repo, assetId, token = null) {
  return await githubRequest(`/repos/${owner}/${repo}/releases/assets/${assetId}`, token, true);
}

/**
 * Downloading logs for a specific job
 */
export async function getWorkflowJobLogs(owner, repo, jobId, token = null) {
  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Antigravity-Node-Client'
    };
    if (token) headers['Authorization'] = `token ${token}`;

    const url = `https://api.github.com/repos/${owner}/${repo}/actions/jobs/${jobId}/logs`;
    // We must handle the redirect properly or just fetch returning text
    const response = await fetch(url, { headers, redirect: 'follow' });

    if (!response.ok) {
      console.warn(`[github] Warning: Failed to fetch logs for job ${jobId}. Status: ${response.status}`);
      return "Logs not available or expired.";
    }

    return await response.text();
  } catch (error) {
    console.error(`[github] Error fetching logs for job ${jobId}:`, error.message);
    return `Error fetching logs: ${error.message}`;
  }
}

export default {
  getIssue,
  getIssuesByLabel,
  getPrByBranch,
  formatIssueForPrompt,
  getRepoInfo,
  listReleases,
  getAsset,
  downloadAsset,
  triggerWorkflowDispatch,
  listWorkflowRuns,
  getWorkflowRun,
  listWorkflowJobs,
  getWorkflowJobLogs
};
