/**
 * Ensures a given redirect URL is safe to navigate to by verifying
 * that it is a relative path starting with '/' but not '//'.
 * Prevents Open Redirect vulnerabilities.
 *
 * @param url The URL to check
 * @param fallback The fallback URL if the provided URL is invalid
 * @returns A safe relative path to redirect to
 */
export function getSafeRedirectUrl(url: string | null | undefined, fallback: string): string {
    if (!url) return fallback;

    // Must start with '/' to be relative, but not '//' to prevent protocol-relative URLs
    if (url.startsWith('/') && !url.startsWith('//')) {
        return url;
    }

    return fallback;
}
