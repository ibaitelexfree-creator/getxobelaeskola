import { describe, it, expect } from 'vitest';
import { BoatCreateSchema, BoatUpdateSchema } from '@/lib/validators/boat';

describe('Boat Validation Schemas', () => {
    describe('BoatCreateSchema', () => {
        it('validates a correct boat', () => {
            const validBoat = {
                nombre: 'Barco 1',
                tipo: 'vela_ligera',
                capacidad: 5,
                estado: 'disponible'
            };
            const result = BoatCreateSchema.safeParse(validBoat);
            expect(result.success).toBe(true);
        });

        it('rejects negative capacity', () => {
            const invalidBoat = {
                nombre: 'Barco 2',
                tipo: 'motor',
                capacidad: -1,
                estado: 'disponible'
            };
            const result = BoatCreateSchema.safeParse(invalidBoat);
            expect(result.success).toBe(false);
            if (!result.success) {
                // Ensure error message mentions positive
                const msg = result.error.issues.map(i => i.message).join(' ');
                expect(msg).toMatch(/positivo|min/i);
            }
        });

        it('rejects zero capacity', () => {
             const invalidBoat = {
                nombre: 'Barco 2',
                tipo: 'motor',
                capacidad: 0,
                estado: 'disponible'
            };
            const result = BoatCreateSchema.safeParse(invalidBoat);
            expect(result.success).toBe(false);
        });

        it('rejects invalid status', () => {
            const invalidBoat = {
                nombre: 'Barco 3',
                tipo: 'crucero',
                capacidad: 10,
                estado: 'volando' // Invalid
            };
            const result = BoatCreateSchema.safeParse(invalidBoat);
            expect(result.success).toBe(false);
            if (!result.success) {
                const msg = result.error.issues.map(i => i.message).join(' ');
                // Flexible check for either custom or default Zod message
                expect(msg).toMatch(/Estado inválido|Invalid option|expected one of/i);
            }
        });

        it('coerces string capacity to number', () => {
            const validBoat = {
                nombre: 'Barco 4',
                tipo: 'vela_ligera',
                capacidad: '4',
                estado: 'mantenimiento'
            };
            const result = BoatCreateSchema.safeParse(validBoat);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.capacidad).toBe(4);
            }
        });
    });

    describe('BoatUpdateSchema', () => {
        it('validates a correct update', () => {
            const validUpdate = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                estado: 'averiado'
            };
            const result = BoatUpdateSchema.safeParse(validUpdate);
            expect(result.success).toBe(true);
        });

        it('requires ID', () => {
            const invalidUpdate = {
                estado: 'averiado'
            };
            const result = BoatUpdateSchema.safeParse(invalidUpdate);
            expect(result.success).toBe(false);
        });

        it('rejects invalid UUID', () => {
             const invalidUpdate = {
                id: '123',
                estado: 'averiado'
            };
            const result = BoatUpdateSchema.safeParse(invalidUpdate);
            expect(result.success).toBe(false);
        });

        it('rejects update with only ID (no data)', () => {
            const invalidUpdate = {
                id: '123e4567-e89b-12d3-a456-426614174000'
            };
            const result = BoatUpdateSchema.safeParse(invalidUpdate);
            expect(result.success).toBe(false);
            if (!result.success) {
                 const msg = result.error.issues.map(i => i.message).join(' ');
                 expect(msg).toContain('No se enviaron datos');
            }
        });

        it('validates capacity in update strictly', () => {
            const invalidUpdate = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                capacidad: -5
            };
            const result = BoatUpdateSchema.safeParse(invalidUpdate);
            expect(result.success).toBe(false);
        });
    });
});
