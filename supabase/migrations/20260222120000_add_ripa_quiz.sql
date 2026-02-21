-- =====================================================
-- MIGRATION: Añadir Quiz Específico RIPA (50 Preguntas)
-- =====================================================

DO $$
DECLARE
    v_curso_id UUID;
    v_modulo_id UUID;
    v_evaluacion_id UUID;
BEGIN
    -- 1. Obtener ID del Curso (Iniciación a la Vela Ligera)
    SELECT id INTO v_curso_id FROM public.cursos WHERE slug = 'iniciacion-vela-ligera';

    IF v_curso_id IS NULL THEN
        RAISE NOTICE 'Curso "iniciacion-vela-ligera" no encontrado. Saltando migración.';
        RETURN;
    END IF;

    -- 2. Crear Módulo "RIPA Avanzado"
    INSERT INTO public.modulos (curso_id, slug, nombre_es, nombre_eu, descripcion_es, descripcion_eu, orden, duracion_estimada_h, objetivos_json)
    VALUES (
        v_curso_id,
        'ripa-avanzado',
        'RIPA - Reglamento Internacional (Nivel Patrón)',
        'RIPA - Nazioarteko Araudia (Patroi Maila)',
        'Módulo específico avanzado sobre el Reglamento Internacional para Prevenir Abordajes (RIPA). Incluye luces, marcas, señales acústicas y reglas de rumbo y gobierno.',
        'Talken Prebentziorako Nazioarteko Araudiari (RIPA) buruzko modulu espezifiko aurreratua. Argiak, markak, seinale akustikoak eta norabide eta gobernu arauak barne.',
        4, -- Orden 4 (después del módulo 3)
        10,
        '["Dominar el RIPA completo", "Identificar luces y marcas de buques especiales", "Conocer las reglas de rumbo y gobierno en todas las condiciones", "Interpretar señales acústicas y luminosas"]'::jsonb
    )
    ON CONFLICT (slug) DO UPDATE SET
        nombre_es = EXCLUDED.nombre_es,
        nombre_eu = EXCLUDED.nombre_eu,
        descripcion_es = EXCLUDED.descripcion_es,
        descripcion_eu = EXCLUDED.descripcion_eu,
        objetivos_json = EXCLUDED.objetivos_json
    RETURNING id INTO v_modulo_id;

    -- 3. Crear Evaluación "Examen RIPA Completo"
    INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, intentos_maximos, cooldown_minutos, activa)
    VALUES (
        'examen_modulo',
        'modulo',
        v_modulo_id,
        'Examen RIPA Completo (50 Preguntas)',
        'RIPA Azterketa Osoa (50 Galdera)',
        50,
        60,
        70.00,
        5,
        60,
        true
    )
    ON CONFLICT (entidad_tipo, entidad_id, tipo) DO UPDATE SET
        num_preguntas = 50,
        tiempo_limite_min = 60,
        titulo_es = EXCLUDED.titulo_es,
        titulo_eu = EXCLUDED.titulo_eu
    RETURNING id INTO v_evaluacion_id;

    -- 4. Insertar Preguntas (Limpiar existentes primero para evitar duplicados si se re-ejecuta con cambios)
    DELETE FROM public.preguntas WHERE evaluacion_id = v_evaluacion_id;

    -- =====================================================
    -- PREGUNTAS: REGLAS DE RUMBO Y GOBIERNO (20)
    -- =====================================================

    -- 1. Cruce
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta, imagen_url)
    VALUES (v_evaluacion_id,
        'Dos buques de propulsión mecánica se cruzan con riesgo de abordaje. Usted ve al otro por su costado de estribor. ¿Qué debe hacer?',
        'Propultsio mekanikoko bi ontzi gurutzatzen dira talka egiteko arriskuarekin. Bestea istriborreko albotik ikusten duzu. Zer egin behar duzu?',
        'multiple_choice', 1,
        '{"a": "Mantener rumbo y velocidad", "b": "Maniobrar para ceder el paso", "c": "Aumentar velocidad para pasar por proa", "d": "Emitir 5 pitadas cortas"}'::jsonb,
        '{"a": "Norabidea eta abiadura mantendu", "b": "Maniobratu bidea uzteko", "c": "Abiadura handitu brankatik pasatzeko", "d": "5 pitada labur eman"}'::jsonb,
        '{"respuesta_correcta": "b", "explicacion_es": "Regla 15: Cuando dos buques de propulsión mecánica se crucen con riesgo de abordaje, el buque que tenga al otro por su costado de estribor se mantendrá apartado de la derrota de este otro.", "explicacion_eu": "15. Araua: Bi ontzi gurutzatzen direnean, istriborrean bestea duenak bidea utzi behar dio."}'::jsonb,
        'https://placehold.co/600x300/1a365d/white?text=Situacion+Cruce+Estribor'
    );

    -- 2. Vuelta encontrada
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta, imagen_url)
    VALUES (v_evaluacion_id,
        'Dos buques de propulsión mecánica navegan de vuelta encontrada a rumbos opuestos con riesgo de abordaje. ¿Qué maniobra deben realizar?',
        'Bi ontzi mekaniko aurrez aurre datoz talka arriskuarekin. Zer maniobra egin behar dute?',
        'multiple_choice', 2,
        '{"a": "Ambos caerán a babor", "b": "Ambos caerán a estribor", "c": "El de barlovento maniobra", "d": "El más rápido maniobra"}'::jsonb,
        '{"a": "Biak ababorrera eroriko dira", "b": "Biak istriborrera eroriko dira", "c": "Haizealdekoak maniobratuko du", "d": "Azkarrenak maniobratuko du"}'::jsonb,
        '{"respuesta_correcta": "b", "explicacion_es": "Regla 14: Cuando dos buques de propulsión mecánica naveguen de vuelta encontrada, cada uno caerá a estribor para pasar por la banda de babor del otro.", "explicacion_eu": "14. Araua: Aurrez aurre datozenean, biek istriborrera eroriko dira."}'::jsonb,
        'https://placehold.co/600x300/1a365d/white?text=Vuelta+Encontrada'
    );

    -- 3. Alcance
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        'Todo buque que alcance a otro, ¿qué obligación tiene?',
        'Beste bat harrapatzen duen ontziak, zer betebehar du?',
        'multiple_choice', 3,
        '{"a": "Mantenerse apartado de la derrota del buque alcanzado", "b": "Adelantar siempre por estribor", "c": "Adelantar siempre por babor", "d": "Esperar señal del buque alcanzado"}'::jsonb,
        '{"a": "Harrapatutako ontziaren bidetik aldendu", "b": "Beti istriborretik aurreratu", "c": "Beti ababorretik aurreratu", "d": "Harrapatutako ontziaren seinalea itxaron"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 13: Todo buque que alcance a otro se mantendrá apartado de la derrota del buque alcanzado.", "explicacion_eu": "13. Araua: Harrapatzen duen ontzia bestea saihestu behar du."}'::jsonb
    );

    -- 4. Vela vs Motor
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        'Un buque de vela y un buque de propulsión mecánica navegan con riesgo de abordaje. ¿Quién debe maniobrar?',
        'Belaontzi bat eta motordun ontzi bat talka arriskuarekin doaz. Nork maniobratu behar du?',
        'multiple_choice', 4,
        '{"a": "El de vela, porque es más maniobrable", "b": "El de propulsión mecánica, salvo casos especiales", "c": "El que venga por estribor", "d": "Ambos deben maniobrar"}'::jsonb,
        '{"a": "Belaontziak", "b": "Motordun ontziak, kasu bereziak izan ezik", "c": "Istriborretik datorrenak", "d": "Biek"}'::jsonb,
        '{"respuesta_correcta": "b", "explicacion_es": "Regla 18: Los buques de propulsión mecánica se mantendrán apartados de los buques de vela (salvo que el de vela sea el que alcanza).", "explicacion_eu": "18. Araua: Motordun ontziak belaontzia saihestu behar du."}'::jsonb
    );

    -- 5. Vela vs Vela (Viento distinto costado)
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        'Dos veleros navegan recibiendo el viento por costados distintos. ¿Cuál debe maniobrar?',
        'Bi belaontzi haizea alde ezberdinetatik jasotzen ari dira. Zeinek maniobratu behar du?',
        'multiple_choice', 5,
        '{"a": "El que recibe el viento por babor", "b": "El que recibe el viento por estribor", "c": "El que está a barlovento", "d": "El más rápido"}'::jsonb,
        '{"a": "Haizea ababorretik jasotzen duenak", "b": "Haizea istriborretik jasotzen duenak", "c": "Haizealdean dagoenak", "d": "Azkarrenak"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 12: Cuando reciban el viento por costados distintos, el buque que lo reciba por babor se mantendrá apartado de la derrota del otro.", "explicacion_eu": "12. Araua: Haizea ababorretik jasotzen duenak bidea utzi behar du."}'::jsonb
    );

    -- 6. Vela vs Vela (Viento mismo costado)
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        'Dos veleros navegan recibiendo el viento por el mismo costado. ¿Cuál debe maniobrar?',
        'Bi belaontzi haizea alde beretik jasotzen ari dira. Zeinek maniobratu behar du?',
        'multiple_choice', 6,
        '{"a": "El que está a sotavento", "b": "El que está a barlovento", "c": "El que va más rápido", "d": "El que va más lento"}'::jsonb,
        '{"a": "Haizebean dagoenak", "b": "Haizealdean dagoenak", "c": "Azkarrago doanak", "d": "Geldotsago doanak"}'::jsonb,
        '{"respuesta_correcta": "b", "explicacion_es": "Regla 12: Cuando reciban el viento por el mismo costado, el buque que esté a barlovento se mantendrá apartado de la derrota del que esté a sotavento.", "explicacion_eu": "12. Araua: Haizealdeko ontziak haizebekoa saihestu behar du."}'::jsonb
    );

    -- 7. Canal Angosto
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        'En un canal angosto, ¿por dónde debe navegar un buque?',
        'Kanal estu batean, nondik nabigatu behar du ontzi batek?',
        'multiple_choice', 7,
        '{"a": "Por el centro del canal", "b": "Lo más cerca posible del límite exterior que tenga por su estribor", "c": "Lo más cerca posible del límite exterior que tenga por su babor", "d": "Por donde haya más profundidad"}'::jsonb,
        '{"a": "Kanalaren erditik", "b": "Bere istriborreko mugatik ahalik eta gertuen", "c": "Bere ababorreko mugatik ahalik eta gertuen", "d": "Sakonera gehien dagoen lekutik"}'::jsonb,
        '{"respuesta_correcta": "b", "explicacion_es": "Regla 9: Los buques que naveguen a lo largo de un paso o canal angosto se mantendrán lo más cerca posible del límite exterior del paso o canal que quede por su costado de estribor.", "explicacion_eu": "9. Araua: Kanal estuetan, ontziak bere istriborreko ertzera hurbildu behar dira."}'::jsonb
    );

    -- 8. Dispositivo de Separación de Tráfico (DST)
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        '¿Cómo se debe cruzar una vía de circulación en un DST?',
        'Nola gurutzatu behar da zirkulazio-bide bat Trafikoa Banatzeko Dispositibo batean?',
        'multiple_choice', 8,
        '{"a": "Con el rumbo más conveniente", "b": "Lo más perpendicularmente posible a la dirección general de la corriente de tráfico", "c": "En diagonal y rápido", "d": "Está prohibido cruzar"}'::jsonb,
        '{"a": "Norabide erosoenean", "b": "Trafikoaren norabide orokorrarekiko ahalik eta perpendikularren", "c": "Diagonalean eta azkar", "d": "Debekatuta dago gurutzatzea"}'::jsonb,
        '{"respuesta_correcta": "b", "explicacion_es": "Regla 10: Si están obligados a cruzar una vía de circulación, lo harán lo más perpendicularmente posible a la dirección general de la corriente de tráfico.", "explicacion_eu": "10. Araua: Trafikoaren norabidearekiko ahalik eta perpendikularren gurutzatu behar da."}'::jsonb
    );

    -- 9. Responsabilidades entre buques
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        '¿A qué buque debe ceder el paso un buque de propulsión mecánica?',
        'Zein ontziri utzi behar dio bidea motordun ontzi batek?',
        'multiple_choice', 9,
        '{"a": "A un buque de pesca y a un buque de vela", "b": "Solo a buques sin gobierno", "c": "A cualquier buque más pequeño", "d": "A nadie si viene por estribor"}'::jsonb,
        '{"a": "Arrantza ontziari eta belaontziari", "b": "Gobernurik gabeko ontziei bakarrik", "c": "Edozein ontzi txikiagori", "d": "Inori ez istriborretik badator"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 18: Un buque de propulsión mecánica debe apartarse de: Sin gobierno, Capacidad de maniobra restringida, Dedicado a la pesca, Vela.", "explicacion_eu": "18. Araua: Motordun ontziak arrantza ontziei eta belaontziei bidea utzi behar die."}'::jsonb
    );

    -- 10. Velocidad de seguridad
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        '¿Qué factores determinan la velocidad de seguridad?',
        'Zein faktorek zehazten dute segurtasun-abiadura?',
        'multiple_choice', 10,
        '{"a": "Solo la visibilidad", "b": "El estado de la mar, visibilidad, densidad de tráfico, maniobrabilidad, luces de fondo, calado", "c": "La potencia del motor", "d": "La prisa del patrón"}'::jsonb,
        '{"a": "Ikuspena bakarrik", "b": "Itsasoaren egoera, ikuspena, trafikoa, maniobragarritasuna, hondo-argiak, sakonera", "c": "Motorraren potentzia", "d": "Patroiaren presa"}'::jsonb,
        '{"respuesta_correcta": "b", "explicacion_es": "Regla 6: Todo buque navegará en todo momento a una velocidad de seguridad. Factores: visibilidad, tráfico, maniobrabilidad, luces de fondo, viento/mar, calado.", "explicacion_eu": "6. Araua: Segurtasun-abiadura faktore askoren araberakoa da (ikuspena, trafikoa, etab)."}'::jsonb
    );

    -- =====================================================
    -- PREGUNTAS: LUCES Y MARCAS (20)
    -- =====================================================

    -- 11. Luz blanca todo horizonte
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta, imagen_url)
    VALUES (v_evaluacion_id,
        'Usted ve una luz blanca todo horizonte. ¿Qué puede ser?',
        'Horizonte osoko argi zuri bat ikusten duzu. Zer izan daiteke?',
        'multiple_choice', 11,
        '{"a": "Un buque fondeado de menos de 50m", "b": "Un buque de pesca", "c": "Un buque sin gobierno", "d": "Un remolcador"}'::jsonb,
        '{"a": "50m baino gutxiagoko ainguratutako ontzia", "b": "Arrantza ontzia", "c": "Gobernurik gabeko ontzia", "d": "Atoiontzia"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 30: Los buques fondeados de menos de 50 metros exhibirán en el lugar más visible una luz blanca todo horizonte.", "explicacion_eu": "30. Araua: 50m baino gutxiagoko ainguratutako ontziek argi zuri bat erakutsiko dute."}'::jsonb,
        'https://placehold.co/600x300/1a365d/white?text=Luz+Blanca+Todo+Horizonte'
    );

    -- 12. Pesca de arrastre
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta, imagen_url)
    VALUES (v_evaluacion_id,
        '¿Qué luces exhibe un buque dedicado a la pesca de arrastre?',
        'Zer argi erakusten ditu arraste-arrantzan ari den ontziak?',
        'multiple_choice', 12,
        '{"a": "Roja sobre blanca", "b": "Verde sobre blanca", "c": "Blanca sobre roja", "d": "Roja sobre roja"}'::jsonb,
        '{"a": "Gorria zuriaren gainean", "b": "Berdea zuriaren gainean", "c": "Zuria gorriaren gainean", "d": "Gorria gorriaren gainean"}'::jsonb,
        '{"respuesta_correcta": "b", "explicacion_es": "Regla 26: Los pesqueros de arrastre exhibirán dos luces todo horizonte en línea vertical, verde la superior y blanca la inferior.", "explicacion_eu": "26. Araua: Arraste-arrantzaleek berdea zuriaren gainean erakusten dute."}'::jsonb,
        'https://placehold.co/600x300/1a365d/white?text=Pesca+Arrastre+Luces'
    );

    -- 13. Pesca no arrastre
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta, imagen_url)
    VALUES (v_evaluacion_id,
        '¿Qué luces exhibe un buque pesquero que NO sea de arrastre?',
        'Zer argi erakusten ditu arrastean ari EZ den arrantza ontziak?',
        'multiple_choice', 13,
        '{"a": "Roja sobre blanca", "b": "Verde sobre blanca", "c": "Blanca sobre roja", "d": "Roja sobre roja"}'::jsonb,
        '{"a": "Gorria zuriaren gainean", "b": "Berdea zuriaren gainean", "c": "Zuria gorriaren gainean", "d": "Gorria gorriaren gainean"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 26: Los pesqueros (no arrastre) exhibirán roja sobre blanca todo horizonte.", "explicacion_eu": "26. Araua: Arrantzaleek (ez arrastekoak) gorria zuriaren gainean erakusten dute."}'::jsonb,
        'https://placehold.co/600x300/1a365d/white?text=Pesca+No+Arrastre+Luces'
    );

    -- 14. Sin Gobierno
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta, imagen_url)
    VALUES (v_evaluacion_id,
        '¿Qué luces identifican a un buque sin gobierno?',
        'Zein argik identifikatzen dute gobernurik gabeko ontzia?',
        'multiple_choice', 14,
        '{"a": "Dos luces rojas todo horizonte en línea vertical", "b": "Dos luces verdes todo horizonte", "c": "Roja, Blanca, Roja", "d": "Tres luces rojas"}'::jsonb,
        '{"a": "Bi argi gorri bertikalean", "b": "Bi argi berde bertikalean", "c": "Gorria, Zuria, Gorria", "d": "Hiru argi gorri"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 27: Un buque sin gobierno exhibirá dos luces rojas todo horizonte en línea vertical.", "explicacion_eu": "27. Araua: Gobernurik gabeko ontziak bi argi gorri bertikal erakutsiko ditu."}'::jsonb,
        'https://placehold.co/600x300/1a365d/white?text=Buque+Sin+Gobierno'
    );

    -- 15. Capacidad de Maniobra Restringida
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta, imagen_url)
    VALUES (v_evaluacion_id,
        '¿Qué luces exhibe un buque con capacidad de maniobra restringida?',
        'Zer argi erakusten ditu maniobra egiteko gaitasun mugatua duen ontziak?',
        'multiple_choice', 15,
        '{"a": "Roja, Blanca, Roja en línea vertical", "b": "Roja, Roja, Roja", "c": "Blanca, Roja, Blanca", "d": "Verde, Blanca, Verde"}'::jsonb,
        '{"a": "Gorria, Zuria, Gorria bertikalean", "b": "Gorria, Gorria, Gorria", "c": "Zuria, Gorria, Zuria", "d": "Berdea, Zuria, Berdea"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 27: Buque con capacidad de maniobra restringida exhibirá tres luces todo horizonte: Roja (arriba), Blanca (medio), Roja (abajo).", "explicacion_eu": "27. Araua: Maniobra mugatuko ontziak: Gorria, Zuria, Gorria."}'::jsonb,
        'https://placehold.co/600x300/1a365d/white?text=Maniobra+Restringida'
    );

    -- 16. Restringido por su Calado
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta, imagen_url)
    VALUES (v_evaluacion_id,
        '¿Qué luces exhibe un buque restringido por su calado?',
        'Zer argi erakusten ditu sakoneragatik mugatutako ontziak?',
        'multiple_choice', 16,
        '{"a": "Tres luces rojas todo horizonte en línea vertical", "b": "Tres luces verdes", "c": "Dos rojas", "d": "Una roja y una verde"}'::jsonb,
        '{"a": "Hiru argi gorri bertikalean", "b": "Hiru argi berde", "c": "Bi gorri", "d": "Gorri bat eta berde bat"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 28: Un buque restringido por su calado podrá exhibir tres luces rojas todo horizonte en línea vertical.", "explicacion_eu": "28. Araua: Sakoneragatik mugatutako ontziak hiru argi gorri bertikal erakutsi ditzake."}'::jsonb,
        'https://placehold.co/600x300/1a365d/white?text=Restringido+Calado'
    );

    -- 17. Práctico
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta, imagen_url)
    VALUES (v_evaluacion_id,
        '¿Qué luces identifican a un buque en servicio de practicaje?',
        'Zein argik identifikatzen dute praktiko zerbitzuan ari den ontzia?',
        'multiple_choice', 17,
        '{"a": "Blanca sobre Roja", "b": "Roja sobre Blanca", "c": "Verde sobre Blanca", "d": "Amarilla sobre Blanca"}'::jsonb,
        '{"a": "Zuria gorriaren gainean", "b": "Gorria zuriaren gainean", "c": "Berdea zuriaren gainean", "d": "Horia zuriaren gainean"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 29: Un buque en servicio de practicaje exhibirá dos luces todo horizonte: Blanca la superior y Roja la inferior.", "explicacion_eu": "29. Araua: Praktiko ontziak zuria gorriaren gainean erakusten du."}'::jsonb,
        'https://placehold.co/600x300/1a365d/white?text=Practico'
    );

    -- 18. Marca de Fondeo
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta, imagen_url)
    VALUES (v_evaluacion_id,
        '¿Qué marca debe exhibir un buque fondeado de día?',
        'Zer marka erakutsi behar du egunez ainguratutako ontziak?',
        'multiple_choice', 18,
        '{"a": "Una bola negra", "b": "Un rombo negro", "c": "Un cono negro", "d": "Dos bolas negras"}'::jsonb,
        '{"a": "Bola beltz bat", "b": "Erronbo beltz bat", "c": "Kono beltz bat", "d": "Bi bola beltz"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 30: Un buque fondeado exhibirá de día una bola negra en la parte de proa.", "explicacion_eu": "30. Araua: Ainguratutako ontziak bola beltz bat erakutsiko du egunez."}'::jsonb,
        'https://placehold.co/600x300/1a365d/white?text=Marca+Fondeo'
    );

    -- 19. Marca a Vela y Motor
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta, imagen_url)
    VALUES (v_evaluacion_id,
        '¿Qué marca debe exhibir un velero que navega a vela y motor simultáneamente?',
        'Zer marka erakutsi behar du bela eta motorrarekin batera nabigatzen duen belaontziak?',
        'multiple_choice', 19,
        '{"a": "Un cono con el vértice hacia abajo", "b": "Un cono con el vértice hacia arriba", "c": "Una bola negra", "d": "Un rombo"}'::jsonb,
        '{"a": "Kono bat erpinez behera", "b": "Kono bat erpinez gora", "c": "Bola beltz bat", "d": "Erronbo bat"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 25: Un buque que navegue a vela y a motor exhibirá a proa un cono con el vértice hacia abajo.", "explicacion_eu": "25. Araua: Bela eta motorrarekin doanak kono bat erpinez behera erakutsiko du."}'::jsonb,
        'https://placehold.co/600x300/1a365d/white?text=Marca+Vela+Motor'
    );

    -- 20. Remolque
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta, imagen_url)
    VALUES (v_evaluacion_id,
        'Un remolcador cuya longitud del remolque supere los 200m exhibirá de día:',
        '200m baino luzeagoa den atoia daraman atoiontziak egunez zer erakutsiko du?',
        'multiple_choice', 20,
        '{"a": "Un rombo negro", "b": "Una bola negra", "c": "Dos bolas negras", "d": "Un cono"}'::jsonb,
        '{"a": "Erronbo beltz bat", "b": "Bola beltz bat", "c": "Bi bola beltz", "d": "Kono bat"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 24: Cuando la longitud del remolque sea superior a 200 metros, exhibirá un rombo en el lugar más visible.", "explicacion_eu": "24. Araua: Atoia 200m baino luzeagoa denean, erronbo bat erakutsiko du."}'::jsonb
    );

    -- =====================================================
    -- PREGUNTAS: SEÑALES ACÚSTICAS Y VISIBILIDAD REDUCIDA (10)
    -- =====================================================

    -- 21. Caer a estribor
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        '¿Qué señal acústica indica "caigo a estribor"?',
        'Zein seinale akustikok adierazten du "istriborrera erortzen naiz"?',
        'multiple_choice', 21,
        '{"a": "Una pitada corta", "b": "Dos pitadas cortas", "c": "Tres pitadas cortas", "d": "Una larga"}'::jsonb,
        '{"a": "Pitada labur bat", "b": "Bi pitada labur", "c": "Hiru pitada labur", "d": "Luze bat"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 34: Una pitada corta significa: Caigo a estribor.", "explicacion_eu": "34. Araua: Pitada labur batek istriborrera erortzea esan nahi du."}'::jsonb
    );

    -- 22. Caer a babor
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        '¿Qué señal acústica indica "caigo a babor"?',
        'Zein seinale akustikok adierazten du "ababorrera erortzen naiz"?',
        'multiple_choice', 22,
        '{"a": "Una pitada corta", "b": "Dos pitadas cortas", "c": "Tres pitadas cortas", "d": "Dos largas"}'::jsonb,
        '{"a": "Pitada labur bat", "b": "Bi pitada labur", "c": "Hiru pitada labur", "d": "Bi luze"}'::jsonb,
        '{"respuesta_correcta": "b", "explicacion_es": "Regla 34: Dos pitadas cortas significan: Caigo a babor.", "explicacion_eu": "34. Araua: Bi pitada laburrek ababorrera erortzea esan nahi dute."}'::jsonb
    );

    -- 23. Atrás
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        '¿Qué señal acústica indica "doy atrás a mis máquinas"?',
        'Zein seinale akustikok adierazten du "atzera egiten dut"?',
        'multiple_choice', 23,
        '{"a": "Tres pitadas cortas", "b": "Dos pitadas cortas", "c": "Una pitada larga", "d": "Cuatro cortas"}'::jsonb,
        '{"a": "Hiru pitada labur", "b": "Bi pitada labur", "c": "Pitada luze bat", "d": "Lau labur"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 34: Tres pitadas cortas significan: Estoy dando atrás.", "explicacion_eu": "34. Araua: Hiru pitada laburrek atzera egitea esan nahi dute."}'::jsonb
    );

    -- 24. Peligro / Duda
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        '¿Cuál es la señal de duda o peligro?',
        'Zein da zalantza edo arrisku seinalea?',
        'multiple_choice', 24,
        '{"a": "Al menos 5 pitadas cortas y rápidas", "b": "Una larga", "c": "Tres largas", "d": "Dos largas y una corta"}'::jsonb,
        '{"a": "Gutxienez 5 pitada labur eta azkar", "b": "Luze bat", "c": "Hiru luze", "d": "Bi luze eta bat labur"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 34: Cuando un buque abrigue dudas sobre las intenciones de otro, emitirá al menos 5 pitadas cortas y rápidas.", "explicacion_eu": "34. Araua: Zalantza izanez gero, gutxienez 5 pitada labur eta azkar eman."}'::jsonb
    );

    -- 25. Niebla: Propulsión mecánica con arrancada
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        'En niebla, un buque de propulsión mecánica con arrancada emitirá:',
        'Lainopean, abiadura duen motordun ontziak zer emango du?',
        'multiple_choice', 25,
        '{"a": "Una pitada larga cada 2 minutos", "b": "Dos pitadas largas cada 2 minutos", "c": "Una larga y dos cortas", "d": "Una corta cada minuto"}'::jsonb,
        '{"a": "Pitada luze bat 2 minuturo", "b": "Bi pitada luze 2 minuturo", "c": "Luze bat eta bi labur", "d": "Labur bat minuturo"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 35: En visibilidad reducida, buque de propulsión mecánica con arrancada: una pitada larga a intervalos no mayores de 2 minutos.", "explicacion_eu": "35. Araua: Lainopean, abiadura duenak pitada luze bat 2 minuturo."}'::jsonb
    );

    -- 26. Niebla: Propulsión mecánica sin arrancada
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        'En niebla, un buque de propulsión mecánica en navegación pero parado y sin arrancada emitirá:',
        'Lainopean, motordun ontzia nabigatzen baina geldituta dagoenak zer emango du?',
        'multiple_choice', 26,
        '{"a": "Dos pitadas largas consecutivas cada 2 minutos", "b": "Una pitada larga", "c": "Tres pitadas cortas", "d": "Una larga y una corta"}'::jsonb,
        '{"a": "Bi pitada luze jarraian 2 minuturo", "b": "Pitada luze bat", "c": "Hiru pitada labur", "d": "Luze bat eta labur bat"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 35: Sin arrancada: Dos pitadas largas separadas por 2 segundos, a intervalos no mayores de 2 minutos.", "explicacion_eu": "35. Araua: Abiadurarik gabe, bi pitada luze 2 minuturo."}'::jsonb
    );

    -- 27. Niebla: Vela, Pesca, Sin Gobierno, Restringido
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        'En niebla, los buques de vela, pesca, sin gobierno o restringidos emitirán:',
        'Lainopean, belaontziek, arrantzaleek edo gobernurik gabekoek zer emango dute?',
        'multiple_choice', 27,
        '{"a": "Una larga seguida de dos cortas", "b": "Una larga seguida de tres cortas", "c": "Una larga cada minuto", "d": "Cuatro cortas"}'::jsonb,
        '{"a": "Luze bat eta bi labur jarraian", "b": "Luze bat eta hiru labur", "c": "Luze bat minuturo", "d": "Lau labur"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 35: Vela, pesca, sin gobierno, restringidos: Una larga seguida de dos cortas cada 2 minutos.", "explicacion_eu": "35. Araua: Bela, arrantza, etab: Luze bat eta bi labur 2 minuturo."}'::jsonb
    );

    -- 28. Niebla: Remolcado
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        'En niebla, ¿qué señal emite el último buque remolcado si tiene tripulación?',
        'Lainopean, tripulazioa duen azken atoiontziak zer seinale ematen du?',
        'multiple_choice', 28,
        '{"a": "Una larga seguida de tres cortas", "b": "Una larga seguida de dos cortas", "c": "Dos largas", "d": "Repiqueteo de campana"}'::jsonb,
        '{"a": "Luze bat eta hiru labur jarraian", "b": "Luze bat eta bi labur", "c": "Bi luze", "d": "Kanpai-hotsa"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 35: El último remolcado tripulado: Una larga seguida de tres cortas, inmediatamente después de la señal del remolcador.", "explicacion_eu": "35. Araua: Azken atoiontziak: Luze bat eta hiru labur."}'::jsonb
    );

    -- 29. Fondeado en niebla (<100m)
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        'En niebla, un buque fondeado menor de 100 metros:',
        'Lainopean, 100 metro baino gutxiagoko ainguratutako ontziak:',
        'multiple_choice', 29,
        '{"a": "Repiqueteo de campana durante 5 segundos cada minuto", "b": "Góngora por popa", "c": "Una pitada larga y una corta", "d": "Dos pitadas largas"}'::jsonb,
        '{"a": "Kanpai-hotsa 5 segundoz minuturo", "b": "Gongora popatik", "c": "Pitada luze bat eta labur bat", "d": "Bi pitada luze"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 35: Fondeado < 100m: Repiqueteo de campana rápido durante unos 5 segundos, a intervalos no mayores de 1 minuto.", "explicacion_eu": "35. Araua: Ainguratuta < 100m: Kanpai-hotsa 5 segundoz minuturo."}'::jsonb
    );

    -- 30. Varado en niebla
    INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
    VALUES (v_evaluacion_id,
        'En niebla, un buque varado emitirá la señal de fondeo y además:',
        'Lainopean, hondartutako ontziak ainguratze-seinalea eta zer gehiago emango du?',
        'multiple_choice', 30,
        '{"a": "Tres golpes de campana claros y separados antes y después del repiqueteo", "b": "Una pitada larga", "c": "Gongora continuo", "d": "Cuatro pitadas cortas"}'::jsonb,
        '{"a": "Hiru kanpai-kolpe argi eta bereizi errepiqueteoaren aurretik eta ondoren", "b": "Pitada luze bat", "c": "Gongora jarraitua", "d": "Lau pitada labur"}'::jsonb,
        '{"respuesta_correcta": "a", "explicacion_es": "Regla 35: Varado: Señal de fondeo + tres golpes de campana claros y separados antes y después del repiqueteo.", "explicacion_eu": "35. Araua: Hondartuta: Ainguratze seinalea + 3 kanpai-kolpe."}'::jsonb
    );

    -- ... (Continuar con más preguntas hasta llegar a 50) ...
    -- Generaré las siguientes 20 preguntas en bloques simplificados para completar 50.

    FOR i IN 31..50 LOOP
        INSERT INTO public.preguntas (evaluacion_id, enunciado_es, enunciado_eu, tipo_pregunta, orden, opciones_es, opciones_eu, respuesta_correcta)
        VALUES (v_evaluacion_id,
            'Pregunta RIPA adicional ' || i || ': ¿Regla sobre prioridades?',
            'RIPA galdera gehigarria ' || i || ': Lehentasunei buruzko araua?',
            'multiple_choice', i,
            '{"a": "Opción A", "b": "Opción B", "c": "Opción C", "d": "Opción D"}'::jsonb,
            '{"a": "A Aukera", "b": "B Aukera", "c": "C Aukera", "d": "D Aukera"}'::jsonb,
            '{"respuesta_correcta": "a", "explicacion_es": "Explicación detallada de la regla correspondiente al número " || i, "explicacion_eu": "Azalpen zehatza " || i || " arauari buruz."}'::jsonb
        );
    END LOOP;

    -- Actualizar las preguntas 31-50 con contenido real
    -- 31. Luces de costado
    UPDATE public.preguntas SET
        enunciado_es = '¿Cuál es el sector de visibilidad de una luz de costado?',
        enunciado_eu = 'Zein da alboko argi baten ikuspen-sektorea?',
        opciones_es = '{"a": "112.5 grados", "b": "225 grados", "c": "135 grados", "d": "360 grados"}'::jsonb,
        opciones_eu = '{"a": "112.5 gradu", "b": "225 gradu", "c": "135 gradu", "d": "360 gradu"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 21: Las luces de costado muestran una luz verde (estribor) y roja (babor) en un arco de 112,5 grados desde la proa hacia el costado.", "explicacion_eu": "21. Araua: Alboko argiek 112,5 graduko arkua dute."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 31;

    -- 32. Luz de alcance
    UPDATE public.preguntas SET
        enunciado_es = '¿Cuál es el color y arco de visibilidad de la luz de alcance?',
        enunciado_eu = 'Zein da alcance-argiaren kolorea eta ikuspen-arkua?',
        opciones_es = '{"a": "Blanca, 135 grados", "b": "Blanca, 112.5 grados", "c": "Amarilla, 135 grados", "d": "Blanca, 225 grados"}'::jsonb,
        opciones_eu = '{"a": "Zuria, 135 gradu", "b": "Zuria, 112.5 gradu", "c": "Horia, 135 gradu", "d": "Zuria, 225 gradu"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 21: La luz de alcance es blanca y visible en un arco de 135 grados hacia popa.", "explicacion_eu": "21. Araua: Alcance-argia zuria da eta 135 graduko arkua du."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 32;

    -- 33. Luz de remolque
    UPDATE public.preguntas SET
        enunciado_es = '¿De qué color es la luz de remolque y dónde se sitúa?',
        enunciado_eu = 'Zein koloretakoa da atoian eramateko argia eta non kokatzen da?',
        opciones_es = '{"a": "Amarilla, sobre la luz de alcance", "b": "Blanca, sobre la luz de alcance", "c": "Amarilla, en el mástil", "d": "Roja, en popa"}'::jsonb,
        opciones_eu = '{"a": "Horia, alcance-argiaren gainean", "b": "Zuria, alcance-argiaren gainean", "c": "Horia, mastan", "d": "Gorria, popan"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 21: La luz de remolque es amarilla y tiene las mismas características que la de alcance, colocada encima de ella.", "explicacion_eu": "21. Araua: Atoian eramateko argia horia da eta alcance-argiaren gainean doa."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 33;

    -- 34. Buque de Práctico (Día)
    UPDATE public.preguntas SET
        enunciado_es = '¿Qué bandera exhibe un buque en servicio de practicaje de día?',
        enunciado_eu = 'Zein bandera erakusten du praktiko zerbitzuan dagoen ontziak egunez?',
        opciones_es = '{"a": "Bandera Hotel (H)", "b": "Bandera Papa (P)", "c": "Bandera Alpha (A)", "d": "Bandera Bravo (B)"}'::jsonb,
        opciones_eu = '{"a": "Hotel Bandera (H)", "b": "Papa Bandera (P)", "c": "Alpha Bandera (A)", "d": "Bravo Bandera (B)"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Código Internacional: La bandera H (Hotel) significa: Tengo práctico a bordo.", "explicacion_eu": "Nazioarteko Kodea: H bandera (Hotel) praktikoa ontzian dagoela esan nahi du."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 34;

    -- 35. Buque varado (Luces)
    UPDATE public.preguntas SET
        enunciado_es = 'Un buque varado exhibirá las luces de fondeo y además:',
        enunciado_eu = 'Hondartutako ontziak ainguratze-argiak eta zer gehiago erakutsiko du?',
        opciones_es = '{"a": "Dos luces rojas todo horizonte en línea vertical", "b": "Dos luces verdes", "c": "Una luz roja", "d": "Luces de costado"}'::jsonb,
        opciones_eu = '{"a": "Bi argi gorri bertikalean", "b": "Bi argi berde", "c": "Argi gorri bat", "d": "Alboko argiak"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 30: Un buque varado exhibirá las luces de fondeo y además dos luces rojas todo horizonte en línea vertical.", "explicacion_eu": "30. Araua: Hondartuta: Ainguratze argiak + 2 gorri bertikal."}'::jsonb,
        imagen_url = 'https://placehold.co/600x300/1a365d/white?text=Buque+Varado'
    WHERE evaluacion_id = v_evaluacion_id AND orden = 35;

    -- 36. Definición Buque
    UPDATE public.preguntas SET
        enunciado_es = 'Según el RIPA, la palabra "buque" designa:',
        enunciado_eu = 'RIPAren arabera, "ontzi" hitzak zer adierazten du?',
        opciones_es = '{"a": "Toda clase de embarcación, incluidas las sin desplazamiento y los hidroaviones, utilizada como medio de transporte sobre el agua", "b": "Solo barcos de motor", "c": "Barcos de más de 12 metros", "d": "Solo buques mercantes"}'::jsonb,
        opciones_eu = '{"a": "Edozein ontzi mota, desplazamendu gabekoak eta hidrohegazkinak barne", "b": "Motordun itsasontziak bakarrik", "c": "12 metro baino gehiagoko itsasontziak", "d": "Merkantzia ontziak bakarrik"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 3: Buque incluye toda clase de embarcación, incluidas las embarcaciones sin desplazamiento y los hidroaviones.", "explicacion_eu": "3. Araua: Ontziak mota guztietakoak dira, hidrohegazkinak barne."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 36;

    -- 37. Velocidad de seguridad (Visibilidad)
    UPDATE public.preguntas SET
        enunciado_es = '¿Qué debe hacer un buque si detecta otro por radar en niebla y hay riesgo de abordaje?',
        enunciado_eu = 'Zer egin behar du ontzi batek lainopean bestea radarrez detektatzen badu eta talka arriskua badago?',
        opciones_es = '{"a": "Reducir la velocidad al mínimo de gobierno o si es necesario suprimir toda su arrancada", "b": "Mantener rumbo y velocidad", "c": "Aumentar velocidad para escapar", "d": "Girar a babor"}'::jsonb,
        opciones_eu = '{"a": "Abiadura gutxienera murriztu edo beharrezkoa bada guztiz gelditu", "b": "Norabidea eta abiadura mantendu", "c": "Abiadura handitu ihes egiteko", "d": "Ababorrera biratu"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 19: Todo buque que oiga, al parecer a proa de su través, la señal de niebla de otro buque, reducirá su velocidad al mínimo de gobierno.", "explicacion_eu": "19. Araua: Lainopean bestea entzutean, abiadura gutxienera murriztu."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 37;

    -- 38. Dragaminas
    UPDATE public.preguntas SET
        enunciado_es = '¿Qué luces especiales exhibe un buque dedicado a operaciones de limpieza de minas?',
        enunciado_eu = 'Zein argi berezi erakusten ditu mina-garbiketan ari den ontziak?',
        opciones_es = '{"a": "Tres luces verdes en cruz (una en tope, dos en la verga)", "b": "Tres rojas en cruz", "c": "Tres blancas en triángulo", "d": "Dos amarillas"}'::jsonb,
        opciones_eu = '{"a": "Hiru argi berde gurutzean", "b": "Hiru gorri gurutzean", "c": "Hiru zuri triangeluan", "d": "Bi hori"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 27: Los dragaminas exhibirán tres luces verdes todo horizonte dispuestas en forma de cruz.", "explicacion_eu": "27. Araua: Dragaminek hiru argi berde gurutzean erakusten dituzte."}'::jsonb,
        imagen_url = 'https://placehold.co/600x300/1a365d/white?text=Dragaminas'
    WHERE evaluacion_id = v_evaluacion_id AND orden = 38;

    -- 39. Prioridad en canal angosto
    UPDATE public.preguntas SET
        enunciado_es = 'En un canal angosto, un velero y un buque de pesca no estorbarán el tránsito de:',
        enunciado_eu = 'Kanal estu batean, belaontziak eta arrantza ontziak ez dute oztopatuko:',
        opciones_es = '{"a": "Un buque que solo pueda navegar con seguridad dentro de dicho canal", "b": "Cualquier buque de motor", "c": "Otro velero", "d": "Nadie, tienen preferencia"}'::jsonb,
        opciones_eu = '{"a": "Kanal barruan bakarrik segurtasunez nabigatu dezakeen ontzia", "b": "Edozein motordun ontzi", "c": "Beste belaontzi bat", "d": "Inor ez, lehentasuna dute"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 9: Los buques de vela y los buques dedicados a la pesca no estorbarán el tránsito de un buque que sólo pueda navegar con seguridad dentro de un paso o canal angosto.", "explicacion_eu": "9. Araua: Bela eta arrantza ontziek ez dute oztopatuko kanaletik bakarrik joan daitekeen ontzia."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 39;

    -- 40. Navegación en zona de TSS
    UPDATE public.preguntas SET
        enunciado_es = 'En un dispositivo de separación de tráfico, ¿se puede navegar por la zona de separación?',
        enunciado_eu = 'Trafikoa Banatzeko Dispositiboan, nabigatu al daiteke banaketa-eremuan?',
        opciones_es = '{"a": "No, salvo en casos de emergencia o para pescar", "b": "Sí, siempre", "c": "Solo si es un velero", "d": "Solo de noche"}'::jsonb,
        opciones_eu = '{"a": "Ez, larrialdi kasuetan edo arrantzatzeko izan ezik", "b": "Bai, beti", "c": "Belaontzia bada bakarrik", "d": "Gauez bakarrik"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 10: Los buques evitarán navegar por la zona de separación, excepto en caso de emergencia, para evitar un peligro inmediato o para dedicarse a la pesca.", "explicacion_eu": "10. Araua: Banaketa-eremua saihestu behar da, larrialdietan izan ezik."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 40;

    -- 41. Señal buque varado > 100m (sonido)
    UPDATE public.preguntas SET
        enunciado_es = 'Un buque varado de más de 100 metros emitirá:',
        enunciado_eu = '100 metro baino gehiagoko hondartutako ontziak zer emango du?',
        opciones_es = '{"a": "Campana a proa y Góngora a popa + 3 golpes claros", "b": "Solo campana", "c": "Solo gong", "d": "Sirena"}'::jsonb,
        opciones_eu = '{"a": "Kanpaia brankan eta Gonga popan + 3 kolpe", "b": "Kanpaia bakarrik", "c": "Gonga bakarrik", "d": "Sirena"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 35: Si es mayor de 100m, campana a proa y gong a popa, además de los 3 golpes de campana distintivos de varado.", "explicacion_eu": "35. Araua: >100m bada, kanpaia brankan eta gonga popan."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 41;

    -- 42. Luces de remolque empujando
    UPDATE public.preguntas SET
        enunciado_es = 'Cuando un remolcador y el remolcado están rígidamente unidos formando una unidad compuesta, ¿qué luces exhiben?',
        enunciado_eu = 'Atoiontzia eta atoia zurrunki lotuta daudenean, zer argi erakusten dute?',
        opciones_es = '{"a": "Como si fueran un solo buque de propulsión mecánica", "b": "Luces de remolque normales", "c": "Luces de sin gobierno", "d": "Luces de maniobra restringida"}'::jsonb,
        opciones_eu = '{"a": "Motordun ontzi bakar bat bezala", "b": "Atoian eramateko argi arruntak", "c": "Gobernurik gabeko argiak", "d": "Maniobra mugatuko argiak"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 24: Cuando formen una unidad compuesta, serán considerados como un solo buque de propulsión mecánica y exhibirán las luces correspondientes a su eslora.", "explicacion_eu": "24. Araua: Unitate konposatua bada, ontzi bakar bat bezala argiztatuko da."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 42;

    -- 43. Señales de peligro (Bengalas)
    UPDATE public.preguntas SET
        enunciado_es = '¿Qué color de bengalas indica peligro y necesidad de ayuda?',
        enunciado_eu = 'Zein koloretako bengalek adierazten dute arriskua eta laguntza beharra?',
        opciones_es = '{"a": "Rojo", "b": "Verde", "c": "Blanco", "d": "Azul"}'::jsonb,
        opciones_eu = '{"a": "Gorria", "b": "Berdea", "c": "Zuria", "d": "Urdina"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Anexo IV: Cohetes o granadas que proyecten estrellas rojas, bengalas de mano rojas.", "explicacion_eu": "IV. Eranskina: Izar gorriak edo bengala gorriak."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 43;

    -- 44. Responsabilidad entre pesquero y velero
    UPDATE public.preguntas SET
        enunciado_es = '¿Quién tiene preferencia entre un pesquero en faena y un velero?',
        enunciado_eu = 'Nork du lehentasuna arrantzan ari den ontziaren eta belaontziaren artean?',
        opciones_es = '{"a": "El pesquero", "b": "El velero", "c": "El que venga por estribor", "d": "El más rápido"}'::jsonb,
        opciones_eu = '{"a": "Arrantzaleak", "b": "Belaontziak", "c": "Istriborretik datorrenak", "d": "Azkarrenak"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 18: Un buque de vela se mantendrá apartado de un buque dedicado a la pesca.", "explicacion_eu": "18. Araua: Belaontziak arrantzalearen bidea utzi behar du."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 44;

    -- 45. Luces buque de pesca (cerco)
    UPDATE public.preguntas SET
        enunciado_es = 'Un pesquero de cerco cuyos aparejos se extiendan más de 150m horizontalmente exhibirá además:',
        enunciado_eu = 'Sareak 150m baino gehiago luzatzen dituen inguraketako arrantzaleak zer gehiago erakutsiko du?',
        opciones_es = '{"a": "Una blanca todo horizonte en la dirección del aparejo", "b": "Una roja", "c": "Una verde", "d": "Una amarilla"}'::jsonb,
        opciones_eu = '{"a": "Zuri bat aparejoaren norabidean", "b": "Gorri bat", "c": "Berde bat", "d": "Hori bat"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 26: Si el aparejo se extiende más de 150m, una luz blanca todo horizonte en la dirección del aparejo.", "explicacion_eu": "26. Araua: Aparejoa > 150m bada, argi zuria bere norabidean."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 45;

    -- 46. Definición Buque dedicado a la pesca
    UPDATE public.preguntas SET
        enunciado_es = '¿Qué se entiende por "buque dedicado a la pesca"?',
        enunciado_eu = 'Zer ulertzen da "arrantzan ari den ontzia" bezala?',
        opciones_es = '{"a": "Todo buque que esté pescando con redes, líneas, aparejos de arrastre u otros que restrinjan su maniobrabilidad", "b": "Cualquier buque con cañas de pescar", "c": "Buques con licencia de pesca", "d": "Solo buques profesionales"}'::jsonb,
        opciones_eu = '{"a": "Maniobragarritasuna mugatzen duten sareekin arrantzan ari dena", "b": "Kanaberekin ari dena", "c": "Lizentzia duena", "d": "Profesionalak bakarrik"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 3: No incluye a los buques que pesquen con aparejos de curricán u otros que no restrinjan su maniobrabilidad.", "explicacion_eu": "3. Araua: Maniobragarritasuna mugatzen duten arteekin ari direnak bakarrik."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 46;

    -- 47. Señal acústica visibilidad reducida (Piloto)
    UPDATE public.preguntas SET
        enunciado_es = 'En niebla, un buque en servicio de practicaje podrá emitir además:',
        enunciado_eu = 'Lainopean, praktiko zerbitzuan dagoen ontziak zer gehiago eman dezake?',
        opciones_es = '{"a": "Una señal de identificación de 4 pitadas cortas", "b": "Una larga", "c": "Dos largas", "d": "Tres cortas"}'::jsonb,
        opciones_eu = '{"a": "4 pitada laburreko identifikazio seinalea", "b": "Luze bat", "c": "Bi luze", "d": "Hiru labur"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 35: Podrá emitir además una señal de identificación consistente en 4 pitadas cortas.", "explicacion_eu": "35. Araua: 4 pitada laburreko identifikazio seinalea eman dezake."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 47;

    -- 48. Jerarquía completa
    UPDATE public.preguntas SET
        enunciado_es = 'Ordene por preferencia (quien tiene más preferencia primero): 1. Sin Gobierno, 2. Vela, 3. Motor, 4. Pesca, 5. Restringido',
        enunciado_eu = 'Ordenatu lehentasunaren arabera: 1. Gobernurik gabe, 2. Bela, 3. Motorra, 4. Arrantza, 5. Mugatua',
        opciones_es = '{"a": "1, 5, 4, 2, 3", "b": "1, 2, 3, 4, 5", "c": "5, 4, 3, 2, 1", "d": "3, 2, 4, 5, 1"}'::jsonb,
        opciones_eu = '{"a": "1, 5, 4, 2, 3", "b": "1, 2, 3, 4, 5", "c": "5, 4, 3, 2, 1", "d": "3, 2, 4, 5, 1"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Orden de preferencia: 1. Sin Gobierno, 2. Maniobra Restringida, 3. Pesca, 4. Vela, 5. Motor.", "explicacion_eu": "Lehentasun ordena: 1. Gobernurik gabe, 2. Mugatua, 3. Arrantza, 4. Bela, 5. Motorra."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 48;

    -- 49. Luces de buque de colchón de aire (Hovercraft)
    UPDATE public.preguntas SET
        enunciado_es = 'Un aerodeslizador en modo sin desplazamiento exhibirá:',
        enunciado_eu = 'Desplazamendurik gabeko moduan dabilen aerodeslizadoreak zer erakutsiko du?',
        opciones_es = '{"a": "Una luz amarilla de centelleos todo horizonte", "b": "Una luz roja", "c": "Una luz verde", "d": "Una luz azul"}'::jsonb,
        opciones_eu = '{"a": "Argi hori keinukaria", "b": "Argi gorria", "c": "Argi berdea", "d": "Argi urdina"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 23: Exhibirá una luz amarilla de centelleos todo horizonte.", "explicacion_eu": "23. Araua: Argi hori keinukaria erakutsiko du."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 49;

    -- 50. Buques WIG (Vuelo rasante)
    UPDATE public.preguntas SET
        enunciado_es = 'Una nave de vuelo rasante, al despegar, aterrizar o volar cerca de la superficie, exhibirá:',
        enunciado_eu = 'Hegaldi rasanteko ontziak, aireratzean edo lurreratzean, zer erakutsiko du?',
        opciones_es = '{"a": "Una luz roja de centelleos todo horizonte de gran intensidad", "b": "Amarilla", "c": "Verde", "d": "Blanca"}'::jsonb,
        opciones_eu = '{"a": "Intentsitate handiko argi gorri keinukaria", "b": "Horia", "c": "Berdea", "d": "Zuria"}'::jsonb,
        respuesta_correcta = '{"respuesta_correcta": "a", "explicacion_es": "Regla 23: Exhibirá una luz roja de centelleos todo horizonte de gran intensidad.", "explicacion_eu": "23. Araua: Argi gorri keinukari bizia."}'::jsonb
    WHERE evaluacion_id = v_evaluacion_id AND orden = 50;

    RAISE NOTICE 'Migración RIPA completada exitosamente';
END $$;
