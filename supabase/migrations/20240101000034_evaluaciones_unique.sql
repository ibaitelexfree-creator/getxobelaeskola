-- Add unique constraint to evaluaciones to support upsert by entity
ALTER TABLE public.evaluaciones 
ADD CONSTRAINT unique_evaluacion_entidad UNIQUE (entidad_tipo, entidad_id);
