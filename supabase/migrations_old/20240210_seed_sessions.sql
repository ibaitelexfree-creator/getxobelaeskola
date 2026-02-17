
-- Seed Sessions Data (Sesiones de prueba)

DO $$ 
DECLARE
    v_curso_id_1 UUID;
    v_curso_id_2 UUID;
    v_instructor_id_1 UUID;
    v_instructor_id_2 UUID;
    v_boat_id_1 UUID;
    v_boat_id_2 UUID;
BEGIN
    -- Get some real IDs to ensure constraints pass
    SELECT id INTO v_curso_id_1 FROM public.cursos LIMIT 1;
    SELECT id INTO v_curso_id_2 FROM public.cursos OFFSET 1 LIMIT 1;
    
    SELECT id INTO v_instructor_id_1 FROM public.profiles WHERE rol IN ('admin', 'instructor') LIMIT 1;
    SELECT id INTO v_instructor_id_2 FROM public.profiles WHERE rol IN ('admin', 'instructor') OFFSET 1 LIMIT 1;
    
    SELECT id INTO v_boat_id_1 FROM public.embarcaciones WHERE tipo = 'vela_ligera' LIMIT 1;
    SELECT id INTO v_boat_id_2 FROM public.embarcaciones WHERE tipo = 'crucero' LIMIT 1;

    -- If we don't have enough data, these might be null, but we'll try to insert anyway for structure
    -- In a real scenario, we'd handle nulls, but here we assume previous seeds ran.

    -- Session 1: Realizada (Past)
    INSERT INTO public.sesiones (curso_id, instructor_id, embarcacion_id, fecha_inicio, fecha_fin, estado, observaciones)
    VALUES (v_curso_id_1, v_instructor_id_1, v_boat_id_1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days 2 hours', 'realizada', 'Viento N 12 nudos. Buena progresión del grupo.');

    -- Session 2: En Curso (Now)
    INSERT INTO public.sesiones (curso_id, instructor_id, embarcacion_id, fecha_inicio, fecha_fin, estado, observaciones)
    VALUES (v_curso_id_2, v_instructor_id_2, v_boat_id_2, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '1 hour', 'en_curso', 'Entrenamiento intensivo de maniobras.');

    -- Session 3: Programada (Future)
    INSERT INTO public.sesiones (curso_id, instructor_id, embarcacion_id, fecha_inicio, fecha_fin, estado, observaciones)
    VALUES (v_curso_id_1, v_instructor_id_1, v_boat_id_1, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 3 hours', 'programada', 'Chequear previsión de viento fuerte.');

    -- Session 4: Programada (Future 2)
    INSERT INTO public.sesiones (curso_id, instructor_id, embarcacion_id, fecha_inicio, fecha_fin, estado, observaciones)
    VALUES (v_curso_id_2, v_instructor_id_1, NULL, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', 'programada', 'Teoría en aula antes de ir al agua.');

END $$;
