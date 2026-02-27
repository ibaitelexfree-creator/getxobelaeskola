import axios from 'axios';

/**
 * GitHub Automation for SWARM CI/CD 2.0
 */
export async function createProductionPR(branchName, title, body) {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || 'ibaitelexfree-creator/getxobelaeskola';

    if (!token) throw new Error('GITHUB_TOKEN missing');

    try {
        const response = await axios.post(
            `https://api.github.com/repos/${repo}/pulls`,
            {
                title: `[SWARM] ${title}`,
                head: branchName,
                base: 'main',
                body: body,
                maintainer_can_modify: true
            },
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        return response.data.html_url;
    } catch (error) {
        console.error('GitHub PR Creation Error:', error.response?.data || error.message);
        throw error;
    }
}

export async function mergeBranch(branchName) {
    // Logic to merge automatically if review score > 90
    // (Simplified for now)
    return { success: true, message: "Merge pending manual approval via Telegram button" };
}
