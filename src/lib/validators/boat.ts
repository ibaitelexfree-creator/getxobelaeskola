import { z } from 'zod';

export const BoatStatusEnum = ['disponible', 'mantenimiento', 'en_uso', 'averiado'] as const;

const BaseBoatSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    tipo: z.string().min(1, 'El tipo es obligatorio'),
    capacidad: z.coerce.number()
        .int('La capacidad debe ser un número entero')
        .positive('La capacidad debe ser un número positivo')
        .min(1, 'La capacidad debe ser al menos 1'),
    matricula: z.string().optional().nullable(),
    estado: z.enum(BoatStatusEnum, {
        errorMap: () => ({ message: `Estado inválido. Permitidos: ${BoatStatusEnum.join(', ')}` })
    }),
    notas: z.string().optional().nullable(),
    imagen_url: z.string().optional().nullable(),
    notion_threshold: z.coerce.number().min(0).max(1)
});

export const BoatCreateSchema = BaseBoatSchema.extend({
    estado: BaseBoatSchema.shape.estado.optional().default('disponible'),
    notion_threshold: BaseBoatSchema.shape.notion_threshold.optional().default(0.2)
});

export const BoatUpdateSchema = BaseBoatSchema.partial().extend({
    id: z.string().uuid('ID inválido')
}).refine((data) => {
    // Ensure at least one field besides ID is present
    const keys = Object.keys(data);
    return keys.length > 1;
}, {
    message: "No se enviaron datos para actualizar"
});

export type BoatCreateInput = z.infer<typeof BoatCreateSchema>;
export type BoatUpdateInput = z.infer<typeof BoatUpdateSchema>;
