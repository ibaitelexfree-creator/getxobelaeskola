import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook that returns a debounced version of the provided callback.
 * The callback will only be executed after the specified delay has passed since the last invocation.
 *
 * @param callback The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced version of the callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        },
        [callback, delay]
    );
}
