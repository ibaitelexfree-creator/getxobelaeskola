import { z } from 'zod';

export const boatTypeEnum = z.enum(['vela_ligera', 'crucero', 'motor', 'kayak', 'other']);
export const boatStatusEnum = z.enum(['disponible', 'mantenimiento', 'averiado', 'en_uso']);

// Helper to treat null as undefined for default values
const nullToUndefined = (val: unknown) => (val === null ? undefined : val);

// Base schema: defines shape and constraints
// Note: We don't export this one directly as it's a building block
// Fields that can be null in DB should be nullable here.
const baseBoatSchema = z.object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
    tipo: boatTypeEnum, // Required in base
    capacidad: z.coerce.number().int().positive('La capacidad debe ser un número positivo'),
    matricula: z.string().trim().nullable().optional(), // Allow null for update
    estado: boatStatusEnum.optional(), // Enums usually not nullable
    notas: z.string().trim().nullable().optional(), // Text fields often nullable
    imagen_url: z.string().trim().nullable().optional(),
    notion_threshold: z.coerce.number().optional()
});

// Create schema: strict requirements + defaults
// We use preprocess to handle nulls gracefully (converting to undefined so default kicks in)
export const boatSchema = baseBoatSchema.extend({
    matricula: z.preprocess(nullToUndefined, z.string().trim().nullable().optional().default('')),
    estado: z.preprocess(nullToUndefined, boatStatusEnum.optional().default('disponible')),
    notas: z.preprocess(nullToUndefined, z.string().trim().nullable().optional().default('')),
    imagen_url: z.preprocess(nullToUndefined, z.string().trim().nullable().optional().default('')),
    notion_threshold: z.preprocess(nullToUndefined, z.coerce.number().optional().default(0.2))
});

// Update schema: partial updates
// We use the base schema partial so we don't apply defaults (we only update what's sent)
export const boatUpdateSchema = baseBoatSchema.partial().extend({
    id: z.string().min(1, 'ID es obligatorio')
});
