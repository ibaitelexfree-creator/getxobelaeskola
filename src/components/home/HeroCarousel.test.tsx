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

describe('HeroCarousel Memory Management', () => {
    const originalRIC = window.requestIdleCallback;
    const originalCIC = window.cancelIdleCallback;

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        window.requestIdleCallback = originalRIC;
        window.cancelIdleCallback = originalCIC;
        cleanup();
    });

    it('should cancel requestIdleCallback on unmount', () => {
        const requestIdleCallbackMock = vi.fn(() => 123);
        const cancelIdleCallbackMock = vi.fn();
        window.requestIdleCallback = requestIdleCallbackMock as any;
        window.cancelIdleCallback = cancelIdleCallbackMock as any;

        const { unmount } = render(<HeroCarousel />);

        expect(requestIdleCallbackMock).toHaveBeenCalled();
        unmount();

        expect(cancelIdleCallbackMock).toHaveBeenCalledWith(123);
    });

    it('should NOT start interval if unmounted before requestIdleCallback fires', () => {
        let ricCallback: any;
        const requestIdleCallbackMock = vi.fn((cb) => {
            ricCallback = cb;
            return 123;
        });
        window.requestIdleCallback = requestIdleCallbackMock as any;
        window.cancelIdleCallback = vi.fn() as any;

        const setIntervalSpy = vi.spyOn(window, 'setInterval');

        const { unmount } = render(<HeroCarousel />);

        unmount();

        // Simulate the idle callback firing AFTER unmount
        if (ricCallback) {
            ricCallback();
        }

        expect(setIntervalSpy).not.toHaveBeenCalled();
    });

    it('should clear timeout on unmount if requestIdleCallback is not available', () => {
        // Force fallback to setTimeout
        // @ts-expect-error - Modifying window for testing fallback
        delete window.requestIdleCallback;

        const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
        const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

        const { unmount } = render(<HeroCarousel />);

        expect(setTimeoutSpy).toHaveBeenCalled();
        const timeoutId = setTimeoutSpy.mock.results[0].value;

        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
    });
});
