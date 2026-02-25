
-- Seed Fleet Data (Optimist, Laser, J80, Raqueros)

-- 25 Optimist (Vela Ligera, Cap 1)
INSERT INTO public.embarcaciones (nombre, tipo, capacidad, matricula, estado, notas)
SELECT 
    'Optimist ' || lpad(i::text, 2, '0'),
    'vela_ligera',
    1,
    'OPT-' || lpad(i::text, 3, '0'),
    'disponible',
    'Material escuela'
FROM generate_series(1, 25) AS t(i);

-- 20 Laser (Vela Ligera, Cap 1)
INSERT INTO public.embarcaciones (nombre, tipo, capacidad, matricula, estado, notas)
SELECT 
    'Laser ' || lpad(i::text, 2, '0'),
    'vela_ligera',
    1,
    'LAS-' || lpad(i::text, 3, '0'),
    'disponible',
    'Material escuela'
FROM generate_series(1, 20) AS t(i);

-- 2 Raqueros (Vela Ligera/Colectivo, Cap 6)
INSERT INTO public.embarcaciones (nombre, tipo, capacidad, matricula, estado, notas)
VALUES 
    ('Raquero 1', 'vela_ligera', 6, 'RAQ-001', 'disponible', 'Barco escuela colectivo'),
    ('Raquero 2', 'vela_ligera', 6, 'RAQ-002', 'disponible', 'Barco escuela colectivo');

-- 2 J80 (Crucero/Monotipo, Cap 5)
INSERT INTO public.embarcaciones (nombre, tipo, capacidad, matricula, estado, notas)
VALUES 
    ('J80 "Biobizz"', 'crucero', 5, 'J80-001', 'disponible', 'Monotipo competición'),
    ('J80 "Mandovi"', 'crucero', 5, 'J80-002', 'disponible', 'Monotipo escuela');

-- Add some maintenance cases for realism
UPDATE public.embarcaciones SET estado = 'mantenimiento', notas = 'Reparación de fibra' WHERE nombre = 'Optimist 12';
UPDATE public.embarcaciones SET estado = 'averiado', notas = 'Timón roto' WHERE nombre = 'Laser 05';
