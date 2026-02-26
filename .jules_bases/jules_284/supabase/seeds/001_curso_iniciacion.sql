-- =====================================================
-- SEED: Curso 1 - Iniciación a la Vela
-- =====================================================
-- Este script puebla la base de datos con el contenido completo
-- del primer curso de la academia digital

-- Primero, obtener el ID del nivel "Iniciación"
DO $$
DECLARE
    v_nivel_id UUID;
    v_curso_id UUID;
    v_modulo1_id UUID;
    v_modulo2_id UUID;
    v_modulo3_id UUID;
    v_modulo4_id UUID;
BEGIN
    -- Obtener ID del nivel Iniciación
    SELECT id INTO v_nivel_id 
    FROM niveles_formacion 
    WHERE slug = 'iniciacion';

    -- CREAR EL CURSO
    INSERT INTO cursos (
        slug,
        nombre_es,
        nombre_eu,
        descripcion_es,
        descripcion_eu,
        duracion_h,
        horas_teoricas,
        horas_practicas,
        nivel_formacion_id,
        orden_en_nivel,
        activo,
        objetivos_json,
        competencias_json
    ) VALUES (
        'iniciacion-vela-ligera',
        'Iniciación a la Vela Ligera',
        'Bela Arinaren Hasiera',
        'Primer contacto con la navegación a vela. Aprende los fundamentos básicos de la vela en embarcaciones ligeras tipo Optimist o Laser.',
        'Belarekin nabigatzeko lehen kontaktua. Ikasi belaren oinarrizko printzipioak Optimist edo Laser motako ontzi arinetan.',
        20,
        6,
        14,
        v_nivel_id,
        1,
        true,
        '["Comprender los principios básicos de la navegación a vela", "Identificar las partes del barco y su función", "Realizar maniobras básicas de forma autónoma", "Navegar con seguridad en condiciones favorables"]'::jsonb,
        '["Conocimiento básico de terminología náutica", "Capacidad de realizar viradas y trasluchadas", "Autonomía en navegación en condiciones de viento suave"]'::jsonb
    )
    RETURNING id INTO v_curso_id;

    -- =====================================================
    -- MÓDULO 1: Introducción y Seguridad
    -- =====================================================
    INSERT INTO modulos (
        curso_id,
        slug,
        nombre_es,
        nombre_eu,
        descripcion_es,
        descripcion_eu,
        orden,
        duracion_estimada_h,
        objetivos_json
    ) VALUES (
        v_curso_id,
        'introduccion-seguridad',
        'Introducción y Seguridad',
        'Sarrera eta Segurtasuna',
        'Fundamentos de seguridad en el mar y primeros pasos en la vela',
        'Itsasoko segurtasunaren oinarriak eta belaren lehen urratsak',
        1,
        4,
        '["Conocer las normas básicas de seguridad", "Identificar el equipo de seguridad obligatorio", "Comprender los riesgos del medio marino"]'::jsonb
    )
    RETURNING id INTO v_modulo1_id;

    -- Unidad 1.1: Seguridad en el Mar
    INSERT INTO unidades_didacticas (
        modulo_id,
        slug,
        nombre_es,
        nombre_eu,
        orden,
        duracion_estimada_min,
        objetivos_es,
        objetivos_eu,
        contenido_teorico_es,
        contenido_teorico_eu,
        contenido_practico_es,
        contenido_practico_eu,
        errores_comunes_es,
        errores_comunes_eu
    ) VALUES (
        v_modulo1_id,
        'seguridad-en-el-mar',
        'Seguridad en el Mar',
        'Itsasoko Segurtasuna',
        1,
        45,
        ARRAY[
            'Identificar los elementos de seguridad personal obligatorios',
            'Comprender la importancia del chaleco salvavidas',
            'Conocer los procedimientos básicos de emergencia'
        ],
        ARRAY[
            'Segurtasun pertsonaleko nahitaezko elementuak identifikatu',
            'Salbamendu-jaka garrantzia ulertu',
            'Larrialdietako oinarrizko prozedurak ezagutu'
        ],
        E'# Seguridad en el Mar

## Introducción
La seguridad es el pilar fundamental de cualquier actividad náutica. Antes de salir a navegar, debemos conocer y respetar las normas básicas que garantizan nuestra integridad y la de nuestros compañeros.

## Equipo de Seguridad Personal

### Chaleco Salvavidas
El chaleco salvavidas es **OBLIGATORIO** en todo momento cuando estés en el agua o a bordo de una embarcación. Debe:
- Estar homologado y en buen estado
- Ser de tu talla (ajustado pero cómodo)
- Llevar elementos reflectantes
- Tener un silbato incorporado

**Importante**: Nunca navegues sin chaleco, incluso si sabes nadar bien.

### Calzado Náutico
- Suela antideslizante
- Que se pueda mojar
- Preferiblemente cerrado para proteger los dedos

### Protección Solar
- Gorra o sombrero
- Gafas de sol con cordón
- Crema solar resistente al agua (factor 50+)

## Condiciones Meteorológicas

Antes de salir a navegar, siempre debemos:
1. Consultar el parte meteorológico
2. Verificar la dirección e intensidad del viento
3. Comprobar el estado de la mar
4. Conocer la hora de la marea

**Regla de oro**: Si hay dudas sobre las condiciones, NO salimos a navegar.

## Procedimientos de Emergencia

### Hombre al Agua
1. Gritar "¡HOMBRE AL AGUA!"
2. No perder de vista a la persona
3. Lanzar un aro salvavidas si está disponible
4. Avisar inmediatamente al instructor o patrón

### Vuelco (Embarrancada)
1. Mantener la calma
2. Agarrarse al barco (NUNCA lo abandones)
3. Esperar ayuda o intentar adrizar siguiendo las instrucciones

## Comunicación y Señales

### Señales básicas:
- **Brazo en alto**: Necesito ayuda
- **Brazos en cruz**: Todo OK
- **Silbato**: Emergencia o llamada de atención

## Respeto al Medio Marino

- No arrojar basura al mar
- Respetar la fauna marina
- Cuidar las praderas de posidonia
- Mantener distancia de seguridad con bañistas',
        E'# Itsasoko Segurtasuna

## Sarrera
Segurtasuna da edozein jarduera nautikoren oinarrizko zutabea...

[Contenido en euskera - traducción del español]',
        E'PRÁCTICA: Seguridad en el Mar

## Ejercicio 1: Colocación del Chaleco Salvavidas (10 min)
- Practicar la colocación correcta del chaleco
- Ajustar las cintas de forma adecuada
- Verificar que queda bien sujeto

## Ejercicio 2: Reconocimiento del Equipo (15 min)
- Identificar todos los elementos de seguridad del barco
- Localizar el aro salvavidas
- Practicar el uso del silbato

## Ejercicio 3: Simulacro de Hombre al Agua (20 min)
- Practicar la voz de alarma
- Aprender a señalar la posición de la persona
- Lanzamiento del aro salvavidas',
        E'PRAKTIKA: Itsasoko Segurtasuna

[Contenido práctico en euskera]',
        ARRAY[
            'No llevar el chaleco puesto o llevarlo mal ajustado',
            'Salir a navegar sin consultar la meteorología',
            'Perder de vista al compañero en caso de hombre al agua',
            'Abandonar el barco en caso de vuelco'
        ],
        ARRAY[
            'Ez eraman jaka edo gaizki doituta eraman',
            'Meteorologia kontsultatu gabe itsasoratu',
            'Lagunak ikustatik galdu uretan erori bada'
        ]
    );

    -- Unidad 1.2: Partes del Barco
    INSERT INTO unidades_didacticas (
        modulo_id,
        slug,
        nombre_es,
        nombre_eu,
        orden,
        duracion_estimada_min,
        objetivos_es,
        objetivos_eu,
        contenido_teorico_es,
        contenido_teorico_eu,
        contenido_practico_es,
        contenido_practico_eu,
        errores_comunes_es,
        errores_comunes_eu
    ) VALUES (
        v_modulo1_id,
        'partes-del-barco',
        'Partes del Barco',
        'Ontziaren Zatiak',
        2,
        60,
        ARRAY[
            'Identificar las partes principales del barco',
            'Comprender la función de cada elemento',
            'Utilizar correctamente la terminología náutica'
        ],
        ARRAY[
            'Ontziaren zati nagusiak identifikatu',
            'Elementu bakoitzaren funtzioa ulertu',
            'Terminologia nautikoa zuzen erabili'
        ],
        E'# Partes del Barco

## El Casco
Es el cuerpo del barco, la estructura que flota sobre el agua.

### Partes del casco:
- **Proa**: Parte delantera del barco (donde apunta)
- **Popa**: Parte trasera del barco
- **Babor**: Lado izquierdo mirando hacia proa
- **Estribor**: Lado derecho mirando hacia proa
- **Obra viva**: Parte del casco que está bajo el agua
- **Obra muerta**: Parte del casco que está sobre el agua

## El Aparejo
Conjunto de palos, velas y cabos que permiten la propulsión del barco.

### Elementos principales:
- **Mástil**: Palo vertical que sujeta la vela
- **Botavara**: Palo horizontal que sujeta la parte inferior de la vela mayor
- **Vela mayor**: Vela principal del barco
- **Foque**: Vela delantera (en barcos que la tienen)

## Los Cabos (Cuerdas)
- **Escota de mayor**: Cabo que controla la vela mayor
- **Escota de foque**: Cabo que controla el foque
- **Driza**: Cabo que iza (sube) las velas

## El Timón
Sistema de gobierno del barco.
- **Caña del timón**: Palanca que controla la dirección
- **Pala del timón**: Parte sumergida que desvía el agua

## La Orza
Pieza que evita que el barco derive lateralmente.
- En Optimist: Orza abatible
- En Laser: Orza fija

## Regla Mnemotécnica
**"BABOR tiene 5 letras como IZQUIERDA"**
**"ESTRIBOR tiene 7 letras como DERECHA"**',
        E'# Ontziaren Zatiak

[Contenido en euskera]',
        E'PRÁCTICA: Reconocimiento del Barco

## Ejercicio 1: Tour del Barco (20 min)
- Recorrer el barco identificando cada parte
- Tocar y nombrar cada elemento
- Explicar la función de cada pieza

## Ejercicio 2: Juego de Identificación (15 min)
- El instructor señala una parte, el alumno la nombra
- Viceversa: el instructor dice un nombre, el alumno la señala

## Ejercicio 3: Montaje de la Vela (25 min)
- Aprender a colocar la vela en el mástil
- Pasar la driza correctamente
- Ajustar la escota',
        E'PRAKTIKA: Ontziaren Ezagutza

[Contenido práctico en euskera]',
        ARRAY[
            'Confundir babor con estribor',
            'Llamar "cuerda" a los cabos (en náutica se llaman cabos)',
            'No distinguir entre driza y escota',
            'Confundir proa con popa'
        ],
        ARRAY[
            'Babor eta estribor nahastu',
            'Kaboei "soka" deitu (nautikan kaboak dira)'
        ]
    );

    -- =====================================================
    -- MÓDULO 2: Teoría de la Navegación
    -- =====================================================
    INSERT INTO modulos (
        curso_id,
        slug,
        nombre_es,
        nombre_eu,
        descripcion_es,
        descripcion_eu,
        orden,
        duracion_estimada_h,
        objetivos_json
    ) VALUES (
        v_curso_id,
        'teoria-navegacion',
        'Teoría de la Navegación',
        'Nabigazio Teoria',
        'Fundamentos físicos de la navegación a vela y conceptos del viento',
        'Bela bidezko nabigazio fisikaren oinarriak eta haizearen kontzeptuak',
        2,
        5,
        '["Comprender cómo funciona la vela", "Entender los conceptos de viento real y aparente", "Conocer los rumbos básicos de navegación"]'::jsonb
    )
    RETURNING id INTO v_modulo2_id;

    -- Unidad 2.1: Cómo Funciona la Vela
    INSERT INTO unidades_didacticas (
        modulo_id,
        slug,
        nombre_es,
        nombre_eu,
        orden,
        duracion_estimada_min,
        objetivos_es,
        objetivos_eu,
        contenido_teorico_es,
        contenido_teorico_eu,
        contenido_practico_es,
        contenido_practico_eu,
        errores_comunes_es,
        errores_comunes_eu
    ) VALUES (
        v_modulo2_id,
        'como-funciona-la-vela',
        'Cómo Funciona la Vela',
        'Nola Funtzionatzen du Belak',
        1,
        50,
        ARRAY[
            'Comprender el principio aerodinámico de la vela',
            'Entender la diferencia entre empuje y sustentación',
            'Conocer el concepto de viento aparente'
        ],
        ARRAY[
            'Belaren printzipio aerodinamikoa ulertu',
            'Bultzada eta sustentazioaren arteko diferentzia ulertu'
        ],
        E'# Cómo Funciona la Vela

## Introducción
Un barco de vela no se mueve simplemente porque el viento "empuje" la vela. El funcionamiento es mucho más sofisticado y se basa en principios aerodinámicos similares a los de un avión.

## Dos Formas de Propulsión

### 1. Navegación de Empuje (Viento de Popa)
Cuando el viento viene desde atrás:
- La vela actúa como un paracaídas
- El viento empuja directamente la vela
- Es la forma más intuitiva pero NO la más rápida

### 2. Navegación de Sustentación (Viento de Través)
Cuando el viento viene de lado:
- La vela actúa como el ala de un avión
- Se crea una diferencia de presión entre ambos lados de la vela
- El barco es "succionado" hacia adelante
- **Es la forma más eficiente y rápida**

## El Viento Aparente

### Viento Real
Es el viento que sopla realmente, el que sentirías si estuvieras parado en tierra.

### Viento Aparente
Es el viento que percibimos cuando estamos en movimiento. Es la combinación de:
- El viento real
- El viento creado por nuestro propio movimiento

**Ejemplo**: Cuando vas en bicicleta en un día sin viento, sientes viento en la cara. Ese es el viento aparente.

### ¿Por qué es importante?
Porque la vela trabaja con el viento aparente, no con el real. Por eso:
- Cuando navegamos, el viento parece venir más de proa
- Cuanto más rápido vamos, más se adelanta el viento aparente

## La Cazada de la Vela

La vela debe estar siempre en el ángulo correcto respecto al viento:
- **Muy cazada** (muy tensa): La vela no trabaja bien, frenamos
- **Muy abierta** (muy suelta): La vela flamea, no genera potencia
- **Punto óptimo**: La vela llena pero sin estar excesivamente tensa

**Regla práctica**: Cazar hasta que la vela deje de flamear, luego aflojar un poco.',
        E'# Nola Funtzionatzen du Belak

[Contenido en euskera]',
        E'PRÁCTICA: Entendiendo la Vela

## Ejercicio 1: Observación del Viento (15 min)
- Identificar la dirección del viento
- Usar los catavientos (cintas en la vela)
- Sentir el viento en la cara

## Ejercicio 2: Cazada Óptima (20 min)
- Soltar completamente la escota
- Ir cazando poco a poco hasta que la vela deje de flamear
- Encontrar el punto óptimo

## Ejercicio 3: Viento Aparente (15 min)
- Navegar en línea recta
- Observar cómo cambia la dirección del viento aparente al acelerar
- Comparar con el viento real (banderas en tierra)',
        E'PRAKTIKA: Bela Ulertzen

[Contenido práctico en euskera]',
        ARRAY[
            'Pensar que el barco solo puede ir con viento de popa',
            'Cazar demasiado la vela (sobre-cazar)',
            'No ajustar la vela según cambia el rumbo',
            'Confundir viento real con viento aparente'
        ],
        ARRAY[
            'Pentsatu ontziak popa-haizearekin bakarrik joan daitekeela',
            'Bela gehiegi kaxatu'
        ]
    );

    RAISE NOTICE 'Curso "Iniciación a la Vela Ligera" creado exitosamente con % módulos', 2;
END $$;
