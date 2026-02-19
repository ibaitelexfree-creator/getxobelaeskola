import { describe, it, expect } from 'vitest';
import { getRank, getNextRank, calculateEstimatedXP, RANKS } from './ranks';

describe('Ranks Logic', () => {
    describe('getRank', () => {
        it('returns Grumete for 0 XP', () => {
            const rank = getRank(0);
            expect(rank.id).toBe('grumete');
        });

        it('returns Marinero for 200 XP', () => {
            const rank = getRank(200);
            expect(rank.id).toBe('marinero');
        });

        it('returns Marinero for 799 XP', () => {
            const rank = getRank(799);
            expect(rank.id).toBe('marinero');
        });

        it('returns Timonel for 800 XP', () => {
            const rank = getRank(800);
            expect(rank.id).toBe('timonel');
        });

        it('returns Capitan for 10000 XP', () => {
            const rank = getRank(10000);
            expect(rank.id).toBe('capitan');
        });
    });

    describe('getNextRank', () => {
        it('returns Marinero after Grumete', () => {
            const next = getNextRank('grumete');
            expect(next?.id).toBe('marinero');
        });

        it('returns null after Capitan', () => {
            const next = getNextRank('capitan');
            expect(next).toBeNull();
        });
    });

    describe('calculateEstimatedXP', () => {
        it('calculates XP correctly from progress', () => {
            const progress = [
                { tipo_entidad: 'unidad', estado: 'completado' }, // 10
                { tipo_entidad: 'modulo', estado: 'completado' }, // 50
                { tipo_entidad: 'unidad', estado: 'pendiente' },  // 0
            ];
            const xp = calculateEstimatedXP(progress, []);
            expect(xp).toBe(60);
        });

        it('calculates XP correctly from achievements', () => {
            const achievements = [
                { logro: { puntos: 100 } },
                { logro: {} }, // Default 50
            ];
            const xp = calculateEstimatedXP([], achievements);
            expect(xp).toBe(150);
        });

        it('combines progress and achievements XP', () => {
            const progress = [{ tipo_entidad: 'nivel', estado: 'completado' }]; // 500
            const achievements = [{ logro: { puntos: 50 } }];
            const xp = calculateEstimatedXP(progress, achievements);
            expect(xp).toBe(550);
        });
    });
});
