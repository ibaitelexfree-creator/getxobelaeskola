import { render, cleanup } from '@testing-library/react';
import HeroCarousel from './HeroCarousel';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => (key),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useParams: () => ({ locale: 'es' }),
}));

describe('HeroCarousel Memory Leak Fix', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        cleanup();
    });

    it('should cancel requestIdleCallback on unmount', () => {
        const ricId = 123;
        // @ts-ignore
        window.requestIdleCallback = vi.fn(() => ricId);
        // @ts-ignore
        window.cancelIdleCallback = vi.fn();

        const { unmount } = render(<HeroCarousel />);

        expect(window.requestIdleCallback).toHaveBeenCalled();

        unmount();

        expect(window.cancelIdleCallback).toHaveBeenCalledWith(ricId);
    });

    it('should clear existing interval on unmount', () => {
        let ricCallback: any;
        // @ts-ignore
        window.requestIdleCallback = vi.fn((cb: any) => {
            ricCallback = cb;
            return 1;
        });
        // @ts-ignore
        window.cancelIdleCallback = vi.fn();

        const setIntervalSpy = vi.spyOn(window, 'setInterval');
        const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

        const { unmount } = render(<HeroCarousel />);

        // Fire RIC to start interval
        if (ricCallback) ricCallback();

        const intervalId = setIntervalSpy.mock.results[0]?.value;
        expect(intervalId).toBeDefined();

        unmount();

        expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
    });

    it('should cancel setTimeout on unmount if requestIdleCallback is not available', () => {
        // @ts-ignore
        delete window.requestIdleCallback;
        const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
        const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

        const { unmount } = render(<HeroCarousel />);

        const timeoutId = setTimeoutSpy.mock.results[0]?.value;
        expect(timeoutId).toBeDefined();

        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
    });
});
