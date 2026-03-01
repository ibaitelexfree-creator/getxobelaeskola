/**
 * Utility to optimize external image URLs (Unsplash, Pexels)
 * 
 * @param url The original image URL
 * @param width Optional width (default 1200)
 * @param quality Optional quality (default 80)
 * @returns Optimized URL
 */
export function getOptimizedExternalImage(url: string, width: number = 1200, quality: number = 80): string {
    if (!url) return url;

    try {
        const urlObj = new URL(url);

        // Unsplash Optimization
        if (urlObj.hostname.includes('unsplash.com')) {
            urlObj.searchParams.set('w', width.toString());
            urlObj.searchParams.set('q', quality.toString());
            urlObj.searchParams.set('auto', 'format');
            urlObj.searchParams.set('fit', 'max');
            return urlObj.toString();
        }

        // Pexels Optimization
        if (urlObj.hostname.includes('pexels.com')) {
            // Pexels uses 'h' or 'w' as parameters
            urlObj.searchParams.set('auto', 'compress');
            urlObj.searchParams.set('cs', 'tinysrgb');
            urlObj.searchParams.set('w', width.toString());
            return urlObj.toString();
        }

        // Supabase Optimization (if using Supabase storage transformation)
        if (urlObj.hostname.includes('supabase.co')) {
            // Note: Only works if transformation is enabled and path is correctly structured
            // For now, we just return the original or add standard params if applicable
            return url;
        }

        return url;
    } catch (e) {
        // If it's not a valid absolute URL (e.g. local path), return as is
        return url;
    }
}
