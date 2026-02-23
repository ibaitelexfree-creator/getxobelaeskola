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

describe('HeroCarousel', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
        cleanup();
        vi.unstubAllGlobals();
    });

    it('cleans up requestIdleCallback on unmount', async () => {
        const requestIdleCallbackMock = vi.fn(() => 123);
        const cancelIdleCallbackMock = vi.fn();

        vi.stubGlobal('requestIdleCallback', requestIdleCallbackMock);
        vi.stubGlobal('cancelIdleCallback', cancelIdleCallbackMock);

        const { unmount } = render(<HeroCarousel />);

        expect(requestIdleCallbackMock).toHaveBeenCalled();

        unmount();

        expect(cancelIdleCallbackMock).toHaveBeenCalledWith(123);
    });

    it('cleans up setTimeout on unmount when requestIdleCallback is unavailable', async () => {
        // Ensure requestIdleCallback is NOT available
        vi.stubGlobal('requestIdleCallback', undefined);

        const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

        const { unmount } = render(<HeroCarousel />);

        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('clears interval on unmount if it was already started', async () => {
        let ricCallback: any;
        vi.stubGlobal('requestIdleCallback', vi.fn((cb) => {
            ricCallback = cb;
            return 123;
        }));
        vi.stubGlobal('cancelIdleCallback', vi.fn());

        const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

        const { unmount } = render(<HeroCarousel />);

        // Fire the callback to start the interval
        ricCallback();

        unmount();

        expect(clearIntervalSpy).toHaveBeenCalled();
    });
});
