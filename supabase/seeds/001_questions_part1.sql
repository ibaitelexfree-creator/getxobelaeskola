<<<<<<< HEAD
-- =====================================================
-- SEED: Banco de Preguntas - Parte 1 (Unidades 1-4)
-- =====================================================
-- Fuente: contenido_academico/curso1_banco_preguntas_parte1.md
-- Total Preguntas: 68

DO $$
DECLARE
    v_unidad_id UUID;
BEGIN

    -- =====================================================
    -- UNIDAD 1: Seguridad en el Mar (Preguntas 1-17)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'seguridad-en-el-mar';
    
    IF v_unidad_id IS NOT NULL THEN
        -- Borrar preguntas anteriores de esta unidad para evitar duplicados en desarrollo
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 1
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál es el elemento de seguridad personal OBLIGATORIO en todo momento a bordo?',
            'Zein da ontzian uneoro derrigorrezkoa den segurtasun pertsonaleko elementua?',
            '[{"id": "A", "texto": "Gafas de sol"}, {"id": "B", "texto": "Chaleco salvavidas"}, {"id": "C", "texto": "Guantes de navegación"}, {"id": "D", "texto": "Casco"}]'::jsonb,
            'B', 1, 'seguridad');

        -- Pregunta 2
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Antes de salir a navegar, ¿qué debes consultar siempre?',
            'Nabigatzera irten aurretik, zer kontsultatu behar duzu beti?',
            '[{"id": "A", "texto": "El horario de la escuela"}, {"id": "B", "texto": "El parte meteorológico"}, {"id": "C", "texto": "La temperatura del agua"}, {"id": "D", "texto": "Las mareas de la semana siguiente"}]'::jsonb,
            'B', 1, 'seguridad');

        -- Pregunta 3
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Si alguien cae al agua, ¿cuál es lo PRIMERO que debes hacer?',
            'Norbait uretara erortzen bada, zer da EGIN behar duzun lehen gauza?',
            '[{"id": "A", "texto": "Lanzarte al agua para rescatarle"}, {"id": "B", "texto": "Llamar por teléfono"}, {"id": "C", "texto": "Gritar \"¡Hombre al agua!\" y no perderle de vista"}, {"id": "D", "texto": "Dar la vuelta al barco inmediatamente"}]'::jsonb,
            'C', 1, 'seguridad');

        -- Pregunta 4
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'En caso de vuelco del barco, ¿qué debes hacer?',
            'Ontzia irauliz gero, zer egin behar duzu?',
            '[{"id": "A", "texto": "Nadar hacia la costa lo más rápido posible"}, {"id": "B", "texto": "Abandonar el barco y pedir ayuda"}, {"id": "C", "texto": "Agarrarte al barco y nunca abandonarlo"}, {"id": "D", "texto": "Quitarte el chaleco para nadar mejor"}]'::jsonb,
            'C', 1, 'seguridad');

        -- Pregunta 5
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué significa levantar un brazo en alto cuando estás en el agua?',
            'Zer esan nahi du besoa altxatzeak uretan zaudenean?',
            '[{"id": "A", "texto": "Saludo a otros barcos"}, {"id": "B", "texto": "Necesito ayuda"}, {"id": "C", "texto": "Todo está bien"}, {"id": "D", "texto": "Voy a virar"}]'::jsonb,
            'B', 1, 'seguridad');

        -- Pregunta 6
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué factor de protección solar mínimo se recomienda para navegar?',
            'Zer eguzki-babes faktore gutxieneko gomendatzen da nabigatzeko?',
            '[{"id": "A", "texto": "Factor 15"}, {"id": "B", "texto": "Factor 30"}, {"id": "C", "texto": "Factor 50+"}, {"id": "D", "texto": "No es necesario"}]'::jsonb,
            'C', 1, 'seguridad');
    
        -- Pregunta 7
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Si tienes dudas sobre las condiciones meteorológicas, ¿qué debes hacer?',
            'Eguraldi baldintzei buruzko zalantzak badituzu, zer egin behar duzu?',
            '[{"id": "A", "texto": "Salir y probar cómo están las condiciones"}, {"id": "B", "texto": "Preguntar a otro alumno"}, {"id": "C", "texto": "NO salir a navegar"}, {"id": "D", "texto": "Salir solo un rato corto"}]'::jsonb,
            'C', 1, 'seguridad');

        -- Pregunta 8
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué tipo de calzado es adecuado para navegar?',
            'Zer oinetako mota da egokia nabigatzeko?',
            '[{"id": "A", "texto": "Chanclas abiertas"}, {"id": "B", "texto": "Zapatillas de deporte normales"}, {"id": "C", "texto": "Calzado náutico con suela antideslizante"}, {"id": "D", "texto": "Descalzo siempre"}]'::jsonb,
            'C', 1, 'seguridad');

        -- Pregunta 9
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál NO es un procedimiento de emergencia correcto?',
            'Zein EZ da larrialdi-prozedura zuzena?',
            '[{"id": "A", "texto": "Mantener la calma en caso de vuelco"}, {"id": "B", "texto": "Abandonar el barco para nadar a la costa"}, {"id": "C", "texto": "Lanzar el aro salvavidas a quien cae al agua"}, {"id": "D", "texto": "Avisar al instructor inmediatamente"}]'::jsonb,
            'B', 1, 'seguridad');

        -- Pregunta 10
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Con qué señal avisas de que todo está bien?',
            'Zer seinalerekin abisatzen duzu dena ondo dagoela?',
            '[{"id": "A", "texto": "Un brazo en alto"}, {"id": "B", "texto": "Los dos brazos en cruz"}, {"id": "C", "texto": "Silbato continuo"}, {"id": "D", "texto": "Agitar una bandera"}]'::jsonb,
            'B', 1, 'seguridad');
        
        -- Pregunta 11
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué debes hacer SIEMPRE antes de salir a navegar respecto a tierra?',
            'Zer egin behar duzu BETI nabigatzera irten aurretik lurrari dagokionez?',
            '[{"id": "A", "texto": "Publicarlo en redes sociales"}, {"id": "B", "texto": "Avisar a alguien de tu plan y hora de regreso"}, {"id": "C", "texto": "Enviar un correo electrónico"}, {"id": "D", "texto": "Nada especial"}]'::jsonb,
            'B', 1, 'seguridad');
            
        -- Pregunta 12
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Por qué es importante llevar gafas de sol con cordón?',
            'Zergatik da garrantzitsua eguzkitako betaurrekoak kordoiarekin eramatea?',
            '[{"id": "A", "texto": "Para que no se caigan al agua y las pierdas"}, {"id": "B", "texto": "Por moda náutica"}, {"id": "C", "texto": "Para proteger las gafas del sol"}, {"id": "D", "texto": "No es importante, es opcional"}]'::jsonb,
            'A', 1, 'seguridad');

        -- Pregunta 13
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué NO debes arrojar al mar?',
            'Zer EZ duzu itsasora bota behar?',
            '[{"id": "A", "texto": "Solo plásticos"}, {"id": "B", "texto": "Solo aceites"}, {"id": "C", "texto": "Nada, ningún tipo de basura"}, {"id": "D", "texto": "Solo residuos orgánicos"}]'::jsonb,
            'C', 1, 'seguridad');

        -- Pregunta 14
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuándo puedes navegar sin chaleco salvavidas?',
            'Noiz nabiga dezakezu salbamendu-jakarik gabe?',
            '[{"id": "A", "texto": "Cuando hace calor"}, {"id": "B", "texto": "Cuando el agua está tranquila"}, {"id": "C", "texto": "Cuando sabes nadar muy bien"}, {"id": "D", "texto": "Nunca, es obligatorio siempre"}]'::jsonb,
            'D', 1, 'seguridad');

        -- Pregunta 15
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'El silbato del chaleco sirve para:',
            'Jakaren txilibitua zertarako da?',
            '[{"id": "A", "texto": "Llamar a los delfines"}, {"id": "B", "texto": "Señalar emergencia o llamar la atención"}, {"id": "C", "texto": "Indicar que todo va bien"}, {"id": "D", "texto": "Avisar de una virada"}]'::jsonb,
            'B', 1, 'seguridad');

        -- Pregunta 16
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué debes comprobar del estado de la mar antes de salir?',
            'Zer egiaztatu behar duzu itsasoaren egoeraz irten aurretik?',
            '[{"id": "A", "texto": "Solo la temperatura del agua"}, {"id": "B", "texto": "La dirección e intensidad del viento, el estado de la mar y la hora de la marea"}, {"id": "C", "texto": "Solo la dirección del viento"}, {"id": "D", "texto": "Solo si hay olas grandes"}]'::jsonb,
            'B', 1, 'seguridad');

        -- Pregunta 17
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál es la distancia segura que debes mantener respecto a bañistas?',
            'Zein da bainulariekiko mantendu behar duzun distantzia segurua?',
            '[{"id": "A", "texto": "No hay regla específica"}, {"id": "B", "texto": "La que marquen las boyas de la zona de baño"}, {"id": "C", "texto": "Al menos 5 metros"}, {"id": "D", "texto": "Solo en verano hay restricción"}]'::jsonb,
            'B', 1, 'seguridad');

    ELSE
        RAISE NOTICE 'Unidad "Seguridad en el Mar" no encontrada. Saltando preguntas.';
    END IF;


    -- =====================================================
    -- UNIDAD 2: Partes del Barco (Preguntas 18-34)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'partes-del-barco';
    
    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';
        
        -- Pregunta 18
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cómo se llama la parte delantera del barco?',
            'Nola deitzen da ontziaren aurreko partea?',
            '[{"id": "A", "texto": "Popa"}, {"id": "B", "texto": "Babor"}, {"id": "C", "texto": "Proa"}, {"id": "D", "texto": "Estribor"}]'::jsonb,
            'C', 1, 'teoria');
            
        -- Pregunta 19
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Babor es el lado…',
            'Babor da…',
            '[{"id": "A", "texto": "Derecho mirando hacia proa"}, {"id": "B", "texto": "Izquierdo mirando hacia popa"}, {"id": "C", "texto": "Izquierdo mirando hacia proa"}, {"id": "D", "texto": "Delantero del barco"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 20
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué elemento del barco controla la dirección?',
            'Ontziaren zein elementuk kontrolatzen du norabidea?',
            '[{"id": "A", "texto": "La orza"}, {"id": "B", "texto": "La escota"}, {"id": "C", "texto": "El timón"}, {"id": "D", "texto": "El mástil"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 21
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'La driza es el cabo que sirve para:',
            'Driza zertarako balio duen kaboa da?',
            '[{"id": "A", "texto": "Controlar el ángulo de la vela"}, {"id": "B", "texto": "Izar (subir) la vela"}, {"id": "C", "texto": "Amarrar el barco al puerto"}, {"id": "D", "texto": "Sujetar el timón"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 22
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué función tiene la orza?',
            'Zer funtzio du orzak?',
            '[{"id": "A", "texto": "Dar dirección al barco"}, {"id": "B", "texto": "Sujetar el mástil"}, {"id": "C", "texto": "Evitar que el barco derive lateralmente"}, {"id": "D", "texto": "Controlar la velocidad"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 23
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'La botavara es:',
            'Botavara da:',
            '[{"id": "A", "texto": "El palo vertical que sujeta la vela"}, {"id": "B", "texto": "El palo horizontal que sujeta la parte inferior de la vela mayor"}, {"id": "C", "texto": "El cable que sujeta el mástil"}, {"id": "D", "texto": "La pieza donde se apoya el mástil"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 24
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cómo se llama la parte del casco que está bajo el agua?',
            'Nola deitzen da ur azpian dagoen kroskoaren partea?',
            '[{"id": "A", "texto": "Obra muerta"}, {"id": "B", "texto": "Cubierta"}, {"id": "C", "texto": "Obra viva"}, {"id": "D", "texto": "Superestructura"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 25
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuántas letras tiene "BABOR"?',
            'Zenbat letra ditu "BABOR" hitzak?',
            '[{"id": "A", "texto": "4"}, {"id": "B", "texto": "5"}, {"id": "C", "texto": "6"}, {"id": "D", "texto": "7"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 26
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'La escota de mayor controla:',
            'Eskota nagusiak kontrolatzen du:',
            '[{"id": "A", "texto": "La altura del mástil"}, {"id": "B", "texto": "La dirección del barco"}, {"id": "C", "texto": "El ángulo de la vela mayor respecto al viento"}, {"id": "D", "texto": "La profundidad de la orza"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 27
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cómo se llama la palanca que mueves para dirigir el barco?',
            'Nola deitzen da ontzia gidatzeko mugitzen duzun palanka?',
            '[{"id": "A", "texto": "Timón"}, {"id": "B", "texto": "Caña del timón"}, {"id": "C", "texto": "Pala del timón"}, {"id": "D", "texto": "Botavara"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 28
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'El foque es:',
            'Fokea da:',
            '[{"id": "A", "texto": "La vela principal del barco"}, {"id": "B", "texto": "La vela delantera"}, {"id": "C", "texto": "Una parte del timón"}, {"id": "D", "texto": "Un tipo de nudo"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 29
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué lado del barco lleva luz verde de noche?',
            'Ontziaren zein aldek darama argi berdea gauez?',
            '[{"id": "A", "texto": "Babor"}, {"id": "B", "texto": "Estribor"}, {"id": "C", "texto": "Proa"}, {"id": "D", "texto": "Popa"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 30
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué son los obenques?',
            'Zer dira obenkeak?',
            '[{"id": "A", "texto": "Cabos que controlan las velas"}, {"id": "B", "texto": "Cables laterales que sujetan el mástil"}, {"id": "C", "texto": "Partes del timón"}, {"id": "D", "texto": "Tipos de nudos"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 31
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'La popa es:',
            'Popa da:',
            '[{"id": "A", "texto": "La parte delantera del barco"}, {"id": "B", "texto": "La parte trasera del barco"}, {"id": "C", "texto": "El lado izquierdo"}, {"id": "D", "texto": "El lado derecho"}]'::jsonb,
            'B', 1, 'teoria');
        
        -- Pregunta 32
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'En un Optimist, la orza es:',
            'Optimist batean, orza da:',
            '[{"id": "A", "texto": "Fija y no se puede mover"}, {"id": "B", "texto": "Abatible (se puede levantar)"}, {"id": "C", "texto": "Inexistente"}, {"id": "D", "texto": "De quilla fija"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 33
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cómo se llama el orificio donde se inserta el mástil en la cubierta?',
            'Nola deitzen da zuloa non masta sartzen den estalkian?',
            '[{"id": "A", "texto": "Carlinga"}, {"id": "B", "texto": "Fogonadura"}, {"id": "C", "texto": "Cornamusa"}, {"id": "D", "texto": "Cadeneta"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 34
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué parte del casco está sobre el agua?',
            'Kroskoaren zein parte dago ur gainean?',
            '[{"id": "A", "texto": "Obra viva"}, {"id": "B", "texto": "Carena"}, {"id": "C", "texto": "Obra muerta"}, {"id": "D", "texto": "Quilla"}]'::jsonb,
            'C', 1, 'teoria');

    ELSE
        RAISE NOTICE 'Unidad "Partes del Barco" no encontrada. Saltando preguntas.';
    END IF;


    -- =====================================================
    -- UNIDAD 3: Cómo Funciona la Vela (Preguntas 35-51)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'como-funciona-la-vela';
    
    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 35
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál es la forma MÁS eficiente de propulsión a vela?',
            'Zein da bela bidezko propultsio modurik eraginkorrena?',
            '[{"id": "A", "texto": "Empuje directo (viento de popa)"}, {"id": "B", "texto": "Sustentación aerodinámica (viento de través)"}, {"id": "C", "texto": "Remolque por otra embarcación"}, {"id": "D", "texto": "Motor auxiliar"}]'::jsonb,
            'B', 1, 'fisica');

        -- Pregunta 36
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'El viento aparente es:',
            'Itxurazko haizea da:',
            '[{"id": "A", "texto": "El viento real que sopla en la zona"}, {"id": "B", "texto": "La combinación del viento real y el viento creado por el movimiento del barco"}, {"id": "C", "texto": "El viento que aparece solo por la tarde"}, {"id": "D", "texto": "Un viento imaginario"}]'::jsonb,
            'B', 1, 'fisica');

        -- Pregunta 37
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Si cazas demasiado la vela, ¿qué pasa?',
            'Bela gehiegi ehizatzen baduzu, zer gertatzen da?',
            '[{"id": "A", "texto": "El barco va más rápido"}, {"id": "B", "texto": "La vela trabaja peor y el barco frena"}, {"id": "C", "texto": "La vela se rompe"}, {"id": "D", "texto": "El barco vira automáticamente"}]'::jsonb,
            'B', 1, 'practica');

        -- Pregunta 38
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué indican los catavientos de la vela?',
            'Zer adierazten dute belaren katabientoek?',
            '[{"id": "A", "texto": "La velocidad del barco"}, {"id": "B", "texto": "La dirección del viento real"}, {"id": "C", "texto": "Si el flujo de aire sobre la vela es correcto"}, {"id": "D", "texto": "La temperatura"}]'::jsonb,
            'C', 1, 'practica');

        -- Pregunta 39
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Cuando la vela flamea (ondea sin tensión), significa que:',
            'Bela flameatzen ari denean (tentsiorik gabe uhintzen), esan nahi du:',
            '[{"id": "A", "texto": "Está perfectamente ajustada"}, {"id": "B", "texto": "Hay demasiado viento"}, {"id": "C", "texto": "No está recibiendo viento correctamente y necesita cazarse"}, {"id": "D", "texto": "El barco va demasiado rápido"}]'::jsonb,
            'C', 1, 'practica');

        -- Pregunta 40
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cómo se llama el punto donde la vela está llena pero sin exceso de tensión?',
            'Nola deitzen da bela beteta dagoen baina gehiegizko tentsiorik gabe dagoen puntua?',
            '[{"id": "A", "texto": "Punto de máxima cazada"}, {"id": "B", "texto": "Punto de flameo"}, {"id": "C", "texto": "Punto óptimo de trimado"}, {"id": "D", "texto": "Punto muerto"}]'::jsonb,
            'C', 1, 'practica');

        -- Pregunta 41
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Por qué el viento aparente viene más de proa cuanto más rápido vas?',
            'Zergatik dator itxurazko haizea gehiago proatik zenbat eta azkarrago joan?',
            '[{"id": "A", "texto": "Porque el viento real cambia de dirección"}, {"id": "B", "texto": "Porque tu propio movimiento genera un viento frontal que se suma al real"}, {"id": "C", "texto": "Porque la vela cambia de posición"}, {"id": "D", "texto": "No es cierto, siempre viene del mismo sitio"}]'::jsonb,
            'B', 1, 'fisica');

        -- Pregunta 42
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué regla práctica sirve para encontrar la cazada correcta?',
            'Zer arau praktiko balio du ehiza zuzena aurkitzeko?',
            '[{"id": "A", "texto": "Cazar al máximo siempre"}, {"id": "B", "texto": "Lascar hasta que la vela flamee, luego cazar un poco"}, {"id": "C", "texto": "Dejar la vela siempre a medio cazar"}, {"id": "D", "texto": "Copiar lo que hace el barco de al lado"}]'::jsonb,
            'B', 1, 'practica');

        -- Pregunta 43
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Cuando el viento empuja la vela como un paracaídas, estás navegando en:',
            'Haizeak bela parakaidas bat bezala bultzatzen duenean, honetan ari zara nabigatzen:',
            '[{"id": "A", "texto": "Ceñida"}, {"id": "B", "texto": "Través"}, {"id": "C", "texto": "Empopada (viento de popa)"}, {"id": "D", "texto": "Zona muerta"}]'::jsonb,
            'C', 1, 'practica');

        -- Pregunta 44
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué principio físico explica que un velero pueda navegar casi contra el viento?',
            'Zer printzipio fisikok azaltzen du belaontzi batek ia haizearen kontra nabigatu ahal izatea?',
            '[{"id": "A", "texto": "La fuerza de gravedad"}, {"id": "B", "texto": "La sustentación aerodinámica (como el ala de un avión)"}, {"id": "C", "texto": "La corriente marina"}, {"id": "D", "texto": "La fuerza centrífuga"}]'::jsonb,
            'B', 1, 'fisica');

        -- Pregunta 45
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Si el cataviento de barlovento sube y el de sotavento cae, ¿qué debes hacer?',
            'Barloventoko katabientoa igotzen bada eta sotaventokoa erortzen bada, zer egin behar duzu?',
            '[{"id": "A", "texto": "Cazar más la vela"}, {"id": "B", "texto": "Lascar la vela"}, {"id": "C", "texto": "No cambiar nada"}, {"id": "D", "texto": "Poner proa al viento"}]'::jsonb,
            'B', 1, 'practica');

        -- Pregunta 46
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál es la principal diferencia entre sustentación y empuje en la vela?',
            'Zein da sustenguaren eta bultzadaren arteko desberdintasun nagusia belaontzian?',
            '[{"id": "A", "texto": "La sustentación solo funciona con viento fuerte"}, {"id": "B", "texto": "La sustentación genera fuerza por diferencia de presión; el empuje es fuerza directa del viento"}, {"id": "C", "texto": "El empuje es más eficiente que la sustentación"}, {"id": "D", "texto": "No hay diferencia"}]'::jsonb,
            'B', 1, 'fisica');

        -- Pregunta 47
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué pasa si la vela está sobrecazada en un través?',
            'Zer gertatzen da bela gehiegi ehizatuta badago zeharka batean?',
            '[{"id": "A", "texto": "El barco va más rápido"}, {"id": "B", "texto": "Se genera exceso de escora y resistencia, frenando el barco"}, {"id": "C", "texto": "La vela flamea"}, {"id": "D", "texto": "Nada especial"}]'::jsonb,
            'B', 1, 'practica');

        -- Pregunta 48
         INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Si estás parado en tierra y sopla viento, ese viento es:',
            'Lurrean geldirik bazaude eta haizea jotzen badu, haize hori da:',
            '[{"id": "A", "texto": "Viento aparente"}, {"id": "B", "texto": "Viento relativo"}, {"id": "C", "texto": "Viento real"}, {"id": "D", "texto": "Brisa térmica"}]'::jsonb,
            'C', 1, 'fisica');

        -- Pregunta 49
         INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Cuando navegas, ¿con qué viento trabaja la vela?',
            'Nabigatzen duzunean, zer haizerekin lan egiten du belak?',
            '[{"id": "A", "texto": "Con el viento real"}, {"id": "B", "texto": "Con el viento aparente"}, {"id": "C", "texto": "Con el viento térmico"}, {"id": "D", "texto": "Con el viento de proa"}]'::jsonb,
            'B', 1, 'fisica');

        -- Pregunta 50
         INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué observarías si llevas la vela demasiado lascada (abierta)?',
            'Zer ikusiko zenuke bela gehiegi askatuta (irekita) eramaten baduzu?',
            '[{"id": "A", "texto": "Máxima velocidad"}, {"id": "B", "texto": "La vela flamea en su borde delantero"}, {"id": "C", "texto": "Escora excesiva"}, {"id": "D", "texto": "El barco vira solo"}]'::jsonb,
            'B', 1, 'practica');

        -- Pregunta 51
         INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál es el gran error de pensar que un velero "solo puede ir con viento a favor"?',
            'Zein da belaontzi bat "haizearen alde bakarrik joan daitekeela" pentsatzearen akats handia?',
            '[{"id": "A", "texto": "Es completamente cierto"}, {"id": "B", "texto": "Es falso: gracias a la sustentación, un velero puede navegar en casi todas direcciones excepto directamente contra el viento"}, {"id": "C", "texto": "Solo funciona en barcos grandes"}, {"id": "D", "texto": "Depende del tipo de vela"}]'::jsonb,
            'B', 1, 'fisica');

    ELSE
        RAISE NOTICE 'Unidad "Cómo Funciona la Vela" no encontrada. Saltando preguntas.';
    END IF;


    -- =====================================================
    -- UNIDAD 4: Terminología Náutica (Preguntas 52-68)
    -- =====================================================
    -- NOTA: Esta unidad NO existe en el seed 001. 
    -- Si no existe en la BD, este bloque no insertará nada, lo cual es correcto.
    -- Asumimos que la unidad se llama 'terminologia-nautica' o similar.
    
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'terminologia-nautica';
    
    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 52
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué significa "orzar"?',
            'Zer esan nahi du "orzar"?',
            '[{"id": "A", "texto": "Girar la proa alejándose del viento"}, {"id": "B", "texto": "Girar la proa hacia el viento"}, {"id": "C", "texto": "Soltar la escota"}, {"id": "D", "texto": "Subir la orza"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 53
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cómo se llama el lado del barco por donde viene el viento?',
            'Nola deitzen da haizea datorren ontziaren aldea?',
            '[{"id": "A", "texto": "Sotavento"}, {"id": "B", "texto": "Babor"}, {"id": "C", "texto": "Barlovento"}, {"id": "D", "texto": "Estribor"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 54
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué significa "cazar" un cabo?',
            'Zer esan nahi du kabo bat "ehizatu"?',
            '[{"id": "A", "texto": "Soltarlo poco a poco"}, {"id": "B", "texto": "Tirarlo al agua"}, {"id": "C", "texto": "Tensarlo tirando de él"}, {"id": "D", "texto": "Atarlo a una cornamusa"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 55
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cómo se llama en náutica una cuerda?',
            'Nola deitzen da soka bat nautikan?',
            '[{"id": "A", "texto": "Soga"}, {"id": "B", "texto": "Cordaje"}, {"id": "C", "texto": "Cabo"}, {"id": "D", "texto": "Hilo"}]'::jsonb,
            'C', 1, 'teoria');
            
        -- Pregunta 56
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué significa "lascar" o "filar"?',
            'Zer esan nahi du "laskatu" edo "filatu"?',
            '[{"id": "A", "texto": "Tensar un cabo"}, {"id": "B", "texto": "Cortar un cabo"}, {"id": "C", "texto": "Soltar un cabo poco a poco"}, {"id": "D", "texto": "Atar un cabo al mástil"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 57
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'El gratil de la vela es:',
            'Belaren gratila da:',
            '[{"id": "A", "texto": "El borde inferior"}, {"id": "B", "texto": "El borde trasero"}, {"id": "C", "texto": "El borde delantero (unido al mástil)"}, {"id": "D", "texto": "La esquina superior"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 58
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál es la diferencia entre virar y trasluchar?',
            'Zein da virar eta trasluchar egitearen arteko aldea?',
            '[{"id": "A", "texto": "Son lo mismo"}, {"id": "B", "texto": "Virar: la proa pasa por el viento. Trasluchar: la popa pasa por el viento"}, {"id": "C", "texto": "Virar es con motor, trasluchar es con vela"}, {"id": "D", "texto": "Depende de la velocidad del barco"}]'::jsonb,
            'B', 1, 'practica');

        -- Pregunta 59
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '"¡Listos para virar!" significa:',
            '"Prest biratzeko!" esan nahi du:',
            '[{"id": "A", "texto": "El barco va a pararse"}, {"id": "B", "texto": "Preparaos, vamos a cambiar de bordo por proa"}, {"id": "C", "texto": "Hay que soltar todas las escotas"}, {"id": "D", "texto": "El instructor se acerca"}]'::jsonb,
            'B', 1, 'practica');
        
        -- Pregunta 60
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'La baluma de la vela es:',
            'Belaren baluma da:',
            '[{"id": "A", "texto": "El borde delantero"}, {"id": "B", "texto": "El borde inferior"}, {"id": "C", "texto": "El borde trasero"}, {"id": "D", "texto": "El centro de la vela"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 61
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué son los catavientos?',
            'Zer dira katabientoak?',
            '[{"id": "A", "texto": "Instrumentos para medir la velocidad del viento"}, {"id": "B", "texto": "Cintas o hilos cosidos a la vela que indican el flujo del aire"}, {"id": "C", "texto": "Banderas del barco"}, {"id": "D", "texto": "Partes del timón"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 62
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Por qué la terminología náutica es importante?',
            'Zergatik da garrantzitsua terminologia nautikoa?',
            '[{"id": "A", "texto": "Por tradición marítima"}, {"id": "B", "texto": "Porque elimina la ambigüedad en las instrucciones, lo que es vital para la seguridad"}, {"id": "C", "texto": "Para impresionar a los amigos"}, {"id": "D", "texto": "Es obligatoria por ley"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 63
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Si el instructor dice "¡Cae a sotavento!", ¿qué debes hacer?',
            'Irakasleak "Jaitsi sotaventora!" esaten badu, zer egin behar duzu?',
            '[{"id": "A", "texto": "Girar hacia el viento"}, {"id": "B", "texto": "Girar alejándote del viento"}, {"id": "C", "texto": "Parar el barco"}, {"id": "D", "texto": "Soltar la escota"}]'::jsonb,
            'B', 1, 'practica');

        -- Pregunta 64
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cómo se llama la esquina inferior-delantera de la vela?',
            'Nola deitzen da belaren beheko aurreko izkina?',
            '[{"id": "A", "texto": "Puño de escota"}, {"id": "B", "texto": "Puño de pena"}, {"id": "C", "texto": "Puño de amura"}, {"id": "D", "texto": "Puño de driza"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 65
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Cuando alguien dice "el barco escora a babor", significa que:',
            'Norbait "ontzia baborrera eskoratzen da" esaten duenean, esan nahi du:',
            '[{"id": "A", "texto": "El barco se inclina hacia la izquierda"}, {"id": "B", "texto": "El barco se inclina hacia la derecha"}, {"id": "C", "texto": "El barco gira a la izquierda"}, {"id": "D", "texto": "El barco se detiene"}]'::jsonb,
            'A', 1, 'teoria');

        -- Pregunta 66
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Los sables de la vela sirven para:',
            'Belako sableek zertarako balio dute?',
            '[{"id": "A", "texto": "Reforzar las costuras"}, {"id": "B", "texto": "Dar forma a la vela"}, {"id": "C", "texto": "Sujetar la escota"}, {"id": "D", "texto": "Conectar la vela al mástil"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 67
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué significa "arribar"?',
            'Zer esan nahi du "arribatu"?',
            '[{"id": "A", "texto": "Llegar a puerto"}, {"id": "B", "texto": "Girar la proa hacia el viento"}, {"id": "C", "texto": "Girar la proa alejándose del viento"}, {"id": "D", "texto": "Anclar el barco"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 68
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Si te sientas a barlovento del barco, ¿dónde te sientas?',
            'Ontziaren barlovento aldean esertzen bazara, non esertzen zara?',
            '[{"id": "A", "texto": "En el lado protegido del viento"}, {"id": "B", "texto": "En el lado por donde viene el viento"}, {"id": "C", "texto": "En el centro del barco"}, {"id": "D", "texto": "En la popa"}]'::jsonb,
            'B', 1, 'seguridad');

    ELSE
        RAISE NOTICE 'Unidad "Terminología Náutica" no encontrada. Saltando preguntas.';
    END IF;

    RAISE NOTICE 'Banco de preguntas Parte 1 (Unidades 1-4) insertado correctamente.';

END $$;
=======
-- =====================================================
-- SEED: Banco de Preguntas - Parte 1 (Unidades 1-4)
-- =====================================================
-- Fuente: contenido_academico/curso1_banco_preguntas_parte1.md
-- Total Preguntas: 68

DO $$
DECLARE
    v_unidad_id UUID;
BEGIN

    -- =====================================================
    -- UNIDAD 1: Seguridad en el Mar (Preguntas 1-17)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'seguridad-en-el-mar';

    IF v_unidad_id IS NOT NULL THEN
        -- Borrar preguntas anteriores de esta unidad para evitar duplicados en desarrollo
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 1
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuál es el elemento de seguridad personal OBLIGATORIO en todo momento a bordo?',
            'Zein da ontzian uneoro derrigorrezkoa den segurtasun pertsonaleko elementua?',
            '[{"id": "A", "texto": "Gafas de sol"}, {"id": "B", "texto": "Chaleco salvavidas"}, {"id": "C", "texto": "Guantes de navegación"}, {"id": "D", "texto": "Casco"}]'::jsonb,
            'B', 1, 'seguridad');

        -- Pregunta 2
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Antes de salir a navegar, ¿qué debes consultar siempre?',
            'Nabigatzera irten aurretik, zer kontsultatu behar duzu beti?',
            '[{"id": "A", "texto": "El horario de la escuela"}, {"id": "B", "texto": "El parte meteorológico"}, {"id": "C", "texto": "La temperatura del agua"}, {"id": "D", "texto": "Las mareas de la semana siguiente"}]'::jsonb,
            'B', 1, 'seguridad');

        -- Pregunta 3
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Si alguien cae al agua, ¿cuál es lo PRIMERO que debes hacer?',
            'Norbait uretara erortzen bada, zer da EGIN behar duzun lehen gauza?',
            '[{"id": "A", "texto": "Lanzarte al agua para rescatarle"}, {"id": "B", "texto": "Llamar por teléfono"}, {"id": "C", "texto": "Gritar \"¡Hombre al agua!\" y no perderle de vista"}, {"id": "D", "texto": "Dar la vuelta al barco inmediatamente"}]'::jsonb,
            'C', 1, 'seguridad');

        -- Pregunta 4
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'En caso de vuelco del barco, ¿qué debes hacer?',
            'Ontzia irauliz gero, zer egin behar duzu?',
            '[{"id": "A", "texto": "Nadar hacia la costa lo más rápido posible"}, {"id": "B", "texto": "Abandonar el barco y pedir ayuda"}, {"id": "C", "texto": "Agarrarte al barco y nunca abandonarlo"}, {"id": "D", "texto": "Quitarte el chaleco para nadar mejor"}]'::jsonb,
            'C', 1, 'seguridad');

        -- Pregunta 5
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué significa levantar un brazo en alto cuando estás en el agua?',
            'Zer esan nahi du besoa altxatzeak uretan zaudenean?',
            '[{"id": "A", "texto": "Saludo a otros barcos"}, {"id": "B", "texto": "Necesito ayuda"}, {"id": "C", "texto": "Todo está bien"}, {"id": "D", "texto": "Voy a virar"}]'::jsonb,
            'B', 1, 'seguridad');

        -- Pregunta 6
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué factor de protección solar mínimo se recomienda para navegar?',
            'Zer eguzki-babes faktore gutxieneko gomendatzen da nabigatzeko?',
            '[{"id": "A", "texto": "Factor 15"}, {"id": "B", "texto": "Factor 30"}, {"id": "C", "texto": "Factor 50+"}, {"id": "D", "texto": "No es necesario"}]'::jsonb,
            'C', 1, 'seguridad');

        -- Pregunta 7
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Si tienes dudas sobre las condiciones meteorológicas, ¿qué debes hacer?',
            'Eguraldi baldintzei buruzko zalantzak badituzu, zer egin behar duzu?',
            '[{"id": "A", "texto": "Salir y probar cómo están las condiciones"}, {"id": "B", "texto": "Preguntar a otro alumno"}, {"id": "C", "texto": "NO salir a navegar"}, {"id": "D", "texto": "Salir solo un rato corto"}]'::jsonb,
            'C', 1, 'seguridad');

        -- Pregunta 8
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué tipo de calzado es adecuado para navegar?',
            'Zer oinetako mota da egokia nabigatzeko?',
            '[{"id": "A", "texto": "Chanclas abiertas"}, {"id": "B", "texto": "Zapatillas de deporte normales"}, {"id": "C", "texto": "Calzado náutico con suela antideslizante"}, {"id": "D", "texto": "Descalzo siempre"}]'::jsonb,
            'C', 1, 'seguridad');

        -- Pregunta 9
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuál NO es un procedimiento de emergencia correcto?',
            'Zein EZ da larrialdi-prozedura zuzena?',
            '[{"id": "A", "texto": "Mantener la calma en caso de vuelco"}, {"id": "B", "texto": "Abandonar el barco para nadar a la costa"}, {"id": "C", "texto": "Lanzar el aro salvavidas a quien cae al agua"}, {"id": "D", "texto": "Avisar al instructor inmediatamente"}]'::jsonb,
            'B', 1, 'seguridad');

        -- Pregunta 10
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Con qué señal avisas de que todo está bien?',
            'Zer seinalerekin abisatzen duzu dena ondo dagoela?',
            '[{"id": "A", "texto": "Un brazo en alto"}, {"id": "B", "texto": "Los dos brazos en cruz"}, {"id": "C", "texto": "Silbato continuo"}, {"id": "D", "texto": "Agitar una bandera"}]'::jsonb,
            'B', 1, 'seguridad');

        -- Pregunta 11
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué debes hacer SIEMPRE antes de salir a navegar respecto a tierra?',
            'Zer egin behar duzu BETI nabigatzera irten aurretik lurrari dagokionez?',
            '[{"id": "A", "texto": "Publicarlo en redes sociales"}, {"id": "B", "texto": "Avisar a alguien de tu plan y hora de regreso"}, {"id": "C", "texto": "Enviar un correo electrónico"}, {"id": "D", "texto": "Nada especial"}]'::jsonb,
            'B', 1, 'seguridad');

        -- Pregunta 12
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Por qué es importante llevar gafas de sol con cordón?',
            'Zergatik da garrantzitsua eguzkitako betaurrekoak kordoiarekin eramatea?',
            '[{"id": "A", "texto": "Para que no se caigan al agua y las pierdas"}, {"id": "B", "texto": "Por moda náutica"}, {"id": "C", "texto": "Para proteger las gafas del sol"}, {"id": "D", "texto": "No es importante, es opcional"}]'::jsonb,
            'A', 1, 'seguridad');

        -- Pregunta 13
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué NO debes arrojar al mar?',
            'Zer EZ duzu itsasora bota behar?',
            '[{"id": "A", "texto": "Solo plásticos"}, {"id": "B", "texto": "Solo aceites"}, {"id": "C", "texto": "Nada, ningún tipo de basura"}, {"id": "D", "texto": "Solo residuos orgánicos"}]'::jsonb,
            'C', 1, 'seguridad');

        -- Pregunta 14
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuándo puedes navegar sin chaleco salvavidas?',
            'Noiz nabiga dezakezu salbamendu-jakarik gabe?',
            '[{"id": "A", "texto": "Cuando hace calor"}, {"id": "B", "texto": "Cuando el agua está tranquila"}, {"id": "C", "texto": "Cuando sabes nadar muy bien"}, {"id": "D", "texto": "Nunca, es obligatorio siempre"}]'::jsonb,
            'D', 1, 'seguridad');

        -- Pregunta 15
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'El silbato del chaleco sirve para:',
            'Jakaren txilibitua zertarako da?',
            '[{"id": "A", "texto": "Llamar a los delfines"}, {"id": "B", "texto": "Señalar emergencia o llamar la atención"}, {"id": "C", "texto": "Indicar que todo va bien"}, {"id": "D", "texto": "Avisar de una virada"}]'::jsonb,
            'B', 1, 'seguridad');

        -- Pregunta 16
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué debes comprobar del estado de la mar antes de salir?',
            'Zer egiaztatu behar duzu itsasoaren egoeraz irten aurretik?',
            '[{"id": "A", "texto": "Solo la temperatura del agua"}, {"id": "B", "texto": "La dirección e intensidad del viento, el estado de la mar y la hora de la marea"}, {"id": "C", "texto": "Solo la dirección del viento"}, {"id": "D", "texto": "Solo si hay olas grandes"}]'::jsonb,
            'B', 1, 'seguridad');

        -- Pregunta 17
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuál es la distancia segura que debes mantener respecto a bañistas?',
            'Zein da bainulariekiko mantendu behar duzun distantzia segurua?',
            '[{"id": "A", "texto": "No hay regla específica"}, {"id": "B", "texto": "La que marquen las boyas de la zona de baño"}, {"id": "C", "texto": "Al menos 5 metros"}, {"id": "D", "texto": "Solo en verano hay restricción"}]'::jsonb,
            'B', 1, 'seguridad');

    ELSE
        RAISE NOTICE 'Unidad "Seguridad en el Mar" no encontrada. Saltando preguntas.';
    END IF;


    -- =====================================================
    -- UNIDAD 2: Partes del Barco (Preguntas 18-34)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'partes-del-barco';

    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 18
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cómo se llama la parte delantera del barco?',
            'Nola deitzen da ontziaren aurreko partea?',
            '[{"id": "A", "texto": "Popa"}, {"id": "B", "texto": "Babor"}, {"id": "C", "texto": "Proa"}, {"id": "D", "texto": "Estribor"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 19
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Babor es el lado…',
            'Babor da…',
            '[{"id": "A", "texto": "Derecho mirando hacia proa"}, {"id": "B", "texto": "Izquierdo mirando hacia popa"}, {"id": "C", "texto": "Izquierdo mirando hacia proa"}, {"id": "D", "texto": "Delantero del barco"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 20
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué elemento del barco controla la dirección?',
            'Ontziaren zein elementuk kontrolatzen du norabidea?',
            '[{"id": "A", "texto": "La orza"}, {"id": "B", "texto": "La escota"}, {"id": "C", "texto": "El timón"}, {"id": "D", "texto": "El mástil"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 21
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'La driza es el cabo que sirve para:',
            'Driza zertarako balio duen kaboa da?',
            '[{"id": "A", "texto": "Controlar el ángulo de la vela"}, {"id": "B", "texto": "Izar (subir) la vela"}, {"id": "C", "texto": "Amarrar el barco al puerto"}, {"id": "D", "texto": "Sujetar el timón"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 22
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué función tiene la orza?',
            'Zer funtzio du orzak?',
            '[{"id": "A", "texto": "Dar dirección al barco"}, {"id": "B", "texto": "Sujetar el mástil"}, {"id": "C", "texto": "Evitar que el barco derive lateralmente"}, {"id": "D", "texto": "Controlar la velocidad"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 23
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'La botavara es:',
            'Botavara da:',
            '[{"id": "A", "texto": "El palo vertical que sujeta la vela"}, {"id": "B", "texto": "El palo horizontal que sujeta la parte inferior de la vela mayor"}, {"id": "C", "texto": "El cable que sujeta el mástil"}, {"id": "D", "texto": "La pieza donde se apoya el mástil"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 24
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cómo se llama la parte del casco que está bajo el agua?',
            'Nola deitzen da ur azpian dagoen kroskoaren partea?',
            '[{"id": "A", "texto": "Obra muerta"}, {"id": "B", "texto": "Cubierta"}, {"id": "C", "texto": "Obra viva"}, {"id": "D", "texto": "Superestructura"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 25
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuántas letras tiene "BABOR"?',
            'Zenbat letra ditu "BABOR" hitzak?',
            '[{"id": "A", "texto": "4"}, {"id": "B", "texto": "5"}, {"id": "C", "texto": "6"}, {"id": "D", "texto": "7"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 26
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'La escota de mayor controla:',
            'Eskota nagusiak kontrolatzen du:',
            '[{"id": "A", "texto": "La altura del mástil"}, {"id": "B", "texto": "La dirección del barco"}, {"id": "C", "texto": "El ángulo de la vela mayor respecto al viento"}, {"id": "D", "texto": "La profundidad de la orza"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 27
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cómo se llama la palanca que mueves para dirigir el barco?',
            'Nola deitzen da ontzia gidatzeko mugitzen duzun palanka?',
            '[{"id": "A", "texto": "Timón"}, {"id": "B", "texto": "Caña del timón"}, {"id": "C", "texto": "Pala del timón"}, {"id": "D", "texto": "Botavara"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 28
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'El foque es:',
            'Fokea da:',
            '[{"id": "A", "texto": "La vela principal del barco"}, {"id": "B", "texto": "La vela delantera"}, {"id": "C", "texto": "Una parte del timón"}, {"id": "D", "texto": "Un tipo de nudo"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 29
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué lado del barco lleva luz verde de noche?',
            'Ontziaren zein aldek darama argi berdea gauez?',
            '[{"id": "A", "texto": "Babor"}, {"id": "B", "texto": "Estribor"}, {"id": "C", "texto": "Proa"}, {"id": "D", "texto": "Popa"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 30
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué son los obenques?',
            'Zer dira obenkeak?',
            '[{"id": "A", "texto": "Cabos que controlan las velas"}, {"id": "B", "texto": "Cables laterales que sujetan el mástil"}, {"id": "C", "texto": "Partes del timón"}, {"id": "D", "texto": "Tipos de nudos"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 31
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'La popa es:',
            'Popa da:',
            '[{"id": "A", "texto": "La parte delantera del barco"}, {"id": "B", "texto": "La parte trasera del barco"}, {"id": "C", "texto": "El lado izquierdo"}, {"id": "D", "texto": "El lado derecho"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 32
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'En un Optimist, la orza es:',
            'Optimist batean, orza da:',
            '[{"id": "A", "texto": "Fija y no se puede mover"}, {"id": "B", "texto": "Abatible (se puede levantar)"}, {"id": "C", "texto": "Inexistente"}, {"id": "D", "texto": "De quilla fija"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 33
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cómo se llama el orificio donde se inserta el mástil en la cubierta?',
            'Nola deitzen da zuloa non masta sartzen den estalkian?',
            '[{"id": "A", "texto": "Carlinga"}, {"id": "B", "texto": "Fogonadura"}, {"id": "C", "texto": "Cornamusa"}, {"id": "D", "texto": "Cadeneta"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 34
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué parte del casco está sobre el agua?',
            'Kroskoaren zein parte dago ur gainean?',
            '[{"id": "A", "texto": "Obra viva"}, {"id": "B", "texto": "Carena"}, {"id": "C", "texto": "Obra muerta"}, {"id": "D", "texto": "Quilla"}]'::jsonb,
            'C', 1, 'teoria');

    ELSE
        RAISE NOTICE 'Unidad "Partes del Barco" no encontrada. Saltando preguntas.';
    END IF;


    -- =====================================================
    -- UNIDAD 3: Cómo Funciona la Vela (Preguntas 35-51)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'como-funciona-la-vela';

    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 35
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuál es la forma MÁS eficiente de propulsión a vela?',
            'Zein da bela bidezko propultsio modurik eraginkorrena?',
            '[{"id": "A", "texto": "Empuje directo (viento de popa)"}, {"id": "B", "texto": "Sustentación aerodinámica (viento de través)"}, {"id": "C", "texto": "Remolque por otra embarcación"}, {"id": "D", "texto": "Motor auxiliar"}]'::jsonb,
            'B', 1, 'fisica');

        -- Pregunta 36
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'El viento aparente es:',
            'Itxurazko haizea da:',
            '[{"id": "A", "texto": "El viento real que sopla en la zona"}, {"id": "B", "texto": "La combinación del viento real y el viento creado por el movimiento del barco"}, {"id": "C", "texto": "El viento que aparece solo por la tarde"}, {"id": "D", "texto": "Un viento imaginario"}]'::jsonb,
            'B', 1, 'fisica');

        -- Pregunta 37
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Si cazas demasiado la vela, ¿qué pasa?',
            'Bela gehiegi ehizatzen baduzu, zer gertatzen da?',
            '[{"id": "A", "texto": "El barco va más rápido"}, {"id": "B", "texto": "La vela trabaja peor y el barco frena"}, {"id": "C", "texto": "La vela se rompe"}, {"id": "D", "texto": "El barco vira automáticamente"}]'::jsonb,
            'B', 1, 'practica');

        -- Pregunta 38
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué indican los catavientos de la vela?',
            'Zer adierazten dute belaren katabientoek?',
            '[{"id": "A", "texto": "La velocidad del barco"}, {"id": "B", "texto": "La dirección del viento real"}, {"id": "C", "texto": "Si el flujo de aire sobre la vela es correcto"}, {"id": "D", "texto": "La temperatura"}]'::jsonb,
            'C', 1, 'practica');

        -- Pregunta 39
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Cuando la vela flamea (ondea sin tensión), significa que:',
            'Bela flameatzen ari denean (tentsiorik gabe uhintzen), esan nahi du:',
            '[{"id": "A", "texto": "Está perfectamente ajustada"}, {"id": "B", "texto": "Hay demasiado viento"}, {"id": "C", "texto": "No está recibiendo viento correctamente y necesita cazarse"}, {"id": "D", "texto": "El barco va demasiado rápido"}]'::jsonb,
            'C', 1, 'practica');

        -- Pregunta 40
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cómo se llama el punto donde la vela está llena pero sin exceso de tensión?',
            'Nola deitzen da bela beteta dagoen baina gehiegizko tentsiorik gabe dagoen puntua?',
            '[{"id": "A", "texto": "Punto de máxima cazada"}, {"id": "B", "texto": "Punto de flameo"}, {"id": "C", "texto": "Punto óptimo de trimado"}, {"id": "D", "texto": "Punto muerto"}]'::jsonb,
            'C', 1, 'practica');

        -- Pregunta 41
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Por qué el viento aparente viene más de proa cuanto más rápido vas?',
            'Zergatik dator itxurazko haizea gehiago proatik zenbat eta azkarrago joan?',
            '[{"id": "A", "texto": "Porque el viento real cambia de dirección"}, {"id": "B", "texto": "Porque tu propio movimiento genera un viento frontal que se suma al real"}, {"id": "C", "texto": "Porque la vela cambia de posición"}, {"id": "D", "texto": "No es cierto, siempre viene del mismo sitio"}]'::jsonb,
            'B', 1, 'fisica');

        -- Pregunta 42
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué regla práctica sirve para encontrar la cazada correcta?',
            'Zer arau praktiko balio du ehiza zuzena aurkitzeko?',
            '[{"id": "A", "texto": "Cazar al máximo siempre"}, {"id": "B", "texto": "Lascar hasta que la vela flamee, luego cazar un poco"}, {"id": "C", "texto": "Dejar la vela siempre a medio cazar"}, {"id": "D", "texto": "Copiar lo que hace el barco de al lado"}]'::jsonb,
            'B', 1, 'practica');

        -- Pregunta 43
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Cuando el viento empuja la vela como un paracaídas, estás navegando en:',
            'Haizeak bela parakaidas bat bezala bultzatzen duenean, honetan ari zara nabigatzen:',
            '[{"id": "A", "texto": "Ceñida"}, {"id": "B", "texto": "Través"}, {"id": "C", "texto": "Empopada (viento de popa)"}, {"id": "D", "texto": "Zona muerta"}]'::jsonb,
            'C', 1, 'practica');

        -- Pregunta 44
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué principio físico explica que un velero pueda navegar casi contra el viento?',
            'Zer printzipio fisikok azaltzen du belaontzi batek ia haizearen kontra nabigatu ahal izatea?',
            '[{"id": "A", "texto": "La fuerza de gravedad"}, {"id": "B", "texto": "La sustentación aerodinámica (como el ala de un avión)"}, {"id": "C", "texto": "La corriente marina"}, {"id": "D", "texto": "La fuerza centrífuga"}]'::jsonb,
            'B', 1, 'fisica');

        -- Pregunta 45
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Si el cataviento de barlovento sube y el de sotavento cae, ¿qué debes hacer?',
            'Barloventoko katabientoa igotzen bada eta sotaventokoa erortzen bada, zer egin behar duzu?',
            '[{"id": "A", "texto": "Cazar más la vela"}, {"id": "B", "texto": "Lascar la vela"}, {"id": "C", "texto": "No cambiar nada"}, {"id": "D", "texto": "Poner proa al viento"}]'::jsonb,
            'B', 1, 'practica');

        -- Pregunta 46
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuál es la principal diferencia entre sustentación y empuje en la vela?',
            'Zein da sustenguaren eta bultzadaren arteko desberdintasun nagusia belaontzian?',
            '[{"id": "A", "texto": "La sustentación solo funciona con viento fuerte"}, {"id": "B", "texto": "La sustentación genera fuerza por diferencia de presión; el empuje es fuerza directa del viento"}, {"id": "C", "texto": "El empuje es más eficiente que la sustentación"}, {"id": "D", "texto": "No hay diferencia"}]'::jsonb,
            'B', 1, 'fisica');

        -- Pregunta 47
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué pasa si la vela está sobrecazada en un través?',
            'Zer gertatzen da bela gehiegi ehizatuta badago zeharka batean?',
            '[{"id": "A", "texto": "El barco va más rápido"}, {"id": "B", "texto": "Se genera exceso de escora y resistencia, frenando el barco"}, {"id": "C", "texto": "La vela flamea"}, {"id": "D", "texto": "Nada especial"}]'::jsonb,
            'B', 1, 'practica');

        -- Pregunta 48
         INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Si estás parado en tierra y sopla viento, ese viento es:',
            'Lurrean geldirik bazaude eta haizea jotzen badu, haize hori da:',
            '[{"id": "A", "texto": "Viento aparente"}, {"id": "B", "texto": "Viento relativo"}, {"id": "C", "texto": "Viento real"}, {"id": "D", "texto": "Brisa térmica"}]'::jsonb,
            'C', 1, 'fisica');

        -- Pregunta 49
         INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Cuando navegas, ¿con qué viento trabaja la vela?',
            'Nabigatzen duzunean, zer haizerekin lan egiten du belak?',
            '[{"id": "A", "texto": "Con el viento real"}, {"id": "B", "texto": "Con el viento aparente"}, {"id": "C", "texto": "Con el viento térmico"}, {"id": "D", "texto": "Con el viento de proa"}]'::jsonb,
            'B', 1, 'fisica');

        -- Pregunta 50
         INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué observarías si llevas la vela demasiado lascada (abierta)?',
            'Zer ikusiko zenuke bela gehiegi askatuta (irekita) eramaten baduzu?',
            '[{"id": "A", "texto": "Máxima velocidad"}, {"id": "B", "texto": "La vela flamea en su borde delantero"}, {"id": "C", "texto": "Escora excesiva"}, {"id": "D", "texto": "El barco vira solo"}]'::jsonb,
            'B', 1, 'practica');

        -- Pregunta 51
         INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuál es el gran error de pensar que un velero "solo puede ir con viento a favor"?',
            'Zein da belaontzi bat "haizearen alde bakarrik joan daitekeela" pentsatzearen akats handia?',
            '[{"id": "A", "texto": "Es completamente cierto"}, {"id": "B", "texto": "Es falso: gracias a la sustentación, un velero puede navegar en casi todas direcciones excepto directamente contra el viento"}, {"id": "C", "texto": "Solo funciona en barcos grandes"}, {"id": "D", "texto": "Depende del tipo de vela"}]'::jsonb,
            'B', 1, 'fisica');

    ELSE
        RAISE NOTICE 'Unidad "Cómo Funciona la Vela" no encontrada. Saltando preguntas.';
    END IF;


    -- =====================================================
    -- UNIDAD 4: Terminología Náutica (Preguntas 52-68)
    -- =====================================================
    -- NOTA: Esta unidad NO existe en el seed 001.
    -- Si no existe en la BD, este bloque no insertará nada, lo cual es correcto.
    -- Asumimos que la unidad se llama 'terminologia-nautica' o similar.

    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'terminologia-nautica';

    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 52
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué significa "orzar"?',
            'Zer esan nahi du "orzar"?',
            '[{"id": "A", "texto": "Girar la proa alejándose del viento"}, {"id": "B", "texto": "Girar la proa hacia el viento"}, {"id": "C", "texto": "Soltar la escota"}, {"id": "D", "texto": "Subir la orza"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 53
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cómo se llama el lado del barco por donde viene el viento?',
            'Nola deitzen da haizea datorren ontziaren aldea?',
            '[{"id": "A", "texto": "Sotavento"}, {"id": "B", "texto": "Babor"}, {"id": "C", "texto": "Barlovento"}, {"id": "D", "texto": "Estribor"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 54
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué significa "cazar" un cabo?',
            'Zer esan nahi du kabo bat "ehizatu"?',
            '[{"id": "A", "texto": "Soltarlo poco a poco"}, {"id": "B", "texto": "Tirarlo al agua"}, {"id": "C", "texto": "Tensarlo tirando de él"}, {"id": "D", "texto": "Atarlo a una cornamusa"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 55
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cómo se llama en náutica una cuerda?',
            'Nola deitzen da soka bat nautikan?',
            '[{"id": "A", "texto": "Soga"}, {"id": "B", "texto": "Cordaje"}, {"id": "C", "texto": "Cabo"}, {"id": "D", "texto": "Hilo"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 56
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué significa "lascar" o "filar"?',
            'Zer esan nahi du "laskatu" edo "filatu"?',
            '[{"id": "A", "texto": "Tensar un cabo"}, {"id": "B", "texto": "Cortar un cabo"}, {"id": "C", "texto": "Soltar un cabo poco a poco"}, {"id": "D", "texto": "Atar un cabo al mástil"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 57
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'El gratil de la vela es:',
            'Belaren gratila da:',
            '[{"id": "A", "texto": "El borde inferior"}, {"id": "B", "texto": "El borde trasero"}, {"id": "C", "texto": "El borde delantero (unido al mástil)"}, {"id": "D", "texto": "La esquina superior"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 58
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuál es la diferencia entre virar y trasluchar?',
            'Zein da virar eta trasluchar egitearen arteko aldea?',
            '[{"id": "A", "texto": "Son lo mismo"}, {"id": "B", "texto": "Virar: la proa pasa por el viento. Trasluchar: la popa pasa por el viento"}, {"id": "C", "texto": "Virar es con motor, trasluchar es con vela"}, {"id": "D", "texto": "Depende de la velocidad del barco"}]'::jsonb,
            'B', 1, 'practica');

        -- Pregunta 59
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '"¡Listos para virar!" significa:',
            '"Prest biratzeko!" esan nahi du:',
            '[{"id": "A", "texto": "El barco va a pararse"}, {"id": "B", "texto": "Preparaos, vamos a cambiar de bordo por proa"}, {"id": "C", "texto": "Hay que soltar todas las escotas"}, {"id": "D", "texto": "El instructor se acerca"}]'::jsonb,
            'B', 1, 'practica');

        -- Pregunta 60
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'La baluma de la vela es:',
            'Belaren baluma da:',
            '[{"id": "A", "texto": "El borde delantero"}, {"id": "B", "texto": "El borde inferior"}, {"id": "C", "texto": "El borde trasero"}, {"id": "D", "texto": "El centro de la vela"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 61
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué son los catavientos?',
            'Zer dira katabientoak?',
            '[{"id": "A", "texto": "Instrumentos para medir la velocidad del viento"}, {"id": "B", "texto": "Cintas o hilos cosidos a la vela que indican el flujo del aire"}, {"id": "C", "texto": "Banderas del barco"}, {"id": "D", "texto": "Partes del timón"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 62
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Por qué la terminología náutica es importante?',
            'Zergatik da garrantzitsua terminologia nautikoa?',
            '[{"id": "A", "texto": "Por tradición marítima"}, {"id": "B", "texto": "Porque elimina la ambigüedad en las instrucciones, lo que es vital para la seguridad"}, {"id": "C", "texto": "Para impresionar a los amigos"}, {"id": "D", "texto": "Es obligatoria por ley"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 63
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Si el instructor dice "¡Cae a sotavento!", ¿qué debes hacer?',
            'Irakasleak "Jaitsi sotaventora!" esaten badu, zer egin behar duzu?',
            '[{"id": "A", "texto": "Girar hacia el viento"}, {"id": "B", "texto": "Girar alejándote del viento"}, {"id": "C", "texto": "Parar el barco"}, {"id": "D", "texto": "Soltar la escota"}]'::jsonb,
            'B', 1, 'practica');

        -- Pregunta 64
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cómo se llama la esquina inferior-delantera de la vela?',
            'Nola deitzen da belaren beheko aurreko izkina?',
            '[{"id": "A", "texto": "Puño de escota"}, {"id": "B", "texto": "Puño de pena"}, {"id": "C", "texto": "Puño de amura"}, {"id": "D", "texto": "Puño de driza"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 65
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Cuando alguien dice "el barco escora a babor", significa que:',
            'Norbait "ontzia baborrera eskoratzen da" esaten duenean, esan nahi du:',
            '[{"id": "A", "texto": "El barco se inclina hacia la izquierda"}, {"id": "B", "texto": "El barco se inclina hacia la derecha"}, {"id": "C", "texto": "El barco gira a la izquierda"}, {"id": "D", "texto": "El barco se detiene"}]'::jsonb,
            'A', 1, 'teoria');

        -- Pregunta 66
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Los sables de la vela sirven para:',
            'Belako sableek zertarako balio dute?',
            '[{"id": "A", "texto": "Reforzar las costuras"}, {"id": "B", "texto": "Dar forma a la vela"}, {"id": "C", "texto": "Sujetar la escota"}, {"id": "D", "texto": "Conectar la vela al mástil"}]'::jsonb,
            'B', 1, 'teoria');

        -- Pregunta 67
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué significa "arribar"?',
            'Zer esan nahi du "arribatu"?',
            '[{"id": "A", "texto": "Llegar a puerto"}, {"id": "B", "texto": "Girar la proa hacia el viento"}, {"id": "C", "texto": "Girar la proa alejándose del viento"}, {"id": "D", "texto": "Anclar el barco"}]'::jsonb,
            'C', 1, 'teoria');

        -- Pregunta 68
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Si te sientas a barlovento del barco, ¿dónde te sientas?',
            'Ontziaren barlovento aldean esertzen bazara, non esertzen zara?',
            '[{"id": "A", "texto": "En el lado protegido del viento"}, {"id": "B", "texto": "En el lado por donde viene el viento"}, {"id": "C", "texto": "En el centro del barco"}, {"id": "D", "texto": "En la popa"}]'::jsonb,
            'B', 1, 'seguridad');

    ELSE
        RAISE NOTICE 'Unidad "Terminología Náutica" no encontrada. Saltando preguntas.';
    END IF;

    RAISE NOTICE 'Banco de preguntas Parte 1 (Unidades 1-4) insertado correctamente.';

END $$;
>>>>>>> pr-286
