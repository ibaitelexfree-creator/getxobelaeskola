-- =====================================================
-- SEED: Banco de Preguntas - Parte 3 (Unidades 9-10)
-- =====================================================
-- Fuente: contenido_academico/curso1_banco_preguntas_parte3.md
-- Total Preguntas: 40 (121-160)

DO $$
DECLARE
    v_unidad_id UUID;
BEGIN

    -- =====================================================
    -- UNIDAD 9: Parar, Arrancar y Posición de Seguridad (Q121-140)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'parar-arrancar-posicion-seguridad';
    
    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 121
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cómo se para un velero?',
            'Nola gelditzen da belaontzi bat?',
            '[{"id": "A", "texto": "Echando el ancla"}, {"id": "B", "texto": "Poniendo proa al viento y soltando la escota"}, {"id": "C", "texto": "Apagando el motor"}, {"id": "D", "texto": "Bajando la orza"}]'::jsonb,
            'B', 'Un velero no tiene frenos. Para detenerse, pones proa al viento y largas la escota; las velas flamean y el barco frena.', 1, 'practica');

        -- Pregunta 122
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué es la posición de seguridad?',
            'Zer da segurtasun-posizioa?',
            '[{"id": "A", "texto": "Tumbarse en el barco"}, {"id": "B", "texto": "Proa al viento + escota larga + manos fuera de la escota"}, {"id": "C", "texto": "Cazar la escota al máximo"}, {"id": "D", "texto": "Saltar al agua"}]'::jsonb,
            'B', 'La posición de seguridad es tu "botón de pausa": barco proa al viento, escota suelta, sin fuerza en las velas.', 1, 'seguridad');

        -- Pregunta 123
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'Un velero se detiene instantáneamente al poner proa al viento.',
            'Belaontzi bat berehala gelditzen da proa haizera jartzean.',
            'Falso', 'No es instantáneo. Un barco con inercia tarda entre 5 y 15 segundos en pararse. Hay que anticipar la parada.', 1, 'practica');

        -- Pregunta 124
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuándo debes usar la posición de seguridad?',
            'Noiz erabili behar duzu segurtasun-posizioa?',
            '[{"id": "A", "texto": "Solo cuando te lo diga el instructor"}, {"id": "B", "texto": "Ante cualquier imprevisto, duda o necesidad de pensar"}, {"id": "C", "texto": "Solo en emergencias graves"}, {"id": "D", "texto": "Nunca, es de principiantes"}]'::jsonb,
            'B', 'La posición de seguridad sirve para descansar, pensar, reorganizarse, recibir instrucciones o ante cualquier imprevisto.', 1, 'seguridad');

        -- Pregunta 125
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál es la regla de oro del principiante?',
            'Zein da algunaren urrezko araua?',
            '[{"id": "A", "texto": "Nunca soltar la escota"}, {"id": "B", "texto": "Ante la duda, proa al viento"}, {"id": "C", "texto": "Siempre navegar rápido"}, {"id": "D", "texto": "No mirar atrás"}]'::jsonb,
            'B', '"Ante la duda, proa al viento" te da tiempo y seguridad ante cualquier situación inesperada.', 1, 'seguridad');

        -- Pregunta 126
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Para arrancar desde parado (Método 1), ¿qué haces primero?',
            'Geldialditik abiatzeko (1. metodoa), zer egiten duzu lehenik?',
            '[{"id": "A", "texto": "Cazar la escota"}, {"id": "B", "texto": "Empujar la caña del timón hacia un lado para que la proa caiga"}, {"id": "C", "texto": "Subir la orza"}, {"id": "D", "texto": "Saltar al agua y empujar"}]'::jsonb,
            'B', 'Empujas la caña para que the bow turns and falls off the wind; when the sail fills, you sheet in and start.', 1, 'practica');

        -- Pregunta 127
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Has volcado y acabas de adrizar el barco. ¿Qué haces inmediatamente?',
            'Irauli egin zara eta ontzia zuzendu berri duzu. Zer egiten duzu berehala?',
            '[{"id": "A", "texto": "Salir navegando a máxima velocidad"}, {"id": "B", "texto": "Adoptar la posición de seguridad para reorganizarte"}, {"id": "C", "texto": "Nadar hacia la playa"}, {"id": "D", "texto": "Volver a volcar para practicar"}]'::jsonb,
            'B', 'Tras adrizar, lo primero es posición de seguridad para reorganizarte con calma.', 1, 'seguridad');

        -- Pregunta 128
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Si intentas parar solo soltando la escota sin orzar, ¿qué pasa?',
            'Orzatu gabe eskota askatuz bakarrik gelditzen saiatzen bazara, zer gertatzen da?',
            '[{"id": "A", "texto": "El barco para inmediatamente"}, {"id": "B", "texto": "La vela sigue recibiendo algo de viento y el barco no para del todo"}, {"id": "C", "texto": "El barco va más rápido"}, {"id": "D", "texto": "La vela se cae"}]'::jsonb,
            'B', 'Sin poner proa al viento, la vela sigue captando algo de viento y el barco no se detiene del todo.', 1, 'practica');

        -- Pregunta 129
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'El Método 2 para arrancar desde parado consiste en:',
            'Geldialditik abiatzeko 2. metodoa honetan datza:',
            '[{"id": "A", "texto": "Empujar la botavara hacia sotavento con la mano"}, {"id": "B", "texto": "Remar con las manos"}, {"id": "C", "texto": "Esperar a que venga una ola"}, {"id": "D", "texto": "Encender el motor"}]'::jsonb,
            'A', 'Si la caña no basta (poco viento), empujar la botavara hacia sotavento hace que el viento gire el barco.', 1, 'practica');

        -- Pregunta 130
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'En posición de seguridad, el barco se queda completamente quieto en el mismo sitio.',
            'Segurtasun-posizioan, ontzia erabat geldirik geratzen da leku berean.',
            'Falso', 'El barco va a la deriva por viento y corriente. Es normal.', 1, 'teoria');

        -- Pregunta 131
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Se te enreda la escota mientras navegas. ¿Qué haces primero?',
            'Eskota katigatzen zaizu nabigatzen ari zaren bitartean. Zer egiten duzu lehenik?',
            '[{"id": "A", "texto": "Intentar desenredarla sin cambiar nada"}, {"id": "B", "texto": "Poner proa al viento y adoptar posición de seguridad"}, {"id": "C", "texto": "Cortar la escota"}, {"id": "D", "texto": "Gritar pidiendo ayuda"}]'::jsonb,
            'B', 'Ante cualquier problema: proa al viento. Con calma y sin fuerza en la vela, desenredas la escota.', 1, 'practica');

        -- Pregunta 132
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuánto tarda un barco con inercia en pararse?',
            'Zenbat denbora behar du inertzia duen ontzi batek gelditzeko?',
            '[{"id": "A", "texto": "1 segundo"}, {"id": "B", "texto": "5 a 15 segundos"}, {"id": "C", "texto": "1 minuto"}, {"id": "D", "texto": "5 minutos"}]'::jsonb,
            'B', 'Un barco con inercia tarda entre 5 y 15 segundos en pararse. Hay que anticipar.', 1, 'practica');

        -- Pregunta 133
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Al arrancar, ¿en qué momento cazas la escota?',
            'Abiaraztean, zein unetan ehizatzen duzu eskota?',
            '[{"id": "A", "texto": "Antes de mover la caña"}, {"id": "B", "texto": "Cuando la vela empiece a llenarse de viento"}, {"id": "C", "texto": "Después de llevar 1 minuto moviéndote"}, {"id": "D", "texto": "Da igual cuándo"}]'::jsonb,
            'B', 'Primero deja que la proa caiga y la vela se llene; solo entonces caza para que el barco avance.', 1, 'practica');

        -- Pregunta 134
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Estás en la bahía, inseguro y sin saber qué maniobra hacer. ¿Qué haces?',
            'Badian zaude, seguru ez eta zein maniobra egin behar duzun jakin gabe. Zer egiten duzu?',
            '[{"id": "A", "texto": "Seguir navegando"}, {"id": "B", "texto": "Gritar al instructor"}, {"id": "C", "texto": "Poner proa al viento: posición de seguridad"}, {"id": "D", "texto": "Saltar al agua"}]'::jsonb,
            'C', 'La posición de seguridad te da tiempo para pensar sin riesgo.', 1, 'seguridad');

        -- Pregunta 135
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'Si estás en posición de seguridad y otro barco se acerca, debes quedarte quieto.',
            'Segurtasun-posizioan bazaude eta beste ontzi bat hurbiltzen bada, geldirik egon behar duzu.',
            'Falso', 'Si hay riesgo de colisión, arranca y maniobra incluso desde la posición de seguridad.', 1, 'seguridad');

        -- Pregunta 136
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'En la posición de seguridad, ¿dónde deben estar tus manos?',
            'Segurtasun-posizioan, non egon behar dute zure eskuek?',
            '[{"id": "A", "texto": "En la escota, tirando fuerte"}, {"id": "B", "texto": "Fuera de la escota"}, {"id": "C", "texto": "En el mástil"}, {"id": "D", "texto": "En el agua"}]'::jsonb,
            'B', 'Manos fuera de la escota para no cazar involuntariamente y poner el barco en marcha sin querer.', 1, 'seguridad');

        -- Pregunta 137
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Por qué es un error arrancar con la vela ya cazada?',
            'Zergatik da akatsa bela ehizatuta dagoela abiaraztea?',
            '[{"id": "A", "texto": "No es un error"}, {"id": "B", "texto": "La vela con viento impide que la proa gire libremente"}, {"id": "C", "texto": "Se rompe la escota"}, {"id": "D", "texto": "Es más rápido así"}]'::jsonb,
            'B', 'Con la escota cazada la vela genera fuerza que dificulta el giro. Deja la vela suelta, gira, y caza cuando se llene.', 1, 'practica');

        -- Pregunta 138
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'El instructor hace sonar su silbato. ¿Reacción correcta?',
            'Instruktoreak txistua jotzen du. Erreakzio zuzena?',
            '[{"id": "A", "texto": "Seguir navegando"}, {"id": "B", "texto": "Saltar al agua"}, {"id": "C", "texto": "Posición de seguridad inmediata"}, {"id": "D", "texto": "Buscar a otros compañeros"}]'::jsonb,
            'C', 'Ante la señal del instructor la respuesta automática es posición de seguridad.', 1, 'seguridad');

        -- Pregunta 139
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuántas veces recomienda la unidad practicar la parada?',
            'Zenbat aldiz gomendatzen du unitateak geldialdia praktikatzea?',
            '[{"id": "A", "texto": "1 vez"}, {"id": "B", "texto": "5 veces mínimo"}, {"id": "C", "texto": "Solo si quieres"}, {"id": "D", "texto": "No es necesario"}]'::jsonb,
            'B', 'Practicar la parada al menos 5 veces para que sea un reflejo automático.', 1, 'practica');

        -- Pregunta 140
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué ventajas tiene la posición de seguridad?',
            'Zer abantaila ditu segurtasun-posizioak?',
            '[{"id": "A", "texto": "Solo que el barco va más rápido"}, {"id": "B", "texto": "No hay escora, el barco se detiene y tienes tiempo para pensar"}, {"id": "C", "texto": "La vela se seca"}, {"id": "D", "texto": "Es más divertido"}]'::jsonb,
            'B', 'Sin viento en la vela no hay escora ni movimiento; tienes todo el tiempo para reorganizarte.', 1, 'seguridad');

    ELSE
        RAISE NOTICE 'Unidad "Parar, Arrancar y Posición de Seguridad" no encontrada.';
    END IF;


    -- =====================================================
    -- UNIDAD 10: Reglas de Navegación Básicas (Q141-160)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'reglas-de-navegacion';

    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 141
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Quién tiene preferencia: un barco de vela o uno de motor?',
            'Nork du lehentasuna: belaontzi batek ala motor-ontzi batek?',
            '[{"id": "A", "texto": "Siempre el de motor"}, {"id": "B", "texto": "El de vela, con excepciones"}, {"id": "C", "texto": "Depende de quién llegó primero"}, {"id": "D", "texto": "El más grande"}]'::jsonb,
            'B', 'El velero tiene preferencia, excepto ante buques grandes, canales estrechos o barcos de pesca con artes.', 1, 'reglamento');

        -- Pregunta 142
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué significa "estribor manda"?',
            'Zer esan nahi du "estriborrak agintzen duela"?',
            '[{"id": "A", "texto": "Que el barco con viento de estribor tiene preferencia"}, {"id": "B", "texto": "Que siempre debes girar a estribor"}, {"id": "C", "texto": "Que estribor es la derecha"}, {"id": "D", "texto": "Que el timón va a estribor"}]'::jsonb,
            'A', 'Cuando dos veleros se cruzan, el que lleva viento de estribor tiene preferencia.', 1, 'reglamento');

        -- Pregunta 143
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cómo sabes si llevas viento de estribor?',
            'Nola dakizu haizea estriborretik daramazula?',
            '[{"id": "A", "texto": "Si la vela está a estribor"}, {"id": "B", "texto": "Si la vela está a babor"}, {"id": "C", "texto": "Si el timón está a la derecha"}, {"id": "D", "texto": "Si ves tierra a estribor"}]'::jsonb,
            'B', 'La vela va al lado contrario del viento. Vela a babor = viento de estribor = preferencia.', 1, 'reglamento');

        -- Pregunta 144
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Cuando dos veleros con viento del mismo lado convergen, ¿quién manda?',
            'Alde bereko haizea duten bi belaontzik topo egiten dutenean, nork agintzen du?',
            '[{"id": "A", "texto": "El de barlovento"}, {"id": "B", "texto": "El de sotavento"}, {"id": "C", "texto": "El más rápido"}, {"id": "D", "texto": "El más grande"}]'::jsonb,
            'B', 'El de sotavento tiene preferencia; el de barlovento debe apartarse.', 1, 'reglamento');

        -- Pregunta 145
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Si alcanzas a otro barco por detrás, ¿quién se aparta?',
            'Beste ontzi bat atzetik harrapatzen baduzu, nor aldentzen da?',
            '[{"id": "A", "texto": "El alcanzado"}, {"id": "B", "texto": "Tú (el que alcanza)"}, {"id": "C", "texto": "Ninguno"}, {"id": "D", "texto": "El más lento"}]'::jsonb,
            'B', 'El barco que alcanza siempre debe apartarse.', 1, 'reglamento');

        -- Pregunta 146
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'Un velero pequeño siempre tiene preferencia sobre un petrolero.',
            'Belaontzi txiki batek lehentasuna du beti petrolio-ontzi baten aurrean.',
            'Falso', 'Un buque grande no puede esquivarte. Sentido común: apártate.', 1, 'reglamento');

        -- Pregunta 147
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué significan 5 pitadas cortas?',
            'Zer esan nahi dute 5 txistu laburrek?',
            '[{"id": "A", "texto": "Buenos días"}, {"id": "B", "texto": "¡Peligro! No entiendo tus intenciones"}, {"id": "C", "texto": "Puedes pasar"}, {"id": "D", "texto": "Voy a virar"}]'::jsonb,
            'B', '5 pitadas cortas = peligro o protesta. Apártate inmediatamente.', 1, 'reglamento');

        -- Pregunta 148
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Con qué frecuencia miras alrededor navegando?',
            'Zenbatetan begiratzen duzu ingurura nabigatzen ari zarenean?',
            '[{"id": "A", "texto": "Cada 10 minutos"}, {"id": "B", "texto": "Constantemente"}, {"id": "C", "texto": "Solo al salir de puerto"}, {"id": "D", "texto": "Solo si oyes algo"}]'::jsonb,
            'B', 'La vigilancia permanente es fundamental para evitar colisiones.', 1, 'seguridad');

        -- Pregunta 149
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Ves un velero acercándose con viento de estribor. Tú llevas viento de babor. ¿Qué haces?',
            'Belaontzi bat hurbiltzen ikusten duzu estriborreko haizearekin. Zuk baborreko haizea daramazu. Zer egiten duzu?',
            '[{"id": "A", "texto": "Mantengo rumbo"}, {"id": "B", "texto": "Acelero para pasar"}, {"id": "C", "texto": "Me aparto, él tiene preferencia"}, {"id": "D", "texto": "Grito"}]'::jsonb,
            'C', 'Estribor manda. Tú con viento de babor debes apartarte.', 1, 'reglamento');

        -- Pregunta 150
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Por qué lado navegas en un canal de entrada a puerto?',
            'Zein aldetatik nabigatzen duzu portura sartzeko kanal batean?',
            '[{"id": "A", "texto": "Por el centro"}, {"id": "B", "texto": "Por la izquierda"}, {"id": "C", "texto": "Por la derecha (estribor)"}, {"id": "D", "texto": "Donde haya espacio"}]'::jsonb,
            'C', 'Se navega por el lado derecho del canal, como en una carretera.', 1, 'reglamento');

        -- Pregunta 151
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'Si tienes preferencia pero el otro no se aparta, debes mantener tu rumbo a toda costa.',
            'Lehentasuna baduzu baina bestea aldentzen ez bada, zure norabideari eutsi behar diozu kosta ahala kosta.',
            'Falso', 'Si el otro no se mueve, apártate tú. Tener preferencia no te exime de evitar colisiones.', 1, 'seguridad');

        -- Pregunta 152
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Las boyas amarillas en la costa delimitan:',
            'Kostaldeko buia horiek honako hau mugatzen dute:',
            '[{"id": "A", "texto": "Zona de navegación"}, {"id": "B", "texto": "Zona de bañistas (no navegar dentro)"}, {"id": "C", "texto": "Canal de entrada"}, {"id": "D", "texto": "Zona de pesca"}]'::jsonb,
            'B', 'Las boyas amarillas marcan la zona de baño. Nunca navegues dentro.', 1, 'reglamento');

        -- Pregunta 153
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuándo NO aplica la regla de vela sobre motor?',
            'Noiz EZ da aplikatzen belaren lehentasuna motorraren gainean?',
            '[{"id": "A", "texto": "Cuando hace sol"}, {"id": "B", "texto": "Ante buques grandes o en canales estrechos"}, {"id": "C", "texto": "Los fines de semana"}, {"id": "D", "siempre aplica"}]'::jsonb,
            'B', 'No aplica ante buques grandes con maniobra limitada ni en canales estrechos.', 1, 'reglamento');

        -- Pregunta 154
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Un ferry grande se acerca. Técnicamente tienes preferencia. ¿Qué haces?',
            'Ferry handi bat hurbiltzen ari da. Teknikoki lehentasuna duzu. Zer egiten duzu?',
            '[{"id": "A", "texto": "Mantengo rumbo"}, {"id": "B", "texto": "Me aparto claramente; un ferry no puede esquivarme"}, {"id": "C", "texto": "Paso justo por delante"}, {"id": "D", "texto": "Ignoro la situación"}]'::jsonb,
            'B', 'Sentido común: un ferry no puede maniobrar para esquivarte. Apártate.', 1, 'reglamento');

        -- Pregunta 155
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cómo debe ser una maniobra de evasión?',
            'Nolakoa izan behar du saihesteko maniobra batek?',
            '[{"id": "A", "texto": "Pequeña y discreta"}, {"id": "B", "texto": "Grande y visible"}, {"id": "C", "texto": "En el último segundo"}, {"id": "D", "texto": "Lenta y gradual"}]'::jsonb,
            'B', 'Un cambio de rumbo de 5° no lo ve nadie. Hazlo evidente y con antelación.', 1, 'reglamento');

        -- Pregunta 156
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿El error más peligroso en reglas de navegación?',
            'Nabigazio-arauetan akatsik arriskutsuena?',
            '[{"id": "A", "texto": "No saber babor"}, {"id": "B", "texto": "No mirar alrededor"}, {"id": "C", "texto": "Navegar lento"}, {"id": "D", "texto": "Vela mal cazada"}]'::jsonb,
            'B', 'No mirar alrededor es el error más peligroso. La vigilancia permanente es vital.', 1, 'seguridad');

        -- Pregunta 157
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'Un velero que navega a motor mantiene la preferencia de vela.',
            'Motorrez nabigatzen duen belaontzi batek belaren lehentasunari eusten dio.',
            'Falso', 'Si navegas a motor, se te considera barco de motor y pierdes la preferencia de vela.', 1, 'reglamento');

        -- Pregunta 158
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'La regla más importante, por encima de todas, es:',
            'Araurik garrantzitsuena, guztien gainetik, hauxe da:',
            '[{"id": "A", "texto": "Estribor manda"}, {"id": "B", "texto": "Vela sobre motor"}, {"id": "C", "texto": "El sentido común y evitar colisiones"}, {"id": "D", "texto": "El que alcanza se aparta"}]'::jsonb,
            'C', 'Todas las reglas están subordinadas al principio de evitar colisiones.', 1, 'reglamento');

        -- Pregunta 159
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Dos veleros convergen. Ambos con viento de estribor. ¿Quién tiene preferencia?',
            'Bi belaontzik topo egiten dabe. Biak estriborreko haizearekin. Nork du lehentasuna?',
            '[{"id": "A", "texto": "El de barlovento"}, {"id": "B", "texto": "El de sotavento"}, {"id": "C", "texto": "El más rápido"}, {"id": "D", "ninguno"}]'::jsonb,
            'B', 'Mismo lado de viento: sotavento tiene preferencia, barlovento se aparta.', 1, 'reglamento');

        -- Pregunta 160
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué debes hacer ANTES de cualquier maniobra en zona con tráfico?',
            'Zer egin behar duzu trafiko-eremuko edozein maniobra aurretik?',
            '[{"id": "A", "texto": "Gritar"}, {"id": "B", "texto": "Tocar bocina"}, {"id": "C", "texto": "Mirar alrededor y comprobar que está despejado"}, {"id": "D", "cerrar los ojos"}]'::jsonb,
            'C', 'Antes de maniobrar, comprueba que no hay otros barcos en tu camino.', 1, 'seguridad');

    ELSE
        RAISE NOTICE 'Unidad "Reglas de Navegación Básicas" no encontrada.';
    END IF;

    RAISE NOTICE 'Banco de preguntas Parte 3 (Unidades 9-10) insertado correctamente.';

END $$;
