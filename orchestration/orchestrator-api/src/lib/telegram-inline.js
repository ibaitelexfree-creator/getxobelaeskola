/**
 * Telegram Inline Keyboard Helpers for Swarm CI/CD 2.0
 */

export function buildSwarmInlineKeyboard(swarmId) {
    return {
        inline_keyboard: [
            [
                { text: '✅ Approve & Merge', callback_data: `approve_all_${swarmId}` },
                { text: '🔄 Retry UI', callback_data: `retry_ui_${swarmId}` }
            ],
            [
                { text: '🔍 View Audit', url: `http://localhost:8080` }, // Link to dashboard
                { text: '❌ Cancel', callback_data: `cancel_swarm_${swarmId}` }
            ]
        ]
    };
}

export function buildRateLimitKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '🔓 Reset Gemini', callback_data: 'reset_limit_gemini' },
                { text: '🔓 Reset Grok', callback_data: 'reset_limit_grok' }
            ]
        ]
    };
}
