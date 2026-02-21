-- =====================================================
-- SEED: Banco de Preguntas - Parte 2 (Unidades 5-8)
-- =====================================================
-- Fuente: contenido_academico/curso1_banco_preguntas_parte2.md
-- Total Preguntas: 52 (69-120)

DO $$
DECLARE
    v_unidad_id UUID;
BEGIN

    -- =====================================================
    -- UNIDAD 5: Los Rumbos Respecto al Viento (Q69-85)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'rumbos-de-navegacion';
    
    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 69
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué es el rumbo en navegación a vela?',
            'Zer da norabidea bela bidezko nabigazioan?',
            '[{"id": "A", "texto": "La velocidad del barco"}, {"id": "B", "texto": "El ángulo entre la proa del barco y la dirección del viento"}, {"id": "C", "texto": "La distancia recorrida"}, {"id": "D", "texto": "La profundidad del agua"}]'::jsonb,
            'B', 'El rumbo es el ángulo entre la dirección de la proa y la dirección de donde viene el viento, y determina cómo se comporta el barco.', 1, 'teoria');

        -- Pregunta 70
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿En qué rumbo la vela va muy cazada y hay mucha escora?',
            'Zein norabidetan doa bela oso ehizatuta eta eskora handia dago?',
            '[{"id": "A", "texto": "Empopada"}, {"id": "B", "texto": "Largo"}, {"id": "C", "texto": "Ceñida"}, {"id": "D", "texto": "Través"}]'::jsonb,
            'C', 'En ceñida (30-50° del viento), la vela va muy cazada, casi en la línea central del barco, y la escora es notable.', 1, 'practica');

        -- Pregunta 71
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál es el rumbo más cómodo y equilibrado para aprender?',
            'Zein da ikasteko norabiderik erosoena eta orekatuena?',
            '[{"id": "A", "texto": "Ceñida"}, {"id": "B", "texto": "Empopada"}, {"id": "C", "texto": "Través"}, {"id": "D", "texto": "Largo"}]'::jsonb,
            'C', 'El través (90° del viento) ofrece la mejor relación velocidad/comodidad, con escora moderada y sensación estable.', 1, 'practica');

        -- Pregunta 72
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'Un velero puede navegar directamente contra el viento.',
            'Belaontzi batek haizearen kontra zuzenean nabiga dezake.',
            'Falso', 'Existe una zona muerta de 30-45° a cada lado del viento donde el velero no puede avanzar. Para ir contra el viento hay que bordejear en zigzag.', 1, 'teoria');

        -- Pregunta 73
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué ocurre si apuntas la proa directamente al viento?',
            'Zer gertatzen da proa haizera zuzenean zuzentzen baduzu?',
            '[{"id": "A", "texto": "El barco va más rápido"}, {"id": "B", "texto": "Las velas flamean y el barco se detiene"}, {"id": "C", "texto": "El barco gira automáticamente"}, {"id": "D", "texto": "La escora aumenta"}]'::jsonb,
            'B', 'Al apuntar la proa al viento entras en la zona muerta: las velas flamean sin recibir empuje y el barco se detiene.', 1, 'practica');

        -- Pregunta 74
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué es bordejear?',
            'Zer da bidez-bide nabigatzea?',
            '[{"id": "A", "texto": "Navegar en empopada"}, {"id": "B", "texto": "Navegar en zigzag en ceñida para ganar terreno contra el viento"}, {"id": "C", "texto": "Dar vueltas alrededor de una boya"}, {"id": "D", "texto": "Navegar en círculos"}]'::jsonb,
            'B', 'Bordejear es la técnica de navegar en zigzag en ceñida, virando alternativamente, para llegar a un destino situado a barlovento.', 1, 'practica');

        -- Pregunta 75
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'En empopada, ¿cómo va la vela?',
            'Popaz nabigatzean, nola doa bela?',
            '[{"id": "A", "texto": "Muy cazada, casi en la línea central"}, {"id": "B", "texto": "A medio cazar"}, {"id": "C", "texto": "Completamente abierta, perpendicular al barco"}, {"id": "D", "texto": "Recogida"}]'::jsonb,
            'C', 'En empopada (180° del viento) la vela se abre al máximo, perpendicular al eje del barco, actuando como un paracaídas.', 1, 'practica');

        -- Pregunta 76
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'La empopada es el rumbo más rápido porque el viento viene directamente por detrás.',
            'Popaz nabigatzea norabiderik azkarrena da, haizea zuzenean atzetik datorrelako.',
            'Falso', 'Aunque parezca lógico, la empopada no es el rumbo más rápido porque la vela solo recibe empuje, no sustentación aerodinámica.', 1, 'fisica');

        -- Pregunta 77
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Por qué la empopada es peligrosa para principiantes?',
            'Zergatik da popaz nabigatzea arriskutsua algunentzat?',
            '[{"id": "A", "texto": "Porque el barco va muy rápido"}, {"id": "B", "texto": "Por el riesgo de trasluchada involuntaria que golpea con la botavara"}, {"id": "C", "texto": "Porque no se puede gobernar"}, {"id": "D", "texto": "Porque la orza no funciona"}]'::jsonb,
            'B', 'En empopada, un cambio de viento o un golpe de ola puede provocar una trasluchada involuntaria donde la botavara cruza con fuerza.', 1, 'seguridad');

        -- Pregunta 78
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Cuando orzas, ¿qué debes hacer con la escota?',
            'Orzatzen duzunean, zer egin behar duzu eskotarekin?',
            '[{"id": "A", "texto": "Soltarla completamente"}, {"id": "B", "texto": "Cazarla (tensarla)"}, {"id": "C", "texto": "No tocarla"}, {"id": "D", "texto": "Cortarla"}]'::jsonb,
            'B', 'Al orzar (girar hacia el viento) el viento llega más de frente, así que necesitas cazar la escota para que la vela siga trabajando.', 1, 'practica');

        -- Pregunta 79
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cómo puedes saber en qué rumbo navegas usando tu cuerpo?',
            'Nola jakin dezakezu zein norabidetan nabigatzen ari zaren zure gorputza erabiliz?',
            '[{"id": "A", "texto": "Mirando la brújula"}, {"id": "B", "texto": "Sintiendo dónde te pega el viento: de frente (ceñida), de lado (través), de atrás (empopada)"}, {"id": "C", "texto": "Mirando el color del agua"}, {"id": "D", "texto": "Por la temperatura del aire"}]'::jsonb,
            'B', 'Sentir el viento en la cara is the most direct way to identify the rumbo.', 1, 'practica');

        -- Pregunta 80
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Necesitas llegar a una boya que está justo en la dirección de donde viene el viento. ¿Qué haces?',
            'Haizea datorren norabidean dagoen buia batera iritsi behar duzu. Zer egiten duzu?',
            '[{"id": "A", "texto": "Navego directamente hacia ella en empopada"}, {"id": "B", "texto": "Navego en través hasta estar a su altura y luego orzo"}, {"id": "C", "texto": "Bordejeo en ceñida haciendo viradas en zigzag"}, {"id": "D", "texto": "Espero a que cambie el viento"}]'::jsonb,
            'C', 'Un velero no puede navegar directamente contra el viento; debes bordejear en ceñida, virando alternativamente, hasta llegar a la boya.', 1, 'tactica');

        -- Pregunta 81
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Si arribes sin lascar la escota, ¿qué pasa?',
            'Eskota laskatu gabe arribatzen baduzu, zer gertatzen da?',
            '[{"id": "A", "texto": "El barco va más rápido"}, {"id": "B", "texto": "La vela queda sobrecazada y frena el barco"}, {"id": "C", "texto": "La vela se rompe"}, {"id": "D", "texto": "El barco vuelca"}]'::jsonb,
            'B', 'Al arribar el viento viene más de popa, y si no lascas la escota, la vela queda demasiado tensa y frena el barco.', 1, 'practica');

        -- Pregunta 82
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'Los catavientos deben ir paralelos por ambos lados de la vela para indicar un buen trimado.',
            'Katabientoak belaren bi aldeetatik paralelo joan behar dute trimatu on bat adierazteko.',
            'Verdadero', 'Cuando los catavientos de barlovento y sotavento van paralelos, el flujo de aire es correcto y la vela está bien ajustada.', 1, 'practica');

        -- Pregunta 83
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿En qué orden pasan los rumbos cuando orzas?',
            'Zer ordenatan pasatzen dira norabideak orzatzen duzunean?',
            '[{"id": "A", "texto": "Ceñida → través → largo → empopada"}, {"id": "B", "texto": "Empopada → largo → través → ceñida → zona muerta"}, {"id": "C", "texto": "Través → empopada → ceñida → largo"}, {"id": "D", "texto": "Largo → ceñida → empopada → través"}]'::jsonb,
            'B', 'Al orzar (girar hacia el viento), pasas de empopada → largo → través → ceñida → zona muerta.', 1, 'teoria');

        -- Pregunta 84
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué rumbo tiene la escora más baja?',
            'Zein norabidek du eskora baxuena?',
            '[{"id": "A", "texto": "Ceñida"}, {"id": "B", "texto": "Través"}, {"id": "C", "texto": "Empopada"}, {"id": "D", "texto": "Todos tienen la misma escora"}]'::jsonb,
            'C', 'En empopada el viento empuja sin generar fuerza lateral, por lo que no hay escora.', 1, 'fisica');

        -- Pregunta 85
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'La regla para ajustar la vela al cambiar de rumbo es:',
            'Norabidez aldatzean bela doitzeko araua da:',
            '[{"id": "A", "texto": "Orzar → lascar, arribar → cazar"}, {"id": "B", "texto": "Orzar → cazar, arribar → lascar"}, {"id": "C", "texto": "Mantener siempre la misma tensión"}, {"id": "D", "texto": "Solo ajustar en ceñida"}]'::jsonb,
            'B', 'Al orzar el viento llega más de frente y necesitas cazar; al arribar debes lascar para que la vela trabaje correctamente.', 1, 'practica');

    ELSE
        RAISE NOTICE 'Unidad "Rumbos de Navegación" no encontrada.';
    END IF;


    -- =====================================================
    -- UNIDAD 6: Preparación y Aparejado del Barco (Q86-99)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'aparejar-y-desaparejar';

    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 86
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál es el primer paso antes de tocar el barco?',
            'Zein da lehen urratsa ontzia ukitu aurretik?',
            '[{"id": "A", "texto": "Montar el mástil"}, {"id": "B", "texto": "Consultar el parte meteorológico"}, {"id": "C", "texto": "Ponerse los guantes"}, {"id": "D", "texto": "Bajar el barco al agua"}]'::jsonb,
            'B', 'Antes de aparejar, debes saber si las condiciones son adecuadas consultando la meteorología.', 1, 'seguridad');

        -- Pregunta 87
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué pasa si olvidas cerrar el tapón de achique?',
            'Zer gertatzen da hustubideko tapoia ixtea ahazten bazaizu?',
            '[{"id": "A", "texto": "Nada importante"}, {"id": "B", "texto": "El barco se llena de agua lentamente"}, {"id": "C", "texto": "El mástil se cae"}, {"id": "D", "texto": "La vela se rompe"}]'::jsonb,
            'B', 'Es el error más frecuente. El barco se llena de agua lentamente y solo te das cuenta cuando ya pesa demasiado.', 1, 'seguridad');

        -- Pregunta 88
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'Para izar la vela, el barco debe estar con la proa mirando perpendicular al viento.',
            'Bela igotzeko, ontziak proa haizearekiko perpendikular begira duela egon behar du.',
            'Falso', 'Se debe izar con la proa al viento para que la vela no coja viento de golpe y el barco se quede quieto.', 1, 'practica');

        -- Pregunta 89
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Dónde se coloca el mástil?',
            'Non jartzen da masta?',
            '[{"id": "A", "texto": "En la popa"}, {"id": "B", "texto": "En la fogonadura y la carlinga"}, {"id": "C", "texto": "En la orza"}, {"id": "D", "texto": "En el timón"}]'::jsonb,
            'B', 'El mástil se coloca en la fogonadura (orificio en cubierta) y en la carlinga (base de apoyo).', 1, 'teoria');

        -- Pregunta 90
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Por qué lado debes subir al barco?',
            'Zein aldetik igo behar duzu ontzira?',
            '[{"id": "A", "texto": "Por barlovento"}, {"id": "B", "texto": "Por la proa"}, {"id": "C", "texto": "Por sotavento o por popa"}, {"id": "D", "da igual"}]'::jsonb,
            'C', 'Si subes por barlovento, subirás contra la escora y podrías volcar el barco hacia ti.', 1, 'seguridad');

        -- Pregunta 91
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuánto tarda aproximadamente aparejar un Optimist?',
            'Zenbat denbora behar da gutxi gorabehera Optimist bat prestatzeko?',
            '[{"id": "A", "texto": "2-3 minutos"}, {"id": "B", "texto": "15-20 minutos"}, {"id": "C", "texto": "1 hora"}, {"id": "D", "texto": "45 minutos"}]'::jsonb,
            'B', 'El aparejado completo lleva unos 15-20 minutos.', 1, 'practica');

        -- Pregunta 92
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Notas que la orza no entra bien en su caja. ¿Qué haces?',
            'Orza bere kutxan ondo sartzen ez dela ohartzen zara. Zer egiten duzu?',
            '[{"id": "A", "texto": "Forzarla"}, {"id": "B", "texto": "Navegar sin orza"}, {"id": "C", "texto": "Revisar la caja, limpiarla y comprobar que la orza no está dañada"}, {"id": "D", "texto": "Usar la de otro barco"}]'::jsonb,
            'C', 'Nunca fuerces un componente ni navegues sin orza. Revisa todo antes de salir.', 1, 'practica');

        -- Pregunta 93
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'Es recomendable avisar a alguien en tierra antes de salir a navegar.',
            'Gomendagarria da lurrean norbaiti abisatzea nabigatzera irten aurretik.',
            'Verdadero', 'Comunica siempre tu plan: dónde vas, cuánto tiempo y a qué hora vuelves.', 1, 'seguridad');

        -- Pregunta 94
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Al meter el barco al agua, ¿hacia dónde debe mirar la proa?',
            'Ontzia urera sartzean, nora begira egon behar du proak?',
            '[{"id": "A", "texto": "Hacia la playa"}, {"id": "B", "texto": "Perpendicular a la playa"}, {"id": "C", "texto": "Hacia donde viene el viento"}, {"id": "D", "texto": "Hacia los otros barcos"}]'::jsonb,
            'C', 'Con la proa al viento, la vela no coge viento y el barco se queda quieto.', 1, 'practica');

        -- Pregunta 95
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Al izar la vela, ¿cómo debe quedar el gratil?',
            'Bela igotzean, nola egon behar du gratilak?',
            '[{"id": "A", "texto": "Con arrugas"}, {"id": "B", "texto": "Bien tensado, sin arrugas horizontales"}, {"id": "C", "texto": "Suelto"}, {"id": "D", "texto": "No importa"}]'::jsonb,
            'B', 'El gratil bien tensado da forma aerodinámica correcta a la vela.', 1, 'practica');

        -- Pregunta 96
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál de estos NO forma parte de la checklist antes de salir?',
            'Hauetako zein EZ da irten aurreko checklistaren parte?',
            '[{"id": "A", "texto": "Tapón de achique cerrado"}, {"id": "B", "texto": "Driza bien firme"}, {"id": "C", "texto": "Haber comido abundantemente"}, {"id": "D", "texto": "Chaleco puesto"}]'::jsonb,
            'C', 'La checklist incluye tapón, driza, escota, timón, orza, chaleco y meteo.', 1, 'seguridad');

        -- Pregunta 97
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué debes hacer tras subir a bordo y antes de navegar?',
            'Zer egin behar duzu ontziratu ondoren eta nabigatu aurretik?',
            '[{"id": "A", "texto": "Cazar la escota inmediatamente"}, {"id": "B", "texto": "Bajar la orza completamente"}, {"id": "C", "texto": "Ponerte gafas de sol"}, {"id": "D", "texto": "Llamar al instructor"}]'::jsonb,
            'B', 'Tras subir, baja la orza para que el barco no derive lateralmente.', 1, 'practica');

        -- Pregunta 98
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Llevas 10 minutos navegando y el barco pesa cada vez más. ¿Qué ha pasado?',
            '10 minutu daramatzazu nabigatzen eta ontziak gero eta gehiago pisatzen du. Zer gertatu da?',
            '[{"id": "A", "texto": "Es normal"}, {"id": "B", "texto": "Probablemente olvidaste cerrar el tapón de achique"}, {"id": "C", "texto": "La vela tiene un agujero"}, {"id": "D", "texto": "El timón está roto"}]'::jsonb,
            'B', 'Olvidar el tapón de achique es el error más común; el barco se llena de agua lentamente.', 1, 'seguridad');

        -- Pregunta 99
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué son los obenques?',
            'Zer dira obenkeak?',
            '[{"id": "A", "texto": "Las velas pequeñas"}, {"id": "B", "texto": "Cables laterales que sujetan el mástil"}, {"id": "C", "texto": "Los cabos de la escota"}, {"id": "D", "texto": "Los herrajes del timón"}]'::jsonb,
            'B', 'Los obenques son cables laterales conectados a las cadenetas para estabilizar el mástil.', 1, 'teoria');

    ELSE
        RAISE NOTICE 'Unidad "Aparejar y Desaparejar" no encontrada.';
    END IF;


    -- =====================================================
    -- UNIDAD 7: La Virada por Avante (Q100-111)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'la-virada-por-avante';

    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 100
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué es virar por avante?',
            'Zer da aurretik biratzea?',
            '[{"id": "A", "texto": "Cambiar de bordo pasando la popa por el viento"}, {"id": "B", "texto": "Cambiar de bordo pasando la proa por el viento"}, {"id": "C", "texto": "Parar el barco"}, {"id": "D", "texto": "Subir la vela"}]'::jsonb,
            'B', 'Virar por avante es cambiar de bordo haciendo que la proa cruce la dirección del viento.', 1, 'teoria');

        -- Pregunta 101
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Hacia dónde empujas la caña para iniciar una virada?',
            'Nora bultzatzen duzu kaina biraketa bati hasteko?',
            '[{"id": "A", "texto": "Hacia barlovento"}, {"id": "B", "texto": "Hacia sotavento (hacia la vela)"}, {"id": "C", "texto": "Hacia proa"}, {"id": "D", "texto": "Hacia abajo"}]'::jsonb,
            'B', 'Para virar, empujas la caña a sotavento, lo que hace que la proa gire hacia el viento.', 1, 'practica');

        -- Pregunta 102
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué necesitas para completar una virada con éxito?',
            'Zer behar duzu biraketa bat arrakastaz osatzeko?',
            '[{"id": "A", "texto": "Mucho viento"}, {"id": "B", "texto": "Velocidad (inercia)"}, {"id": "C", "texto": "Dos personas a bordo"}, {"id": "D", "texto": "Mar en calma"}]'::jsonb,
            'B', 'La virada consume velocidad al cruzar la zona muerta. Sin inercia suficiente, el barco se queda clavado.', 1, 'practica');

        -- Pregunta 103
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'Durante la virada, es normal que la vela flamee al cruzar la dirección del viento.',
            'Biraketan zehar, normala da belak flameatzea haizearen norabidea zeharkatzean.',
            'Verdadero', 'Al cruzar la zona muerta, la vela pierde el viento momentáneamente y flamea.', 1, 'practica');

        -- Pregunta 104
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué se llama "quedarse en proa"?',
            'Nola deitzen zaio "proan geratzea"?',
            '[{"id": "A", "texto": "Navegar muy rápido"}, {"id": "B", "texto": "Que el barco se detiene mirando al viento sin completar la virada"}, {"id": "C", "texto": "Que la proa golpea una ola"}, {"id": "D", "texto": "Que la vela se rompe"}]'::jsonb,
            'B', 'Ocurre cuando el barco no tiene inercia para completar la virada y se queda detenido apuntando al viento.', 1, 'practica');

        -- Pregunta 105
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Te has quedado en proa. ¿Qué haces?',
            'Proan geratu zara. Zer egiten duzu?',
            '[{"id": "A", "texto": "Saltar al agua"}, {"id": "B", "texto": "Empujar la caña a fondo hacia un lado y esperar que el viento empuje la proa"}, {"id": "C", "texto": "Izar más la vela"}, {"id": "D", "texto": "Soltar el timón"}]'::jsonb,
            'B', 'Empuja la caña a fondo; el viento empujará la proa. En cuanto caiga, caza la escota y retoma el rumbo.', 1, 'practica');

        -- Pregunta 106
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Al virar, ¿por dónde cruzas al otro lado?',
            'Biratzean, nondik zeharkatzen duzu beste aldera?',
            '[{"id": "A", "texto": "Por detrás de la caña del timón"}, {"id": "B", "texto": "Por delante de la caña del timón"}, {"id": "C", "texto": "Saltando la botavara"}, {"id": "D", "texto": "Por fuera del barco"}]'::jsonb,
            'B', 'Cambias de lado pasando por delante de la caña del timón.', 1, 'practica');

        -- Pregunta 107
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'En ceñida, hay que soltar completamente la escota durante la virada.',
            'Ziztu bizian, eskota erabat askatu behar da biraketan zehar.',
            'Falso', 'En ceñida la escota apenas cambia entre un bordo y otro. Mantenla a mano.', 1, 'practica');

        -- Pregunta 108
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Si empujas la caña demasiado bruscamente, ¿qué pasa?',
            'Kaina gehiegi kolpetik bultzatzen baduzu, zer gertatzen da?',
            '[{"id": "A", "texto": "La virada sale perfecta"}, {"id": "B", "texto": "El barco gira demasiado rápido y puedes volcar"}, {"id": "C", "texto": "No pasa nada"}, {"id": "D", "texto": "El barco se para"}]'::jsonb,
            'B', 'Un movimiento brusco causa giro demasiado rápido, pérdida de velocidad y riesgo de vuelco.', 1, 'seguridad');

        -- Pregunta 109
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Necesitas virar pero llevas muy poca velocidad. ¿Qué haces?',
            'Biratu behar duzu baina oso abiadura txikia daramazu. Zer egiten duzu?',
            '[{"id": "A", "texto": "Virar igualmente"}, {"id": "B", "texto": "Arribar un poco para coger velocidad y luego virar"}, {"id": "C", "texto": "Reducir vela"}, {"id": "D", "texto": "Esperar a que suba el viento"}]'::jsonb,
            'B', 'Primero arriba para acelerar y luego vira con la inercia necesaria.', 1, 'tactica');

        -- Pregunta 110
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué grita el patrón antes de virar?',
            'Zer oihukatzen du patroiari biratu aurretik?',
            '[{"id": "A", "texto": "¡Cuidado!"}, {"id": "B", "texto": "¡Listos para virar!"}, {"id": "C", "texto": "¡Hombre al agua!"}, {"id": "D", "texto": "¡Alto!"}]'::jsonb,
            'B', 'La voz de aviso es "¡Listos para virar!" para que la tripulación se prepare.', 1, 'practica');

        -- Pregunta 111
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Por qué es importante tu peso corporal durante la virada?',
            'Zergatik da garrantzitsua zure gorputzaren pisua biraketan zehar?',
            '[{"id": "A", "texto": "No es importante"}, {"id": "B", "texto": "Porque en vela ligera tu peso equilibra el barco y debes cambiar de lado coordinadamente"}, {"id": "C", "texto": "Para ir más rápido"}, {"id": "D", "texto": "Para parecer profesional"}]'::jsonb,
            'B', 'En vela ligera tu peso es el lastre; si no cambias de lado a tiempo, el barco escora peligrosamente.', 1, 'practica');

    ELSE
        RAISE NOTICE 'Unidad "La Virada por Avante" no encontrada.';
    END IF;


    -- =====================================================
    -- UNIDAD 8: La Trasluchada (Q112-120)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'la-trasluchada';

    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 112
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál es la diferencia principal entre virada y trasluchada?',
            'Zein da biraketa eta trasluchadaren arteko alde nagusia?',
            '[{"id": "A", "texto": "Son lo mismo"}, {"id": "B", "texto": "En la virada la proa pasa por el viento; en la trasluchada la popa pasa por el viento"}, {"id": "C", "texto": "La virada is more fast"}, {"id": "D", "texto": "La trasluchada solo se hace en puerto"}]'::jsonb,
            'B', 'Virada: la proa cruza el viento. Trasluchada: la popa cruza el viento.', 1, 'teoria');

        -- Pregunta 113
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Por qué es peligrosa la trasluchada?',
            'Zergatik da arriskutsua mundu-bira?',
            '[{"id": "A", "texto": "El barco va lento"}, {"id": "B", "texto": "La vela cruza de golpe con fuerza y la botavara puede golpear"}, {"id": "C", "texto": "La orza se sale"}, {"id": "D", "texto": "El timón se rompe"}]'::jsonb,
            'B', 'El viento empuja la vela de golpe de un lado a otro; la botavara cruza como un bate de béisbol.', 1, 'seguridad');

        -- Pregunta 114
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál es el paso de seguridad MÁS importante antes de trasluchar?',
            'Zein da trasluchada egin aurretik segurtasun-urratsik garrantzitsuena?',
            '[{"id": "A", "texto": "Ponerse el chaleco"}, {"id": "B", "texto": "Cazar la escota para acercar la vela al centro"}, {"id": "C", "texto": "Soltar la escota completamente"}, {"id": "D", "texto": "Subir la orza"}]'::jsonb,
            'B', 'Cazar la escota antes de trasluchar controla la vela para que no cruce con violencia.', 1, 'seguridad');

        -- Pregunta 115
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'La regla de la trasluchada es: "Caza antes, controla durante, larga después."',
            'Trasluchadaren araua da: "Ehizatu lehenago, kontrolatu bitartean, luzatu ondoren."',
            'Verdadero', 'Antes: acercas la vela cazando. Durante: controlas la escota. Después: largas progresivamente.', 1, 'practica');

        -- Pregunta 116
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué debes hacer cuando la botavara cruza?',
            'Zer egin behar duzu botabara zeharkatzen denean?',
            '[{"id": "A", "texto": "Levantar los brazos"}, {"id": "B", "texto": "Agachar la cabeza"}, {"id": "C", "texto": "Soltar el timón"}, {"id": "D", "texto": "Saltar del barco"}]'::jsonb,
            'B', 'La botavara cruza a la altura de la cabeza. Agacharse es fundamental.', 1, 'seguridad');

        -- Pregunta 117
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Navegas en empopada y la vela empieza a querer cruzar sola. ¿Qué haces?',
            'Popaz nabigatzen ari zara eta bela berez zeharkatu nahi hasten da. Zer egiten duzu?',
            '[{"id": "A", "texto": "Nada"}, {"id": "B", "texto": "Soltar la escota"}, {"id": "C", "texto": "Orzar ligeramente y mantener mano en la escota"}, {"id": "D", "texto": "Saltar al agua"}]'::jsonb,
            'C', 'Orzar ligeramente aleja la popa de la línea del viento y estabiliza. Mantener mano en la escota da control.', 1, 'practica');

        -- Pregunta 118
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cómo previenes trasluchadas involuntarias?',
            'Nola saihesten dituzu nahi gabeko trasluchadak?',
            '[{"id": "A", "texto": "Navegando siempre en ceñida"}, {"id": "B", "texto": "Evitando la empopada pura y navegando en largo cerrado (150°)"}, {"id": "C", "texto": "Usando más escota"}, {"id": "D", "texto": "Subiendo la vela"}]'::jsonb,
            'B', 'La empopada pura (180°) es muy inestable; navegar en largo cerrado reduce el riesgo.', 1, 'seguridad');

        -- Pregunta 119
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'Es recomendable evitar las trasluchadas por completo porque son muy peligrosas.',
            'Gomendagarria da trasluchadak erabat saihestea, oso arriskutsuak direlako.',
            'Falso', 'Con técnica correcta, la trasluchada es segura. Evitarla solo retrasa el aprendizaje.', 1, 'practica');

        -- Pregunta 120
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿En qué rumbos se utiliza la trasluchada para cambiar de bordo?',
            'Zein norabidetan erabiltzen da trasluchada bordaz aldatzeko?',
            '[{"id": "A", "texto": "En ceñida"}, {"id": "B", "texto": "En rumbos portantes: largo y empopada"}, {"id": "C", "través"}, {"id": "D", "Solo en puerto"}]'::jsonb,
            'B', 'La trasluchada se usa cuando navegas en rumbos portantes (largo o empopada) y quieres cambiar el lado del viento.', 1, 'teoria');

    ELSE
        RAISE NOTICE 'Unidad "La Trasluchada" no encontrada.';
    END IF;

    RAISE NOTICE 'Banco de preguntas Parte 2 (Unidades 5-8) insertado correctamente.';

END $$;
