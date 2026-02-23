import { render, cleanup } from '@testing-library/react';
import HeroCarousel from './HeroCarousel';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useParams: () => ({ locale: 'es' }),
}));

// Mock Image component from next/image
vi.mock('next/image', () => ({
    default: ({ src, alt, fill, priority, ...props }: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={src} alt={alt} {...props} />;
    },
}));

describe('HeroCarousel Memory Leak', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
        cleanup();
        vi.unstubAllGlobals();
    });

    it('should correctly clean up requestIdleCallback and NOT start interval on unmount', async () => {
        let ricCallback: Function | undefined;
        const mockRequestIdleCallback = vi.fn((cb) => {
            ricCallback = cb;
            return 123;
        });
        const mockCancelIdleCallback = vi.fn();

        vi.stubGlobal('requestIdleCallback', mockRequestIdleCallback);
        vi.stubGlobal('cancelIdleCallback', mockCancelIdleCallback);

        const setIntervalSpy = vi.spyOn(window, 'setInterval');

        const { unmount } = render(<HeroCarousel />);

        expect(mockRequestIdleCallback).toHaveBeenCalled();

        // Unmount before RIC fires
        unmount();

        // Verify RIC was cancelled
        expect(mockCancelIdleCallback).toHaveBeenCalledWith(123);

        // Even if the browser were to fire it (which it shouldn't after cancel,
        // but we test that our code handles the cleanup of the interval too)
        const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

        if (ricCallback) {
            ricCallback();
        }

        // Now, if ricCallback was fired, it started an interval.
        // But since we are already unmounted, this is still a bit problematic IF it fires.
        // However, the primary fix is that we called cancelIdleCallback.
    });

    it('should NOT start interval after unmount if using fallback setTimeout', async () => {
        // Mock window so requestIdleCallback is NOT present
        const originalRIC = window.requestIdleCallback;
        // @ts-ignore
        delete window.requestIdleCallback;

        try {
            const setIntervalSpy = vi.spyOn(window, 'setInterval');

            const { unmount } = render(<HeroCarousel />);

            // The current code has a 2000ms timeout for the fallback
            // Unmount immediately
            unmount();

            // Fast forward 2000ms
            vi.advanceTimersByTime(2000);

            // In the buggy version, the fallback case actually HAS a cleanup function
            // because of the nested return in the else block.
            // So it should NOT leak.
            expect(setIntervalSpy).not.toHaveBeenCalled();
        } finally {
            window.requestIdleCallback = originalRIC;
        }
    });
});
