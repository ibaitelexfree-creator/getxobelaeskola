<<<<<<< HEAD
-- =====================================================
-- SEED: Banco de Preguntas - Parte 4 (Unidades 11-12)
-- =====================================================
-- Fuente: contenido_academico/curso1_banco_preguntas_parte4.md
-- Total Preguntas: 40 (161-200)

DO $$
DECLARE
    v_unidad_id UUID;
BEGIN

    -- =====================================================
    -- UNIDAD 11: Nudos Esenciales (Q161-180)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'nudos-basicos';
    
    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 161
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál es el "rey de los nudos náuticos"?',
            'Zein da "itsas-korapiloen erregea"?',
            '[{"id": "A", "texto": "El nudo llano"}, {"id": "B", "texto": "El ballestrinque"}, {"id": "C", "texto": "El as de guía (bowline)"}, {"id": "D", "texto": "El nudo de ocho"}]'::jsonb,
            'C', 'El as de guía forma un lazo que no se aprieta bajo carga y se deshace fácilmente. Es el nudo más versátil y útil.', 1, 'nudos');

        -- Pregunta 162
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Para qué sirve el nudo de ocho?',
            'Zertarako balio du zortziko korapiloak?',
            '[{"id": "A", "texto": "Para unir dos cabos"}, {"id": "B", "texto": "Para hacer un lazo fijo"}, {"id": "C", "texto": "Para impedir que un cabo se escape por una polea"}, {"id": "D", "texto": "Para amarrar a un poste"}]'::jsonb,
            'C', 'El nudo de ocho es un nudo de tope que impide que el cabo (por ejemplo, la escota) se escape por la polea.', 1, 'nudos');

        -- Pregunta 163
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'Las escotas deben llevar siempre un nudo de ocho en su extremo.',
            'Eskotek zortziko korapilo bat eraman behar dute beti muturrean.',
            'Verdadero', 'Sin un nudo de ocho, la escota puede escaparse por la polea y perderías completamente el control de la vela.', 1, 'seguridad');

        -- Pregunta 164
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué nudo usarías para amarrar un cabo a un poste o barra?',
            'Zein korapilo erabiliko zenuke kabe bat zutoin edo barra batean amarratzeko?',
            '[{"id": "A", "texto": "As de guía"}, {"id": "B", "texto": "Ballestrinque"}, {"id": "C", "texto": "Nudo de ocho"}, {"id": "D", "texto": "Nudo llano"}]'::jsonb,
            'B', 'El ballestrinque (clove hitch) sirve para amarrar temporalmente un cabo a un poste o barra cilíndrica.', 1, 'nudos');

        -- Pregunta 165
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'La vuelta de cornamusa sirve para:',
            'Kornamuza-birak balio du:',
            '[{"id": "A", "texto": "Unir dos cabos"}, {"id": "B", "texto": "Asegurar un cabo en una cornamusa (pieza en forma de T)"}, {"id": "C", "texto": "Hacer un lazo"}, {"id": "D", "texto": "Amarrar el ancla"}]'::jsonb,
            'B', 'La vuelta de cornamusa asegura cabos (drizas, amarras) en las cornamusas del barco formando un "8" y rematando con un cote.', 1, 'nudos');

        -- Pregunta 166
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué nudo usarías para unir temporalmente dos cabos del mismo grosor?',
            'Zein korapilo erabiliko zenuke lodiera bereko bi kabe aldi baterako lotzeko?',
            '[{"id": "A", "texto": "As de guía"}, {"id": "B", "texto": "Ballestrinque"}, {"id": "C", "texto": "Nudo de ocho"}, {"id": "D", "texto": "Nudo llano (reef knot)"}]'::jsonb,
            'D', 'El nudo llano une dos cabos del mismo diámetro. Se hace "derecha sobre izquierda, luego izquierda sobre derecha".', 1, 'nudos');

        -- Pregunta 167
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué es un "nudo de vaca"?',
            'Zer da "behi-korapilo" bat?',
            '[{"id": "A", "texto": "Un nudo náutico avanzado"}, {"id": "B", "texto": "Un error al hacer el nudo llano que se desliza bajo carga"}, {"id": "C", "texto": "Un nudo decorativo"}, {"id": "D", "texto": "Un tipo de amarre"}]'::jsonb,
            'B', 'Si al hacer el nudo llano haces "derecha-derecha" o "izquierda-izquierda", obtienes un nudo de vaca que se desliza. El llano is symmetric.', 1, 'nudos');

        -- Pregunta 168
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'Un buen nudo náutico debe aguantar la carga y poder deshacerse fácilmente después.',
            'Itsas-korapilo on batek kargari eutsi behar dio eta ondoren erraz askatu ahal izan behar du.',
            'Verdadero', 'Las tres reglas del buen nudo: se hace rápido, aguanta la carga, y se deshace fácilmente incluso después de tensión.', 1, 'teoria');

        -- Pregunta 169
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuántas veces mínimo debes repetir cada nudo para aprenderlo bien?',
            'Zenbat bider gutxienez errepikatu behar duzu korapilo bakoitza ondo ikasteko?',
            '[{"id": "A", "texto": "5 veces"}, {"id": "B", "texto": "10 veces"}, {"id": "C", "texto": "50 veces mínimo"}, {"id": "D", "texto": "3 veces"}]'::jsonb,
            'C', 'Los nudos se aprenden con las manos, no los ojos. Se necesitan al menos 50 repeticiones hasta que te salgan sin mirar.', 1, 'practica');

        -- Pregunta 170
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál es el método mnemotécnico para hacer el as de guía?',
            'Zein da as de guia egiteko metodo mnemoteknikoa?',
            '[{"id": "A", "texto": "El método del marinero"}, {"id": "B", "texto": "El método del conejo (sale de la madriguera, rodea el árbol, vuelve a la madriguera)"}, {"id": "C", "texto": "El método de la serpiente"}, {"id": "D", "texto": "El método del ocho"}]'::jsonb,
            'B', 'El conejo sale del lago, rodea el árbol (firme del cabo) y vuelve a bajar al lago. Es la forma más fácil de recordar.', 1, 'practica');

        -- Pregunta 171
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Necesitas asegurar la driza después de izar la vela. ¿Qué nudo usas?',
            'Driza ziurtatu behar duzu bela igo ondoren. Zein korapilo erabiltzen duzu?',
            '[{"id": "A", "texto": "As de guía"}, {"id": "B", "texto": "Nudo de ocho"}, {"id": "C", "texto": "Vuelta de cornamusa"}, {"id": "D", "texto": "Nudo llano"}]'::jsonb,
            'C', 'La driza se asegura en la cornamusa del mástil usando una vuelta de cornamusa con cote final.', 1, 'practica');

        -- Pregunta 172
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué ventaja del as de guía lo hace útil para rescate?',
            'As de guíaren zein abantailak egiten du erabilgarria erreskatearako?',
            '[{"id": "A", "texto": "Es decorativo"}, {"id": "B", "texto": "Forma un lazo que NO se aprieta bajo carga, no te estrangula"}, {"id": "C", "texto": "Es el nudo más fácil"}, {"id": "D", "texto": "Se ata solo"}]'::jsonb,
            'B', 'El lazo del as de guía no se cierra bajo peso, por lo que es seguro para pasar por el cuerpo en un rescate.', 1, 'seguridad');

        -- Pregunta 173
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué pasa si no pones nudo de ocho al final de la escota?',
            'Zer gertatzen da eskotaren amaieran zortziko korapiloa jartzen ez baduzu?',
            '[{"id": "A", "texto": "Nada"}, {"id": "B", "texto": "La escota se sale por la polea y pierdes el control de la vela"}, {"id": "C", "texto": "El barco va más rápido"}, {"id": "D", "texto": "La vela se cae"}]'::jsonb,
            'B', 'Sin nudo de tope, la escota se escapa por la polea y no puedes controlar la vela en absoluto.', 1, 'practica');

        -- Pregunta 174
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'El ballestrinque es un amarre infalible que nunca se desliza.',
            'Ballestrinkea amarre hutsezina da, inoiz ez duena irrist egiten.',
            'Falso', 'El ballestrinque puede deslizarse si la carga cambia de dirección. Es un amarre rápido pero no definitivo.', 1, 'teoria');

        -- Pregunta 175
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cómo se deshace un as de guía?',
            'Nola askatzen da as de guia bat?',
            '[{"id": "A", "texto": "Cortando el cabo"}, {"id": "B", "texto": "Empujando el chicote hacia arriba"}, {"id": "C", "texto": "Tirando fuerte del firme"}, {"id": "D", "texto": "No se puede deshacer"}]'::jsonb,
            'B', 'Se empuja el chicote hacia arriba y el nudo se afloja limpiamente, incluso después de haber soportado carga.', 1, 'practica');

        -- Pregunta 176
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué es el "chicote" de un cabo?',
            'Zer da kabe baten "chikotea"?',
            '[{"id": "A", "texto": "La parte central del cabo"}, {"id": "B", "texto": "El extremo libre del cabo"}, {"id": "C", "texto": "La parte enrollada"}, {"id": "D", "texto": "El nudo del cabo"}]'::jsonb,
            'B', 'El chicote es el extremo libre del cabo, el que se usa para hacer nudos. El "firme" es la parte fija.', 1, 'teoria');

        -- Pregunta 177
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Estás navegando con una sola mano en la caña y necesitas hacer un nudo rápido. ¿Cuál practicarías?',
            'Esku bakarrarekin kainean nabigatzen ari zara eta korapilo azkar bat egin behar duzu. Zein praktikatuko zenuke?',
            '[{"id": "A", "texto": "Nudo llano con una mano"}, {"id": "B", "texto": "As de guía con una sola mano"}, {"id": "C", "texto": "Vuelta de cornamusa con los pies"}, {"id": "D", "texto": "Ballestrinque de fantasía"}]'::jsonb,
            'B', 'Se recomienda practicar el as de guía con una sola mano para situaciones donde la otra sostiene la caña.', 1, 'practica');

        -- Pregunta 178
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Un nudo que se aprieta tanto que no se puede soltar es:',
            'Hainbeste estutzen den korapilo bat, ezin dena askatu, honako hau da:',
            '[{"id": "A", "texto": "Un buen nudo"}, {"id": "B", "texto": "Un mal nudo — los buenos nudos siempre se sueltan"}, {"id": "C", "texto": "Normal bajo carga"}, {"id": "D", "texto": "El as de guía"}]'::jsonb,
            'B', 'Un buen nudo náutico se deshace fácilmente incluso después de estar bajo tensión. Si no se suelta, es un mal nudo.', 1, 'teoria');

        -- Pregunta 179
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿En qué tiempo deberías poder hacer un as de guía como objetivo?',
            'Zein denboratan egin beharko zenuke as de guia helburu gisa?',
            '[{"id": "A", "texto": "1 minuto"}, {"id": "B", "texto": "Menos de 10 segundos"}, {"id": "C", "texto": "5 minutos"}, {"id": "D", "texto": "No importa el tiempo"}]'::jsonb,
            'B', 'El objetivo es hacerlo en menos de 10 segundos, ya que en emergencias la rapidez es crucial.', 1, 'practica');

        -- Pregunta 180
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'La vuelta de cornamusa se remata con:',
            'Kornamuza-birari amaiera ematen zaio honekin:',
            '[{"id": "A", "texto": "Un nudo de ocho"}, {"id": "B", "texto": "Un cote (medio nudo por dentro) para bloquear"}, {"id": "C", "texto": "Un lazo"}, {"id": "D", "texto": "Nada, se deja suelta"}]'::jsonb,
            'B', 'Tras las vueltas en "8" alrededor de la cornamusa, se remata con un cote para bloquear y que no se suelte.', 1, 'nudos');

    ELSE
        RAISE NOTICE 'Unidad "Nudos Esenciales" no encontrada.';
    END IF;


    -- =====================================================
    -- UNIDAD 12: Tu Primera Navegación Completa (Q181-200)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'tu-primera-navegacion';
    
    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 181
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuántas fases tiene una navegación completa?',
            'Zenbat fase ditu nabigazio oso batek?',
            '[{"id": "A", "texto": "2"}, {"id": "B", "texto": "3"}, {"id": "C", "texto": "4 (preparación, botadura/salida, navegación, llegada/recogida)"}, {"id": "D", "texto": "6"}]'::jsonb,
            'C', 'Las cuatro fases son: preparación en tierra, botadura y salida, navegación y llegada con recogida.', 1, 'practica');

        -- Pregunta 182
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál es el recorrido recomendado para una primera navegación completa?',
            'Zein da gomendatutako ibilbidea lehen nabigazio oso baterako?',
            '[{"id": "A", "texto": "Línea recta ida y vuelta"}, {"id": "B", "texto": "Un triángulo con ceñida, través, largo y ceñida de regreso"}, {"id": "C", "texto": "Navegar en círculos"}, {"id": "D", "texto": "Seguir a otro barco"}]'::jsonb,
            'B', 'El recorrido triangular permite practicar todos los rumbos y maniobras en una sola salida.', 1, 'practica');

        -- Pregunta 183
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué son las "tres A" de una navegación segura?',
            'Zer dira nabigazio seguru baten "hiru A"-ak?',
            '[{"id": "A", "texto": "Agua, Aire, Arena"}, {"id": "B", "texto": "Anticipar, Actuar, Adaptar"}, {"id": "C", "texto": "Atar, Arrancar, Amarrar"}, {"id": "D", "texto": "Aparejo, Ancla, Amarre"}]'::jsonb,
            'B', 'Anticipar (planifica), Actuar (ejecuta con decisión) y Adaptar (modifica si cambian las condiciones).', 1, 'seguridad');

        -- Pregunta 184
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'Si navegas toda la ida con viento de popa, la vuelta será fácil y rápida.',
            'Joateko bide osoa popako haizearekin nabigatzen baduzu, itzulera erraza eta azkarra izango da.',
            'Falso', 'Si vas con viento de popa, la vuelta será en ceñida contra el viento y tardará el doble. Planifica ida y vuelta.', 1, 'practica');

        -- Pregunta 185
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuándo debes volver a puerto?',
            'Noiz itzuli behar duzu portura?',
            '[{"id": "A", "texto": "Solo cuando se acabe el tiempo"}, {"id": "B", "texto": "Si sube el viento, cambia la meteo, estás cansado o falla el equipo"}, {"id": "C", "texto": "Nunca, hay que aguantar"}, {"id": "D", "texto": "Solo si te lo dice el instructor"}]'::jsonb,
            'B', 'Vuelve si suben las condiciones, si estás cansado, si falla algo del equipo o si cambia la meteo.', 1, 'seguridad');

        -- Pregunta 186
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué haces al acercarte a la playa para llegar?',
            'Zer egiten duzu hondartzara iristeko hurbiltzean?',
            '[{"id": "A", "texto": "Llegar a máxima velocidad"}, {"id": "B", "texto": "Llegar lentamente, poner proa al viento para detenerte"}, {"id": "C", "texto": "Saltar del barco antes de llegar"}, {"id": "D", "texto": "Bajar la vela lejos de la playa"}]'::jsonb,
            'B', 'Te acercas despacio, pones proa al viento para parar, levantas la orza en aguas poco profundas y luego saltas al agua.', 1, 'practica');

        -- Pregunta 187
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué debes hacer con el barco después de sacarlo del agua?',
            'Zer egin behar duzu ontziarekin uretatik atera ondoren?',
            '[{"id": "A", "texto": "Dejarlo tal cual hasta el próximo día"}, {"id": "B", "texto": "Enjuagarlo con agua dulce, arriar la vela, desmontar el timón, guardar el equipo"}, {"id": "C", "texto": "Solo quitarle la vela"}, {"id": "D", "texto": "Taparlo con una lona"}]'::jsonb,
            'B', 'Un barco bien guardado se conserva mejor: enjuagar, arriar vela, desmontar timón, guardar equipo.', 1, 'practica');

        -- Pregunta 188
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            '"Siempre mejor volver una hora antes que una hora después" es una regla de navegación.',
            '"Beti hobe da ordu bat lehenago itzultzea ordu bat geroago baino" nabigazio-arau bat da.',
            'Verdadero', 'Es una regla fundamental de prudencia: la fatiga reduce reflejos, las condiciones pueden empeorar.', 1, 'seguridad');

        -- Pregunta 189
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Llevas 45 minutos navegando y notas nubes oscuras acercándose y baja la temperatura. ¿Qué haces?',
            '45 minutu daramatzazu nabigatzen eta hodei ilunak hurbiltzen ari direla eta tenperatura jaitsi dela ohartzen zara. Zer egiten duzu?',
            '[{"id": "A", "texto": "Seguir navegando, las nubes pueden pasar"}, {"id": "B", "texto": "Volver a puerto inmediatamente"}, {"id": "C", "texto": "Acelerar para terminar el recorrido"}, {"id": "D", "texto": "Esperar a que pase la tormenta en el agua"}]'::jsonb,
            'B', 'Nubes oscuras y bajada de temperatura son señales de cambio meteorológico adverso. Regresa inmediatamente.', 1, 'seguridad');

        -- Pregunta 190
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuántas viradas y trasluchadas mínimas debes hacer en el recorrido de navegación completa?',
            'Zenbat biraketa eta trasluchada egin behar dituzu gutxienez nabigazio osoko ibilbidean?',
            '[{"id": "A", "texto": "1 virada, 0 trasluchadas"}, {"id": "B", "texto": "Al menos 4 viradas y 2 trasluchadas"}, {"id": "C", "texto": "10 viradas"}, {"id": "D", "texto": "No importa"}]'::jsonb,
            'B', 'El recorrido completo debe incluir al menos 4 viradas y 2 trasluchadas para demostrar dominio de ambas maniobras.', 1, 'practica');

        -- Pregunta 191
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué debes comunicar a alguien en tierra antes de salir?',
            'Zer jakinarazi behar diozu lurrean dagoen norbaiti irten aurretik?',
            '[{"id": "A", "texto": "Solo que te vas"}, {"id": "B", "texto": "Dónde vas, cuánto tiempo, a qué hora vuelves"}, {"id": "C", "texto": "Nada, es innecesario"}, {"id": "D", "texto": "Solo la hora de salida"}]'::jsonb,
            'B', 'Comunica siempre tu plan completo: zona de navegación, duración prevista y hora de regreso.', 1, 'seguridad');

        -- Pregunta 192
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué es una maniobra "tímida"?',
            'Zer da maniobra "koldar" edo "lotsati" bat?',
            '[{"id": "A", "texto": "Una maniobra bien ejecutada"}, {"id": "B", "texto": "Una maniobra indecisa y peligrosa"}, {"id": "C", "texto": "Una maniobra silenciosa"}, {"id": "D", "texto": "Una maniobra de principiante"}]'::jsonb,
            'B', '"Una maniobra tímida es una maniobra peligrosa." Ejecuta con decisión; la indecisión crea riesgo.', 1, 'seguridad');

        -- Pregunta 193
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Llevas 1 hour navegando y estás cansado pero queda buen viento. ¿Qué haces?',
            'Ordu bat daramazu nabigatzen eta nekatuta zaude baina haize ona dago. Zer egiten duzu?',
            '[{"id": "A", "texto": "Aprovecho el viento y sigo"}, {"id": "B", "texto": "Regreso a puerto; la fatiga reduce reflejos"}, {"id": "C", "texto": "Descanso 5 minutos y sigo"}, {"id": "D", "texto": "Pido a alguien que me sustituya"}]'::jsonb,
            'B', 'Cuando estás cansado, tus reflejos y capacidad de decisión bajan. Vuelve antes de agotarte.', 1, 'seguridad');

        -- Pregunta 194
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuánto dura aproximadamente una navegación completa de práctica?',
            'Zenbat irauten du gutxi gorabehera praktikarako nabigazio oso batek?',
            '[{"id": "A", "texto": "15 minutos"}, {"id": "B", "texto": "60-90 minutos"}, {"id": "C", "texto": "4 horas"}, {"id": "D", "texto": "Todo el día"}]'::jsonb,
            'B', 'La navegación completa autónoma, desde preparación hasta recogida, dura entre 60 y 90 minutos.', 1, 'practica');

        -- Pregunta 195
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Antes de salir, ¿qué es lo primero de la fase de preparación?',
            'Irten aurretik, zein da prestaketa-faseko lehen urratsa?',
            '[{"id": "A", "texto": "Aparjar el barco"}, {"id": "B", "texto": "Consultar el parte meteorológico"}, {"id": "C", "texto": "Ponerse el bañador"}, {"id": "D", "texto": "Llevar el barco al agua"}]'::jsonb,
            'B', 'Siempre consultar la meteo primero: ¿viento entre 5-15 nudos? ¿sin tormentas?', 1, 'seguridad');

        -- Pregunta 196
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso', 
            'Después de la navegación, no es necesario enjuagar el barco con agua dulce.',
            'Nabigazioaren ondoren, ez da beharrezkoa ontzia ur gozoz garbitzea.',
            'Falso', 'Enjuagar con agua dulce elimina la sal, que corroe herrajes y deteriora materiales. Es parte del mantenimiento correcto.', 1, 'practica');

        -- Pregunta 197
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'En la autoevaluación post-navegación, ¿qué debes reflexionar?',
            'Nabigazio osteko autoebaluazioan, zeri buruz hausnartu behar duzu?',
            '[{"id": "A", "texto": "Solo lo que hice bien"}, {"id": "B", "texto": "Solo lo que hice mal"}, {"id": "C", "texto": "Qué hice bien Y qué puedo mejorar"}, {"id": "D", "texto": "No es necesaria"}]'::jsonb,
            'C', 'La autoevaluación es clave para progresar: reconocer aciertos y áreas de mejora.', 1, 'practica');

        -- Pregunta 198
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            'Que se te rompe el timón a medio recorrido. ¿Qué haces?',
            'Ibilbide erdian timoia apurtzen zaizu. Zer egiten duzu?',
            '[{"id": "A", "texto": "Sigo navegando sin timón"}, {"id": "B", "texto": "Vuelvo a puerto usando la vela y el peso del cuerpo para gobernar"}, {"id": "C", "texto": "Salto al agua"}, {"id": "D", "texto": "Llamo por móvil"}]'::jsonb,
            'B', 'Si falla cualquier parte del equipo, vuelta a puerto. Puedes gobernar parcialmente con el peso y la vela, o pedir ayuda.', 1, 'seguridad');

        -- Pregunta 199
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Cuál es la prueba de que has completado la Iniciación a la Vela Ligera?',
            'Zein da Bela Arineko Hasiera osatu duzunaren froga?',
            '[{"id": "A", "texto": "Aprobar un examen escrito"}, {"id": "B", "texto": "Completar una navegación completa autónoma (preparación, navegación con todas las maniobras, recogida)"}, {"id": "C", "texto": "Navegar 100 horas"}, {"id": "D", "texto": "Ganar una regata"}]'::jsonb,
            'B', 'Si puedes hacer todo de forma autónoma — desde aparejar hasta recoger, pasando por todos los rumbos y maniobras — has completado el curso.', 1, 'practica');

        -- Pregunta 200
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple', 
            '¿Qué debes hacer al levantar la orza al acercarte a aguas poco profundas?',
            'Zer egin behar duzu orza igotzean ur sakonera txikikoetara hurbiltzean?',
            '[{"id": "A", "texto": "No levantar la orza nunca"}, {"id": "B", "texto": "Levantar la orza para que no toque fondo y se dañe"}, {"id": "C", "texto": "Sacar la orza completamente del barco"}, {"id": "D", "texto": "Poner la orza horizontal"}]'::jsonb,
            'B', 'Al llegar a aguas poco profundas, levantas la orza parcialmente para que no roce el fondo y no se dañe.', 1, 'practica');

    ELSE
        RAISE NOTICE 'Unidad "Tu Primera Navegación Completa" no encontrada.';
    END IF;

    RAISE NOTICE 'Banco de preguntas Parte 4 (Unidades 11-12) insertado correctamente.';

END $$;
=======
-- =====================================================
-- SEED: Banco de Preguntas - Parte 4 (Unidades 11-12)
-- =====================================================
-- Fuente: contenido_academico/curso1_banco_preguntas_parte4.md
-- Total Preguntas: 40 (161-200)

DO $$
DECLARE
    v_unidad_id UUID;
BEGIN

    -- =====================================================
    -- UNIDAD 11: Nudos Esenciales (Q161-180)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'nudos-basicos';

    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 161
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuál es el "rey de los nudos náuticos"?',
            'Zein da "itsas-korapiloen erregea"?',
            '[{"id": "A", "texto": "El nudo llano"}, {"id": "B", "texto": "El ballestrinque"}, {"id": "C", "texto": "El as de guía (bowline)"}, {"id": "D", "texto": "El nudo de ocho"}]'::jsonb,
            'C', 'El as de guía forma un lazo que no se aprieta bajo carga y se deshace fácilmente. Es el nudo más versátil y útil.', 1, 'nudos');

        -- Pregunta 162
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Para qué sirve el nudo de ocho?',
            'Zertarako balio du zortziko korapiloak?',
            '[{"id": "A", "texto": "Para unir dos cabos"}, {"id": "B", "texto": "Para hacer un lazo fijo"}, {"id": "C", "texto": "Para impedir que un cabo se escape por una polea"}, {"id": "D", "texto": "Para amarrar a un poste"}]'::jsonb,
            'C', 'El nudo de ocho es un nudo de tope que impide que el cabo (por ejemplo, la escota) se escape por la polea.', 1, 'nudos');

        -- Pregunta 163
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso',
            'Las escotas deben llevar siempre un nudo de ocho en su extremo.',
            'Eskotek zortziko korapilo bat eraman behar dute beti muturrean.',
            'Verdadero', 'Sin un nudo de ocho, la escota puede escaparse por la polea y perderías completamente el control de la vela.', 1, 'seguridad');

        -- Pregunta 164
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué nudo usarías para amarrar un cabo a un poste o barra?',
            'Zein korapilo erabiliko zenuke kabe bat zutoin edo barra batean amarratzeko?',
            '[{"id": "A", "texto": "As de guía"}, {"id": "B", "texto": "Ballestrinque"}, {"id": "C", "texto": "Nudo de ocho"}, {"id": "D", "texto": "Nudo llano"}]'::jsonb,
            'B', 'El ballestrinque (clove hitch) sirve para amarrar temporalmente un cabo a un poste o barra cilíndrica.', 1, 'nudos');

        -- Pregunta 165
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'La vuelta de cornamusa sirve para:',
            'Kornamuza-birak balio du:',
            '[{"id": "A", "texto": "Unir dos cabos"}, {"id": "B", "texto": "Asegurar un cabo en una cornamusa (pieza en forma de T)"}, {"id": "C", "texto": "Hacer un lazo"}, {"id": "D", "texto": "Amarrar el ancla"}]'::jsonb,
            'B', 'La vuelta de cornamusa asegura cabos (drizas, amarras) en las cornamusas del barco formando un "8" y rematando con un cote.', 1, 'nudos');

        -- Pregunta 166
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué nudo usarías para unir temporalmente dos cabos del mismo grosor?',
            'Zein korapilo erabiliko zenuke lodiera bereko bi kabe aldi baterako lotzeko?',
            '[{"id": "A", "texto": "As de guía"}, {"id": "B", "texto": "Ballestrinque"}, {"id": "C", "texto": "Nudo de ocho"}, {"id": "D", "texto": "Nudo llano (reef knot)"}]'::jsonb,
            'D', 'El nudo llano une dos cabos del mismo diámetro. Se hace "derecha sobre izquierda, luego izquierda sobre derecha".', 1, 'nudos');

        -- Pregunta 167
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué es un "nudo de vaca"?',
            'Zer da "behi-korapilo" bat?',
            '[{"id": "A", "texto": "Un nudo náutico avanzado"}, {"id": "B", "texto": "Un error al hacer el nudo llano que se desliza bajo carga"}, {"id": "C", "texto": "Un nudo decorativo"}, {"id": "D", "texto": "Un tipo de amarre"}]'::jsonb,
            'B', 'Si al hacer el nudo llano haces "derecha-derecha" o "izquierda-izquierda", obtienes un nudo de vaca que se desliza. El llano is symmetric.', 1, 'nudos');

        -- Pregunta 168
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso',
            'Un buen nudo náutico debe aguantar la carga y poder deshacerse fácilmente después.',
            'Itsas-korapilo on batek kargari eutsi behar dio eta ondoren erraz askatu ahal izan behar du.',
            'Verdadero', 'Las tres reglas del buen nudo: se hace rápido, aguanta la carga, y se deshace fácilmente incluso después de tensión.', 1, 'teoria');

        -- Pregunta 169
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuántas veces mínimo debes repetir cada nudo para aprenderlo bien?',
            'Zenbat bider gutxienez errepikatu behar duzu korapilo bakoitza ondo ikasteko?',
            '[{"id": "A", "texto": "5 veces"}, {"id": "B", "texto": "10 veces"}, {"id": "C", "texto": "50 veces mínimo"}, {"id": "D", "texto": "3 veces"}]'::jsonb,
            'C', 'Los nudos se aprenden con las manos, no los ojos. Se necesitan al menos 50 repeticiones hasta que te salgan sin mirar.', 1, 'practica');

        -- Pregunta 170
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuál es el método mnemotécnico para hacer el as de guía?',
            'Zein da as de guia egiteko metodo mnemoteknikoa?',
            '[{"id": "A", "texto": "El método del marinero"}, {"id": "B", "texto": "El método del conejo (sale de la madriguera, rodea el árbol, vuelve a la madriguera)"}, {"id": "C", "texto": "El método de la serpiente"}, {"id": "D", "texto": "El método del ocho"}]'::jsonb,
            'B', 'El conejo sale del lago, rodea el árbol (firme del cabo) y vuelve a bajar al lago. Es la forma más fácil de recordar.', 1, 'practica');

        -- Pregunta 171
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Necesitas asegurar la driza después de izar la vela. ¿Qué nudo usas?',
            'Driza ziurtatu behar duzu bela igo ondoren. Zein korapilo erabiltzen duzu?',
            '[{"id": "A", "texto": "As de guía"}, {"id": "B", "texto": "Nudo de ocho"}, {"id": "C", "texto": "Vuelta de cornamusa"}, {"id": "D", "texto": "Nudo llano"}]'::jsonb,
            'C', 'La driza se asegura en la cornamusa del mástil usando una vuelta de cornamusa con cote final.', 1, 'practica');

        -- Pregunta 172
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué ventaja del as de guía lo hace útil para rescate?',
            'As de guíaren zein abantailak egiten du erabilgarria erreskatearako?',
            '[{"id": "A", "texto": "Es decorativo"}, {"id": "B", "texto": "Forma un lazo que NO se aprieta bajo carga, no te estrangula"}, {"id": "C", "texto": "Es el nudo más fácil"}, {"id": "D", "texto": "Se ata solo"}]'::jsonb,
            'B', 'El lazo del as de guía no se cierra bajo peso, por lo que es seguro para pasar por el cuerpo en un rescate.', 1, 'seguridad');

        -- Pregunta 173
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué pasa si no pones nudo de ocho al final de la escota?',
            'Zer gertatzen da eskotaren amaieran zortziko korapiloa jartzen ez baduzu?',
            '[{"id": "A", "texto": "Nada"}, {"id": "B", "texto": "La escota se sale por la polea y pierdes el control de la vela"}, {"id": "C", "texto": "El barco va más rápido"}, {"id": "D", "texto": "La vela se cae"}]'::jsonb,
            'B', 'Sin nudo de tope, la escota se escapa por la polea y no puedes controlar la vela en absoluto.', 1, 'practica');

        -- Pregunta 174
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso',
            'El ballestrinque es un amarre infalible que nunca se desliza.',
            'Ballestrinkea amarre hutsezina da, inoiz ez duena irrist egiten.',
            'Falso', 'El ballestrinque puede deslizarse si la carga cambia de dirección. Es un amarre rápido pero no definitivo.', 1, 'teoria');

        -- Pregunta 175
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cómo se deshace un as de guía?',
            'Nola askatzen da as de guia bat?',
            '[{"id": "A", "texto": "Cortando el cabo"}, {"id": "B", "texto": "Empujando el chicote hacia arriba"}, {"id": "C", "texto": "Tirando fuerte del firme"}, {"id": "D", "texto": "No se puede deshacer"}]'::jsonb,
            'B', 'Se empuja el chicote hacia arriba y el nudo se afloja limpiamente, incluso después de haber soportado carga.', 1, 'practica');

        -- Pregunta 176
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué es el "chicote" de un cabo?',
            'Zer da kabe baten "chikotea"?',
            '[{"id": "A", "texto": "La parte central del cabo"}, {"id": "B", "texto": "El extremo libre del cabo"}, {"id": "C", "texto": "La parte enrollada"}, {"id": "D", "texto": "El nudo del cabo"}]'::jsonb,
            'B', 'El chicote es el extremo libre del cabo, el que se usa para hacer nudos. El "firme" es la parte fija.', 1, 'teoria');

        -- Pregunta 177
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Estás navegando con una sola mano en la caña y necesitas hacer un nudo rápido. ¿Cuál practicarías?',
            'Esku bakarrarekin kainean nabigatzen ari zara eta korapilo azkar bat egin behar duzu. Zein praktikatuko zenuke?',
            '[{"id": "A", "texto": "Nudo llano con una mano"}, {"id": "B", "texto": "As de guía con una sola mano"}, {"id": "C", "texto": "Vuelta de cornamusa con los pies"}, {"id": "D", "texto": "Ballestrinque de fantasía"}]'::jsonb,
            'B', 'Se recomienda practicar el as de guía con una sola mano para situaciones donde la otra sostiene la caña.', 1, 'practica');

        -- Pregunta 178
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Un nudo que se aprieta tanto que no se puede soltar es:',
            'Hainbeste estutzen den korapilo bat, ezin dena askatu, honako hau da:',
            '[{"id": "A", "texto": "Un buen nudo"}, {"id": "B", "texto": "Un mal nudo — los buenos nudos siempre se sueltan"}, {"id": "C", "texto": "Normal bajo carga"}, {"id": "D", "texto": "El as de guía"}]'::jsonb,
            'B', 'Un buen nudo náutico se deshace fácilmente incluso después de estar bajo tensión. Si no se suelta, es un mal nudo.', 1, 'teoria');

        -- Pregunta 179
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿En qué tiempo deberías poder hacer un as de guía como objetivo?',
            'Zein denboratan egin beharko zenuke as de guia helburu gisa?',
            '[{"id": "A", "texto": "1 minuto"}, {"id": "B", "texto": "Menos de 10 segundos"}, {"id": "C", "texto": "5 minutos"}, {"id": "D", "texto": "No importa el tiempo"}]'::jsonb,
            'B', 'El objetivo es hacerlo en menos de 10 segundos, ya que en emergencias la rapidez es crucial.', 1, 'practica');

        -- Pregunta 180
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'La vuelta de cornamusa se remata con:',
            'Kornamuza-birari amaiera ematen zaio honekin:',
            '[{"id": "A", "texto": "Un nudo de ocho"}, {"id": "B", "texto": "Un cote (medio nudo por dentro) para bloquear"}, {"id": "C", "texto": "Un lazo"}, {"id": "D", "texto": "Nada, se deja suelta"}]'::jsonb,
            'B', 'Tras las vueltas en "8" alrededor de la cornamusa, se remata con un cote para bloquear y que no se suelte.', 1, 'nudos');

    ELSE
        RAISE NOTICE 'Unidad "Nudos Esenciales" no encontrada.';
    END IF;


    -- =====================================================
    -- UNIDAD 12: Tu Primera Navegación Completa (Q181-200)
    -- =====================================================
    SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE slug = 'tu-primera-navegacion';

    IF v_unidad_id IS NOT NULL THEN
        DELETE FROM public.preguntas WHERE entidad_id = v_unidad_id AND entidad_tipo = 'unidad';

        -- Pregunta 181
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuántas fases tiene una navegación completa?',
            'Zenbat fase ditu nabigazio oso batek?',
            '[{"id": "A", "texto": "2"}, {"id": "B", "texto": "3"}, {"id": "C", "texto": "4 (preparación, botadura/salida, navegación, llegada/recogida)"}, {"id": "D", "texto": "6"}]'::jsonb,
            'C', 'Las cuatro fases son: preparación en tierra, botadura y salida, navegación y llegada con recogida.', 1, 'practica');

        -- Pregunta 182
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuál es el recorrido recomendado para una primera navegación completa?',
            'Zein da gomendatutako ibilbidea lehen nabigazio oso baterako?',
            '[{"id": "A", "texto": "Línea recta ida y vuelta"}, {"id": "B", "texto": "Un triángulo con ceñida, través, largo y ceñida de regreso"}, {"id": "C", "texto": "Navegar en círculos"}, {"id": "D", "texto": "Seguir a otro barco"}]'::jsonb,
            'B', 'El recorrido triangular permite practicar todos los rumbos y maniobras en una sola salida.', 1, 'practica');

        -- Pregunta 183
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué son las "tres A" de una navegación segura?',
            'Zer dira nabigazio seguru baten "hiru A"-ak?',
            '[{"id": "A", "texto": "Agua, Aire, Arena"}, {"id": "B", "texto": "Anticipar, Actuar, Adaptar"}, {"id": "C", "texto": "Atar, Arrancar, Amarrar"}, {"id": "D", "texto": "Aparejo, Ancla, Amarre"}]'::jsonb,
            'B', 'Anticipar (planifica), Actuar (ejecuta con decisión) y Adaptar (modifica si cambian las condiciones).', 1, 'seguridad');

        -- Pregunta 184
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso',
            'Si navegas toda la ida con viento de popa, la vuelta será fácil y rápida.',
            'Joateko bide osoa popako haizearekin nabigatzen baduzu, itzulera erraza eta azkarra izango da.',
            'Falso', 'Si vas con viento de popa, la vuelta será en ceñida contra el viento y tardará el doble. Planifica ida y vuelta.', 1, 'practica');

        -- Pregunta 185
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuándo debes volver a puerto?',
            'Noiz itzuli behar duzu portura?',
            '[{"id": "A", "texto": "Solo cuando se acabe el tiempo"}, {"id": "B", "texto": "Si sube el viento, cambia la meteo, estás cansado o falla el equipo"}, {"id": "C", "texto": "Nunca, hay que aguantar"}, {"id": "D", "texto": "Solo si te lo dice el instructor"}]'::jsonb,
            'B', 'Vuelve si suben las condiciones, si estás cansado, si falla algo del equipo o si cambia la meteo.', 1, 'seguridad');

        -- Pregunta 186
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué haces al acercarte a la playa para llegar?',
            'Zer egiten duzu hondartzara iristeko hurbiltzean?',
            '[{"id": "A", "texto": "Llegar a máxima velocidad"}, {"id": "B", "texto": "Llegar lentamente, poner proa al viento para detenerte"}, {"id": "C", "texto": "Saltar del barco antes de llegar"}, {"id": "D", "texto": "Bajar la vela lejos de la playa"}]'::jsonb,
            'B', 'Te acercas despacio, pones proa al viento para parar, levantas la orza en aguas poco profundas y luego saltas al agua.', 1, 'practica');

        -- Pregunta 187
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué debes hacer con el barco después de sacarlo del agua?',
            'Zer egin behar duzu ontziarekin uretatik atera ondoren?',
            '[{"id": "A", "texto": "Dejarlo tal cual hasta el próximo día"}, {"id": "B", "texto": "Enjuagarlo con agua dulce, arriar la vela, desmontar el timón, guardar el equipo"}, {"id": "C", "texto": "Solo quitarle la vela"}, {"id": "D", "texto": "Taparlo con una lona"}]'::jsonb,
            'B', 'Un barco bien guardado se conserva mejor: enjuagar, arriar vela, desmontar timón, guardar equipo.', 1, 'practica');

        -- Pregunta 188
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso',
            '"Siempre mejor volver una hora antes que una hora después" es una regla de navegación.',
            '"Beti hobe da ordu bat lehenago itzultzea ordu bat geroago baino" nabigazio-arau bat da.',
            'Verdadero', 'Es una regla fundamental de prudencia: la fatiga reduce reflejos, las condiciones pueden empeorar.', 1, 'seguridad');

        -- Pregunta 189
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Llevas 45 minutos navegando y notas nubes oscuras acercándose y baja la temperatura. ¿Qué haces?',
            '45 minutu daramatzazu nabigatzen eta hodei ilunak hurbiltzen ari direla eta tenperatura jaitsi dela ohartzen zara. Zer egiten duzu?',
            '[{"id": "A", "texto": "Seguir navegando, las nubes pueden pasar"}, {"id": "B", "texto": "Volver a puerto inmediatamente"}, {"id": "C", "texto": "Acelerar para terminar el recorrido"}, {"id": "D", "texto": "Esperar a que pase la tormenta en el agua"}]'::jsonb,
            'B', 'Nubes oscuras y bajada de temperatura son señales de cambio meteorológico adverso. Regresa inmediatamente.', 1, 'seguridad');

        -- Pregunta 190
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuántas viradas y trasluchadas mínimas debes hacer en el recorrido de navegación completa?',
            'Zenbat biraketa eta trasluchada egin behar dituzu gutxienez nabigazio osoko ibilbidean?',
            '[{"id": "A", "texto": "1 virada, 0 trasluchadas"}, {"id": "B", "texto": "Al menos 4 viradas y 2 trasluchadas"}, {"id": "C", "texto": "10 viradas"}, {"id": "D", "texto": "No importa"}]'::jsonb,
            'B', 'El recorrido completo debe incluir al menos 4 viradas y 2 trasluchadas para demostrar dominio de ambas maniobras.', 1, 'practica');

        -- Pregunta 191
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué debes comunicar a alguien en tierra antes de salir?',
            'Zer jakinarazi behar diozu lurrean dagoen norbaiti irten aurretik?',
            '[{"id": "A", "texto": "Solo que te vas"}, {"id": "B", "texto": "Dónde vas, cuánto tiempo, a qué hora vuelves"}, {"id": "C", "texto": "Nada, es innecesario"}, {"id": "D", "texto": "Solo la hora de salida"}]'::jsonb,
            'B', 'Comunica siempre tu plan completo: zona de navegación, duración prevista y hora de regreso.', 1, 'seguridad');

        -- Pregunta 192
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué es una maniobra "tímida"?',
            'Zer da maniobra "koldar" edo "lotsati" bat?',
            '[{"id": "A", "texto": "Una maniobra bien ejecutada"}, {"id": "B", "texto": "Una maniobra indecisa y peligrosa"}, {"id": "C", "texto": "Una maniobra silenciosa"}, {"id": "D", "texto": "Una maniobra de principiante"}]'::jsonb,
            'B', '"Una maniobra tímida es una maniobra peligrosa." Ejecuta con decisión; la indecisión crea riesgo.', 1, 'seguridad');

        -- Pregunta 193
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Llevas 1 hour navegando y estás cansado pero queda buen viento. ¿Qué haces?',
            'Ordu bat daramazu nabigatzen eta nekatuta zaude baina haize ona dago. Zer egiten duzu?',
            '[{"id": "A", "texto": "Aprovecho el viento y sigo"}, {"id": "B", "texto": "Regreso a puerto; la fatiga reduce reflejos"}, {"id": "C", "texto": "Descanso 5 minutos y sigo"}, {"id": "D", "texto": "Pido a alguien que me sustituya"}]'::jsonb,
            'B', 'Cuando estás cansado, tus reflejos y capacidad de decisión bajan. Vuelve antes de agotarte.', 1, 'seguridad');

        -- Pregunta 194
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuánto dura aproximadamente una navegación completa de práctica?',
            'Zenbat irauten du gutxi gorabehera praktikarako nabigazio oso batek?',
            '[{"id": "A", "texto": "15 minutos"}, {"id": "B", "texto": "60-90 minutos"}, {"id": "C", "texto": "4 horas"}, {"id": "D", "texto": "Todo el día"}]'::jsonb,
            'B', 'La navegación completa autónoma, desde preparación hasta recogida, dura entre 60 y 90 minutos.', 1, 'practica');

        -- Pregunta 195
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Antes de salir, ¿qué es lo primero de la fase de preparación?',
            'Irten aurretik, zein da prestaketa-faseko lehen urratsa?',
            '[{"id": "A", "texto": "Aparjar el barco"}, {"id": "B", "texto": "Consultar el parte meteorológico"}, {"id": "C", "texto": "Ponerse el bañador"}, {"id": "D", "texto": "Llevar el barco al agua"}]'::jsonb,
            'B', 'Siempre consultar la meteo primero: ¿viento entre 5-15 nudos? ¿sin tormentas?', 1, 'seguridad');

        -- Pregunta 196
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'verdadero_falso',
            'Después de la navegación, no es necesario enjuagar el barco con agua dulce.',
            'Nabigazioaren ondoren, ez da beharrezkoa ontzia ur gozoz garbitzea.',
            'Falso', 'Enjuagar con agua dulce elimina la sal, que corroe herrajes y deteriora materiales. Es parte del mantenimiento correcto.', 1, 'practica');

        -- Pregunta 197
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'En la autoevaluación post-navegación, ¿qué debes reflexionar?',
            'Nabigazio osteko autoebaluazioan, zeri buruz hausnartu behar duzu?',
            '[{"id": "A", "texto": "Solo lo que hice bien"}, {"id": "B", "texto": "Solo lo que hice mal"}, {"id": "C", "texto": "Qué hice bien Y qué puedo mejorar"}, {"id": "D", "texto": "No es necesaria"}]'::jsonb,
            'C', 'La autoevaluación es clave para progresar: reconocer aciertos y áreas de mejora.', 1, 'practica');

        -- Pregunta 198
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            'Que se te rompe el timón a medio recorrido. ¿Qué haces?',
            'Ibilbide erdian timoia apurtzen zaizu. Zer egiten duzu?',
            '[{"id": "A", "texto": "Sigo navegando sin timón"}, {"id": "B", "texto": "Vuelvo a puerto usando la vela y el peso del cuerpo para gobernar"}, {"id": "C", "texto": "Salto al agua"}, {"id": "D", "texto": "Llamo por móvil"}]'::jsonb,
            'B', 'Si falla cualquier parte del equipo, vuelta a puerto. Puedes gobernar parcialmente con el peso y la vela, o pedir ayuda.', 1, 'seguridad');

        -- Pregunta 199
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Cuál es la prueba de que has completado la Iniciación a la Vela Ligera?',
            'Zein da Bela Arineko Hasiera osatu duzunaren froga?',
            '[{"id": "A", "texto": "Aprobar un examen escrito"}, {"id": "B", "texto": "Completar una navegación completa autónoma (preparación, navegación con todas las maniobras, recogida)"}, {"id": "C", "texto": "Navegar 100 horas"}, {"id": "D", "texto": "Ganar una regata"}]'::jsonb,
            'B', 'Si puedes hacer todo de forma autónoma — desde aparejar hasta recoger, pasando por todos los rumbos y maniobras — has completado el curso.', 1, 'practica');

        -- Pregunta 200
        INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, puntos, categoria)
        VALUES ('unidad', v_unidad_id, 'opcion_multiple',
            '¿Qué debes hacer al levantar la orza al acercarte a aguas poco profundas?',
            'Zer egin behar duzu orza igotzean ur sakonera txikikoetara hurbiltzean?',
            '[{"id": "A", "texto": "No levantar la orza nunca"}, {"id": "B", "texto": "Levantar la orza para que no toque fondo y se dañe"}, {"id": "C", "texto": "Sacar la orza completamente del barco"}, {"id": "D", "texto": "Poner la orza horizontal"}]'::jsonb,
            'B', 'Al llegar a aguas poco profundas, levantas la orza parcialmente para que no roce el fondo y no se dañe.', 1, 'practica');

    ELSE
        RAISE NOTICE 'Unidad "Tu Primera Navegación Completa" no encontrada.';
    END IF;

    RAISE NOTICE 'Banco de preguntas Parte 4 (Unidades 11-12) insertado correctamente.';

END $$;
>>>>>>> pr-286
