import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Records token usage for a specific tenant.
 * Fails open (logs errors but does not throw) to prevent impacting the main request flow.
 *
 * @param tenantId The identifier for the tenant (user ID or organization ID).
 * @param tokens The number of tokens consumed.
 * @param path The API path or feature identifier where usage occurred.
 * @param model Optional model identifier (e.g., 'gpt-4').
 */
export async function recordTokenUsage(tenantId: string, tokens: number, path: string, model?: string) {
    try {
        // Ensure we don't crash if environment variables are missing (e.g. in CI or local without secrets)
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.warn('Skipping token usage recording: Missing Supabase credentials.');
            return;
        }

        const supabase = createAdminClient();

        const { error } = await supabase.from('token_usage').insert({
            tenant_id: tenantId,
            tokens,
            path,
            model,
        });

        if (error) {
            console.error('Error recording token usage:', error.message, error.details);
        }
    } catch (err) {
        console.error('Unexpected error in recordTokenUsage:', err);
    }
}
