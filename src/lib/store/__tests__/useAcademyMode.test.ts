import { describe, it, expect, beforeEach } from 'vitest';
import { useAcademyMode } from '../useAcademyMode';

describe('useAcademyMode Store', () => {
    beforeEach(() => {
        // Reset store state before each test if needed
        // Since persist is used, we might want to clear localstorage if it's being mocked env
        useAcademyMode.getState().setMode('structured');
    });

    it('should have initial mode as structured', () => {
        const { mode } = useAcademyMode.getState();
        expect(mode).toBe('structured');
    });

    it('should update mode using setMode', () => {
        useAcademyMode.getState().setMode('exploration');
        expect(useAcademyMode.getState().mode).toBe('exploration');
    });

    it('should toggle mode using toggleMode', () => {
        useAcademyMode.getState().toggleMode();
        expect(useAcademyMode.getState().mode).toBe('exploration');
        useAcademyMode.getState().toggleMode();
        expect(useAcademyMode.getState().mode).toBe('structured');
    });
});
