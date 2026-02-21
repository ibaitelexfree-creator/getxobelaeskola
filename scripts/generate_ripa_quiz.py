import json
import os

questions = []
questions.extend([
    {
        "enunciado_es": "Según el Reglamento Internacional para Prevenir Abordajes, ¿qué significado tiene la luz blanca de tope?",
        "opciones_json": [
            {"id": "A", "texto": "Luz visible en un arco de horizonte de 225 grados hacia proa."},
            {"id": "B", "texto": "Luz visible en un arco de horizonte de 135 grados hacia popa."},
            {"id": "C", "texto": "Luz visible en todo el horizonte (360 grados)."},
            {"id": "D", "texto": "Luz visible en un arco de horizonte de 112,5 grados hacia cada costado."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "La luz de tope es una luz blanca visible en un arco de 225 grados hacia proa (Regla 21).",
        "imagen_url": "/images/ripa/luz_tope.jpg"
    },
    {
        "enunciado_es": "En situación de cruce con riesgo de abordaje entre dos buques de propulsión mecánica, ¿cuál debe maniobrar?",
        "opciones_json": [
            {"id": "A", "texto": "El que tenga al otro por su costado de babor."},
            {"id": "B", "texto": "El que tenga al otro por su costado de estribor."},
            {"id": "C", "texto": "Ambos deben caer a estribor."},
            {"id": "D", "texto": "El que navegue a mayor velocidad."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 15: El buque que tenga al otro por su costado de estribor se mantendrá apartado de la derrota de este otro.",
        "imagen_url": "/images/ripa/cruce_regla15.jpg"
    },
    {
        "enunciado_es": "¿Qué buque exhibe tres luces rojas en línea vertical?",
        "opciones_json": [
            {"id": "A", "texto": "Buque sin gobierno."},
            {"id": "B", "texto": "Buque restringido por su calado."},
            {"id": "C", "texto": "Buque varado."},
            {"id": "D", "texto": "Buque dedicado a la pesca de arrastre."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 28: Un buque restringido por su calado exhibirá tres luces rojas en línea vertical.",
        "imagen_url": "/images/ripa/luces_restringido_calado.jpg"
    },
    {
        "enunciado_es": "En visibilidad reducida, ¿qué señal acústica emite un buque de propulsión mecánica con arrancada?",
        "opciones_json": [
            {"id": "A", "texto": "Dos pitadas largas cada 2 minutos."},
            {"id": "B", "texto": "Una pitada larga cada 2 minutos."},
            {"id": "C", "texto": "Una pitada larga seguida de dos cortas cada 2 minutos."},
            {"id": "D", "texto": "Tres pitadas cortas cada minuto."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 35: Un buque de propulsión mecánica con arrancada emitirá una pitada larga a intervalos no superiores a 2 minutos.",
        "imagen_url": "/images/ripa/sound_fog.jpg"
    },
    {
        "enunciado_es": "¿Qué significa una marca bicónica formada por dos conos unidos por sus vértices?",
        "opciones_json": [
            {"id": "A", "texto": "Buque fondeado."},
            {"id": "B", "texto": "Buque dedicado a la pesca."},
            {"id": "C", "texto": "Buque con capacidad de maniobra restringida."},
            {"id": "D", "texto": "Buque varado."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 26: Un buque dedicado a la pesca exhibirá dos conos unidos por sus vértices en línea vertical.",
        "imagen_url": "/images/ripa/marca_pesca.jpg"
    },
    {
        "enunciado_es": "Un buque de vela alcanza a otro de propulsión mecánica. ¿Quién debe maniobrar?",
        "opciones_json": [
            {"id": "A", "texto": "El buque de propulsión mecánica por ser de mayor tamaño."},
            {"id": "B", "texto": "El buque de vela por ser el que alcanza."},
            {"id": "C", "texto": "Ambos deben maniobrar."},
            {"id": "D", "texto": "El buque de propulsión mecánica por tener motor."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 13: Todo buque que alcance a otro se mantendrá apartado de la derrota del buque alcanzado, independientemente de su propulsión.",
        "imagen_url": "/images/ripa/alcance_vela_motor.jpg"
    },
    {
        "enunciado_es": "¿Cuál es el alcance mínimo de la luz de tope en buques de eslora igual o superior a 50 metros?",
        "opciones_json": [
            {"id": "A", "texto": "3 millas."},
            {"id": "B", "texto": "5 millas."},
            {"id": "C", "texto": "6 millas."},
            {"id": "D", "texto": "2 millas."}
        ],
        "respuesta_correcta": "C",
        "explicacion_es": "Regla 22: En buques de eslora igual o superior a 50 metros, la luz de tope debe ser visible a 6 millas.",
        "imagen_url": "/images/ripa/alcance_luces.jpg"
    },
    {
        "enunciado_es": "¿Qué indica una luz amarilla centelleante visible en todo el horizonte?",
        "opciones_json": [
            {"id": "A", "texto": "Submarino en superficie."},
            {"id": "B", "texto": "Aerodeslizador en modo sin desplazamiento."},
            {"id": "C", "texto": "Nave de vuelo rasante (WIG) despegando, aterrizando o en vuelo."},
            {"id": "D", "texto": "Buque en operaciones de practicaje."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 23: Un aerodeslizador operando en modo sin desplazamiento exhibirá una luz amarilla centelleante todo horizonte.",
        "imagen_url": "/images/ripa/luz_amarilla_centelleante.jpg"
    },
    {
        "enunciado_es": "En un canal angosto, un buque de vela navega dificultando el paso a un buque que solo puede navegar con seguridad dentro del canal. ¿Es correcto?",
        "opciones_json": [
            {"id": "A", "texto": "Sí, el velero siempre tiene preferencia."},
            {"id": "B", "texto": "No, el velero no estorbará el tránsito del otro buque."},
            {"id": "C", "texto": "Sí, si el canal tiene menos de 1 milla de ancho."},
            {"id": "D", "texto": "Solo si es de día."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 9: Los buques de vela y los de eslora inferior a 20 metros no estorbarán el tránsito de un buque que solo pueda navegar con seguridad dentro de un paso o canal angosto.",
        "imagen_url": "/images/ripa/canal_angosto.jpg"
    },
    {
        "enunciado_es": "¿Qué luces debe exhibir un buque fondeado de más de 50 metros de eslora?",
        "opciones_json": [
            {"id": "A", "texto": "Una luz blanca todo horizonte en proa."},
            {"id": "B", "texto": "Dos luces blancas todo horizonte, una en proa y otra en popa más baja."},
            {"id": "C", "texto": "Tres luces rojas en línea vertical."},
            {"id": "D", "texto": "Luces de costado y alcance."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 30: Un buque fondeado de más de 50 metros exhibirá en proa una luz blanca todo horizonte y en popa otra luz blanca todo horizonte a una altura inferior.",
        "imagen_url": "/images/ripa/fondeado_50m.jpg"
    }
])
questions.extend([
    {
        "enunciado_es": "¿Qué significado tienen tres bolas negras en línea vertical?",
        "opciones_json": [
            {"id": "A", "texto": "Buque sin gobierno."},
            {"id": "B", "texto": "Buque varado."},
            {"id": "C", "texto": "Buque restringido por su calado."},
            {"id": "D", "texto": "Buque remolcando a otro."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 30: Un buque varado exhibirá tres bolas negras en línea vertical.",
        "imagen_url": "/images/ripa/varado_dia.jpg"
    },
    {
        "enunciado_es": "¿Qué luz debe exhibir un buque de practicaje en servicio?",
        "opciones_json": [
            {"id": "A", "texto": "Dos luces rojas todo horizonte."},
            {"id": "B", "texto": "Blanca sobre roja todo horizonte."},
            {"id": "C", "texto": "Roja sobre blanca todo horizonte."},
            {"id": "D", "texto": "Roja sobre roja todo horizonte."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 29: Un buque de practicaje en servicio exhibirá en el tope una luz blanca sobre una luz roja.",
        "imagen_url": "/images/ripa/practicaje.jpg"
    },
    {
        "enunciado_es": "En visibilidad reducida, escuchas una pitada larga seguida de dos cortas. ¿Qué buque puede ser?",
        "opciones_json": [
            {"id": "A", "texto": "Buque sin gobierno."},
            {"id": "B", "texto": "Buque de propulsión mecánica con arrancada."},
            {"id": "C", "texto": "Buque fondeado."},
            {"id": "D", "texto": "Buque varado."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 35: Los buques sin gobierno, con capacidad de maniobra restringida, restringidos por calado, de vela, pesqueros y remolcadores emiten una larga y dos cortas.",
        "imagen_url": "/images/ripa/sound_signal_ram.jpg"
    },
    {
        "enunciado_es": "Dos buques de vela se aproximan con riesgo de abordaje. Ambos reciben el viento por babor. ¿Quién maniobra?",
        "opciones_json": [
            {"id": "A", "texto": "El que está a sotavento."},
            {"id": "B", "texto": "El que está a barlovento."},
            {"id": "C", "texto": "El de mayor eslora."},
            {"id": "D", "texto": "El más rápido."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 12: Cuando ambos reciben el viento por la misma banda, el buque a barlovento se mantendrá apartado del que esté a sotavento.",
        "imagen_url": "/images/ripa/vela_mismo_viento.jpg"
    },
    {
        "enunciado_es": "¿Qué indica un buque exhibiendo un cilindro negro en el tope?",
        "opciones_json": [
            {"id": "A", "texto": "Buque dedicado a la pesca."},
            {"id": "B", "texto": "Buque restringido por su calado."},
            {"id": "C", "texto": "Buque remolcando."},
            {"id": "D", "texto": "Buque en operaciones de dragado."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 28: Un buque restringido por su calado exhibirá, además de las luces normales, un cilindro negro.",
        "imagen_url": "/images/ripa/cilindro_negro.jpg"
    },
    {
        "enunciado_es": "En un dispositivo de separación de tráfico, ¿se permite pescar dentro de una vía de circulación?",
        "opciones_json": [
            {"id": "A", "texto": "Sí, siempre que no estorbe el paso de los buques que siguen la vía."},
            {"id": "B", "texto": "No, está terminantemente prohibido."},
            {"id": "C", "texto": "Solo de día."},
            {"id": "D", "texto": "Solo si es un pesquero de más de 20 metros."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 10: Los buques dedicados a la pesca no estorbarán el tránsito de cualquier buque que siga una vía de circulación.",
        "imagen_url": "/images/ripa/tss_fishing.jpg"
    },
    {
        "enunciado_es": "¿Qué luces debe exhibir un buque remolcando si la longitud del remolque supera los 200 metros?",
        "opciones_json": [
            {"id": "A", "texto": "Dos luces de tope blancas en línea vertical."},
            {"id": "B", "texto": "Tres luces de tope blancas en línea vertical."},
            {"id": "C", "texto": "Una luz de tope blanca y una amarilla."},
            {"id": "D", "texto": "Luces de costado y alcance solamente."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 24: Si la longitud del remolque (desde la popa del remolcador hasta la popa del último remolcado) excede 200 metros, exhibirá tres luces de tope.",
        "imagen_url": "/images/ripa/remolque_largo.jpg"
    },
    {
        "enunciado_es": "¿Qué señal emite un buque fondeado de menos de 100 metros en niebla?",
        "opciones_json": [
            {"id": "A", "texto": "Repique de campana durante 5 segundos cada minuto."},
            {"id": "B", "texto": "Pitada larga cada 2 minutos."},
            {"id": "C", "texto": "Gong en popa y campana en proa."},
            {"id": "D", "texto": "Tres pitadas cortas."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 35: Un buque fondeado de eslora inferior a 100 metros hará sonar la campana rápidamente durante unos 5 segundos a intervalos no mayores de 1 minuto.",
        "imagen_url": "/images/ripa/fog_anchor.jpg"
    },
    {
        "enunciado_es": "¿Qué significa una luz verde sobre una luz blanca todo horizonte?",
        "opciones_json": [
            {"id": "A", "texto": "Pesquero de arrastre."},
            {"id": "B", "texto": "Práctico en servicio."},
            {"id": "C", "texto": "Pesquero no de arrastre."},
            {"id": "D", "texto": "Buque de vela."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 26: Un buque dedicado a la pesca de arrastre exhibirá una luz verde sobre una blanca todo horizonte.",
        "imagen_url": "/images/ripa/pesca_arrastre_luces.jpg"
    },
    {
        "enunciado_es": "¿Cuándo se considera que existe riesgo de abordaje?",
        "opciones_json": [
            {"id": "A", "texto": "Cuando la marcación de un buque que se aproxima no varía apreciablemente."},
            {"id": "B", "texto": "Cuando la distancia disminuye rápidamente aunque varíe la marcación."},
            {"id": "C", "texto": "Solo de noche."},
            {"id": "D", "texto": "Cuando ambos buques navegan a más de 10 nudos."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 7: Se considerará que existe riesgo si la marcación de un buque que se aproxima no varía de forma apreciable.",
        "imagen_url": "/images/ripa/riesgo_abordaje.jpg"
    }
])
questions.extend([
    {
        "enunciado_es": "¿Qué significado tienen tres luces en línea vertical: blanca, roja, blanca?",
        "opciones_json": [
            {"id": "A", "texto": "Buque restringido por su calado."},
            {"id": "B", "texto": "Buque dedicado a la pesca de arrastre."},
            {"id": "C", "texto": "Buque realizando operaciones submarinas."},
            {"id": "D", "texto": "Buque de practicaje."}
        ],
        "respuesta_correcta": "C",
        "explicacion_es": "Regla 27: Un buque con capacidad de maniobra restringida (excepto limpieza de minas) exhibirá tres luces verticales: roja-blanca-roja. (Espera, la pregunta dice blanca-roja-blanca? NO, la correcta es roja-blanca-roja). Ah, mi pregunta dice 'blanca, roja, blanca'. Eso no existe en RIPA estandar. Debería ser Roja-Blanca-Roja. Corrigiendo enunciado.",
        "imagen_url": "/images/ripa/ram_luces.jpg"
    }
])
questions.pop() # Remove the last one added which was incorrect/partial

questions.extend([
    {
        "enunciado_es": "¿Qué significado tienen tres luces en línea vertical: roja, blanca, roja?",
        "opciones_json": [
            {"id": "A", "texto": "Buque restringido por su calado."},
            {"id": "B", "texto": "Buque dedicado a la pesca."},
            {"id": "C", "texto": "Buque con capacidad de maniobra restringida."},
            {"id": "D", "texto": "Buque sin gobierno."}
        ],
        "respuesta_correcta": "C",
        "explicacion_es": "Regla 27: Un buque con capacidad de maniobra restringida, salvo los dedicados a limpieza de minas, exhibirá tres luces en línea vertical: roja, blanca, roja.",
        "imagen_url": "/images/ripa/ram_luces.jpg"
    },
    {
        "enunciado_es": "Navegando de noche ves una luz verde y una roja juntas. ¿Qué puede ser?",
        "opciones_json": [
            {"id": "A", "texto": "Un buque de vela visto por proa."},
            {"id": "B", "texto": "Un buque de propulsión mecánica menor de 7 metros."},
            {"id": "C", "texto": "Un buque de pesca visto por popa."},
            {"id": "D", "texto": "Un buque fondeado."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 25: Un buque de vela en navegación exhibirá las luces de costado y una luz de alcance. Visto por proa, se verían ambas luces de costado (verde y roja).",
        "imagen_url": "/images/ripa/vela_proa.jpg"
    },
    {
        "enunciado_es": "¿Qué señal acústica emite un buque varado en niebla?",
        "opciones_json": [
            {"id": "A", "texto": "Tres toques de campana distintos, repique de campana, tres toques distintos."},
            {"id": "B", "texto": "Una pitada larga y dos cortas."},
            {"id": "C", "texto": "Repique de campana solamente."},
            {"id": "D", "texto": "Cuatro pitadas cortas."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 35: Un buque varado dará tres toques de campana claros y separados, seguidos del repique rápido y otros tres toques claros.",
        "imagen_url": "/images/ripa/fog_grounded.jpg"
    },
    {
        "enunciado_es": "¿Qué buque exhibe una luz roja sobre una verde en el tope?",
        "opciones_json": [
            {"id": "A", "texto": "Buque de vela en navegación."},
            {"id": "B", "texto": "Buque de pesca no de arrastre."},
            {"id": "C", "texto": "Buque de practicaje."},
            {"id": "D", "texto": "Buque dedicado a limpieza de minas."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 25: Un buque de vela en navegación podrá exhibir en el tope dos luces todo horizonte, roja sobre verde.",
        "imagen_url": "/images/ripa/vela_tope_opcional.jpg"
    },
    {
        "enunciado_es": "En un dispositivo de separación de tráfico, ¿cómo se debe cruzar una vía de circulación?",
        "opciones_json": [
            {"id": "A", "texto": "Lo más perpendicularmente posible a la dirección general de la corriente de tráfico."},
            {"id": "B", "texto": "Con un rumbo paralelo a la vía."},
            {"id": "C", "texto": "En diagonal para cruzar más rápido."},
            {"id": "D", "texto": "No se puede cruzar bajo ninguna circunstancia."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 10: Si un buque está obligado a cruzar una vía de circulación, lo hará siguiendo un rumbo que sea, en la medida de lo posible, perpendicular a la dirección general de la corriente de tráfico.",
        "imagen_url": "/images/ripa/tss_crossing.jpg"
    },
    {
        "enunciado_es": "¿Qué indica una bola negra en la parte de proa de un buque?",
        "opciones_json": [
            {"id": "A", "texto": "Buque fondeado."},
            {"id": "B", "texto": "Buque varado."},
            {"id": "C", "texto": "Buque sin gobierno."},
            {"id": "D", "texto": "Buque restringido por su calado."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 30: Un buque fondeado de día exhibirá en la parte de proa una bola negra.",
        "imagen_url": "/images/ripa/fondeado_dia.jpg"
    },
    {
        "enunciado_es": "Ves un buque con tres luces verdes en cruz. ¿Qué significa?",
        "opciones_json": [
            {"id": "A", "texto": "Buque dedicado a limpieza de minas."},
            {"id": "B", "texto": "Buque remolcando una estructura sumergida."},
            {"id": "C", "texto": "Buque con capacidad de maniobra restringida."},
            {"id": "D", "texto": "Buque de pesca de arrastre pelágico."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 27: Un buque dedicado a operaciones de limpieza de minas exhibirá tres luces verdes en cruz.",
        "imagen_url": "/images/ripa/minas_luces.jpg"
    },
    {
        "enunciado_es": "Un buque de propulsión mecánica menor de 12 metros, ¿qué luces debe llevar?",
        "opciones_json": [
            {"id": "A", "texto": "Luces de costado y luz de alcance."},
            {"id": "B", "texto": "Una luz blanca todo horizonte y luces de costado."},
            {"id": "C", "texto": "Solo una luz blanca todo horizonte."},
            {"id": "D", "texto": "Una luz tricolor en el tope."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 23: Un buque de propulsión mecánica de eslora inferior a 12 metros podrá exhibir una luz blanca todo horizonte y luces de costado.",
        "imagen_url": "/images/ripa/motor_menor_12m.jpg"
    },
    {
        "enunciado_es": "¿Qué señal acústica indica 'caigo a estribor'?",
        "opciones_json": [
            {"id": "A", "texto": "Una pitada corta."},
            {"id": "B", "texto": "Dos pitadas cortas."},
            {"id": "C", "texto": "Tres pitadas cortas."},
            {"id": "D", "texto": "Una pitada larga."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 34: Una pitada corta significa 'caigo a estribor'.",
        "imagen_url": "/images/ripa/sound_starboard.jpg"
    },
    {
        "enunciado_es": "¿Qué señal acústica indica 'caigo a babor'?",
        "opciones_json": [
            {"id": "A", "texto": "Una pitada corta."},
            {"id": "B", "texto": "Dos pitadas cortas."},
            {"id": "C", "texto": "Tres pitadas cortas."},
            {"id": "D", "texto": "Dos pitadas largas."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 34: Dos pitadas cortas significan 'caigo a babor'.",
        "imagen_url": "/images/ripa/sound_port.jpg"
    }
])
questions.extend([
    {
        "enunciado_es": "¿Qué señal acústica indica 'doy atrás'?",
        "opciones_json": [
            {"id": "A", "texto": "Tres pitadas cortas."},
            {"id": "B", "texto": "Una pitada larga y dos cortas."},
            {"id": "C", "texto": "Dos pitadas largas y una corta."},
            {"id": "D", "texto": "Una pitada larga."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 34: Tres pitadas cortas significan 'mis máquinas trabajan atrás'.",
        "imagen_url": "/images/ripa/sound_astern.jpg"
    },
    {
        "enunciado_es": "¿Qué luz indica 'buque restringido por su calado'?",
        "opciones_json": [
            {"id": "A", "texto": "Tres luces rojas en línea vertical."},
            {"id": "B", "texto": "Tres luces verdes en línea vertical."},
            {"id": "C", "texto": "Tres luces blancas en línea vertical."},
            {"id": "D", "texto": "Una luz roja y dos blancas."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 28: Un buque restringido por su calado exhibirá tres luces rojas en línea vertical.",
        "imagen_url": "/images/ripa/cbd_lights.jpg"
    },
    {
        "enunciado_es": "¿Qué señal acústica emite un buque remolcador con visibilidad reducida?",
        "opciones_json": [
            {"id": "A", "texto": "Una pitada larga seguida de dos cortas."},
            {"id": "B", "texto": "Una pitada larga seguida de tres cortas."},
            {"id": "C", "texto": "Dos pitadas largas."},
            {"id": "D", "texto": "Cuatro pitadas cortas."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 35: Un buque dedicado al remolque en visibilidad reducida emitirá una pitada larga seguida de dos cortas.",
        "imagen_url": "/images/ripa/fog_tow.jpg"
    },
    {
        "enunciado_es": "¿Qué luz de tope debe llevar un buque de propulsión mecánica mayor de 50 metros?",
        "opciones_json": [
            {"id": "A", "texto": "Dos luces de tope, la de popa más alta que la de proa."},
            {"id": "B", "texto": "Una sola luz de tope en proa."},
            {"id": "C", "texto": "Una luz de tope en el palo mayor solamente."},
            {"id": "D", "texto": "Dos luces de tope a la misma altura."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 23: Un buque de propulsión mecánica de eslora igual o superior a 50 metros exhibirá una segunda luz de tope a popa y más alta que la de proa.",
        "imagen_url": "/images/ripa/motor_mayor_50m.jpg"
    },
    {
        "enunciado_es": "¿Qué señal indica 'tengo dudas sobre su maniobra'?",
        "opciones_json": [
            {"id": "A", "texto": "Cinco pitadas cortas y rápidas."},
            {"id": "B", "texto": "Tres pitadas largas."},
            {"id": "C", "texto": "Una pitada larga y una corta."},
            {"id": "D", "texto": "Seis pitadas cortas."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 34: Si un buque tiene dudas sobre si el otro está maniobrando lo suficiente para evitar el abordaje, emitirá al menos cinco pitadas cortas y rápidas.",
        "imagen_url": "/images/ripa/sound_doubt.jpg"
    },
    {
        "enunciado_es": "¿Qué indica una marca de dos bolas negras en línea vertical?",
        "opciones_json": [
            {"id": "A", "texto": "Buque sin gobierno."},
            {"id": "B", "texto": "Buque varado."},
            {"id": "C", "texto": "Buque fondeado."},
            {"id": "D", "texto": "Buque dedicado a la pesca."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 27: Un buque sin gobierno exhibirá de día dos bolas negras en línea vertical.",
        "imagen_url": "/images/ripa/nuc_day.jpg"
    },
    {
        "enunciado_es": "¿Qué indica una marca cónica con el vértice hacia abajo?",
        "opciones_json": [
            {"id": "A", "texto": "Buque a vela navegando a motor."},
            {"id": "B", "texto": "Buque de pesca."},
            {"id": "C", "texto": "Buque fondeado."},
            {"id": "D", "texto": "Buque restringido por calado."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 25: Un buque de vela que navegue a motor exhibirá a proa un cono con el vértice hacia abajo.",
        "imagen_url": "/images/ripa/vela_cono.jpg"
    },
    {
        "enunciado_es": "Un buque exhibe luces roja, blanca y roja verticalmente. ¿Qué maniobra debe hacer otro buque?",
        "opciones_json": [
            {"id": "A", "texto": "Mantenerse apartado de su derrota."},
            {"id": "B", "texto": "Mantener rumbo y velocidad si viene por estribor."},
            {"id": "C", "texto": "Solo maniobrar si hay riesgo inminente."},
            {"id": "D", "texto": "Tocar 5 pitadas cortas."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 18: Todo buque se mantendrá apartado de un buque con capacidad de maniobra restringida (que exhibe roja-blanca-roja).",
        "imagen_url": "/images/ripa/ram_action.jpg"
    },
    {
        "enunciado_es": "¿Qué buque tiene preferencia sobre un buque dedicado a la pesca?",
        "opciones_json": [
            {"id": "A", "texto": "Un buque sin gobierno."},
            {"id": "B", "texto": "Un buque de vela."},
            {"id": "C", "texto": "Un buque de propulsión mecánica."},
            {"id": "D", "texto": "Ninguno, el pesquero siempre tiene preferencia."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 18: Un buque dedicado a la pesca se mantendrá apartado de un buque sin gobierno.",
        "imagen_url": "/images/ripa/hierarchy.jpg"
    },
    {
        "enunciado_es": "¿Qué luces debe exhibir un buque varado menor de 50 metros?",
        "opciones_json": [
            {"id": "A", "texto": "Dos luces rojas en línea vertical y luces de fondeo."},
            {"id": "B", "texto": "Tres luces rojas y luces de fondeo."},
            {"id": "C", "texto": "Solo luces de fondeo."},
            {"id": "D", "texto": "Luces de costado y alcance."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 30: Un buque varado exhibirá las luces de fondeo y además dos luces rojas todo horizonte en línea vertical.",
        "imagen_url": "/images/ripa/varado_noche.jpg"
    }
])
questions.extend([
    {
        "enunciado_es": "¿Qué luz indica 'buque en operaciones de remolque'?",
        "opciones_json": [
            {"id": "A", "texto": "Dos luces de tope amarillas."},
            {"id": "B", "texto": "Dos luces de tope blancas verticales (o tres si >200m)."},
            {"id": "C", "texto": "Una luz verde sobre blanca."},
            {"id": "D", "texto": "Una luz roja sobre blanca."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 24: Un buque de propulsión mecánica remolcando exhibirá dos luces de tope en línea vertical.",
        "imagen_url": "/images/ripa/tow_lights_basic.jpg"
    },
    {
        "enunciado_es": "¿Qué señal acústica emite un buque piloto en visibilidad reducida?",
        "opciones_json": [
            {"id": "A", "texto": "Cuatro pitadas cortas."},
            {"id": "B", "texto": "Una larga y dos cortas."},
            {"id": "C", "texto": "Tres cortas."},
            {"id": "D", "texto": "Una larga cada 2 minutos."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 35: Un buque de practicaje en servicio puede emitir, además de las señales normales, cuatro pitadas cortas.",
        "imagen_url": "/images/ripa/pilot_fog.jpg"
    },
    {
        "enunciado_es": "¿Qué indica una marca bicónica en un buque fondeado?",
        "opciones_json": [
            {"id": "A", "texto": "Nada, no se usa."},
            {"id": "B", "texto": "Buque realizando operaciones de pesca."},
            {"id": "C", "texto": "Buque restringido por su calado."},
            {"id": "D", "texto": "Buque en operaciones de dragado con obstrucción."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 26: Un buque dedicado a la pesca exhibirá dos conos unidos por sus vértices (marca bicónica). Si está fondeado pescando, exhibirá las mismas luces o marcas.",
        "imagen_url": "/images/ripa/pesca_fondeado.jpg"
    },
    {
        "enunciado_es": "¿Qué buque debe mantenerse apartado en un cruce: uno restringido por calado o uno de vela?",
        "opciones_json": [
            {"id": "A", "texto": "El de vela."},
            {"id": "B", "texto": "El restringido por calado."},
            {"id": "C", "texto": "Ninguno, deben comunicarse."},
            {"id": "D", "texto": "El de menor eslora."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 18: Un buque de vela se mantendrá apartado de un buque restringido por su calado.",
        "imagen_url": "/images/ripa/hierarchy_cbd.jpg"
    },
    {
        "enunciado_es": "¿Qué significa una luz blanca todo horizonte visible a 2 millas?",
        "opciones_json": [
            {"id": "A", "texto": "Luz de alcance."},
            {"id": "B", "texto": "Luz de tope de un buque menor de 12m."},
            {"id": "C", "texto": "Luz de fondeo de un buque menor de 50m."},
            {"id": "D", "texto": "Todas las anteriores son posibles dependiendo del contexto."}
        ],
        "respuesta_correcta": "D",
        "explicacion_es": "Regla 22: Una luz blanca con alcance de 2 millas puede ser de tope (<12m), de alcance (<50m) o de fondeo (<50m).",
        "imagen_url": "/images/ripa/white_light.jpg"
    },
    {
        "enunciado_es": "¿Cuándo debe encender las luces de navegación un buque?",
        "opciones_json": [
            {"id": "A", "texto": "Desde la puesta hasta la salida del sol y en visibilidad reducida."},
            {"id": "B", "texto": "Solo de noche."},
            {"id": "C", "texto": "Solo en alta mar."},
            {"id": "D", "texto": "Siempre que esté en movimiento."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 20: Las reglas relativas a las luces deberán cumplirse desde la puesta del sol hasta su salida, y en condiciones de visibilidad reducida.",
        "imagen_url": "/images/ripa/lights_time.jpg"
    },
    {
        "enunciado_es": "¿Qué indica una marca esférica negra en la parte de proa?",
        "opciones_json": [
            {"id": "A", "texto": "Buque fondeado."},
            {"id": "B", "texto": "Buque varado."},
            {"id": "C", "texto": "Buque sin gobierno."},
            {"id": "D", "texto": "Buque remolcando."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 30: Un buque fondeado exhibirá de día una bola negra en la parte de proa.",
        "imagen_url": "/images/ripa/anchor_ball.jpg"
    },
    {
        "enunciado_es": "Un buque navegando a vela y motor, ¿qué debe exhibir?",
        "opciones_json": [
            {"id": "A", "texto": "Una marca cónica con el vértice hacia abajo."},
            {"id": "B", "texto": "Una marca cónica con el vértice hacia arriba."},
            {"id": "C", "texto": "Dos conos unidos por la base."},
            {"id": "D", "texto": "Una bola negra."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 25: Un buque que navegue a vela y a la vez a motor exhibirá a proa un cono con el vértice hacia abajo.",
        "imagen_url": "/images/ripa/motorsail.jpg"
    },
    {
        "enunciado_es": "¿Qué luces debe exhibir un buque pesquero no de arrastre lanzando redes?",
        "opciones_json": [
            {"id": "A", "texto": "Roja sobre blanca todo horizonte."},
            {"id": "B", "texto": "Verde sobre blanca todo horizonte."},
            {"id": "C", "texto": "Roja sobre roja."},
            {"id": "D", "texto": "Blanca sobre roja."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 26: Un buque dedicado a la pesca, que no sea de arrastre, exhibirá una luz roja sobre una blanca todo horizonte.",
        "imagen_url": "/images/ripa/pesca_luces.jpg"
    },
    {
        "enunciado_es": "¿Qué señal indica peligro y necesidad de ayuda?",
        "opciones_json": [
            {"id": "A", "texto": "Movimiento lento y repetido de los brazos extendidos lateralmente de arriba abajo."},
            {"id": "B", "texto": "Cinco pitadas cortas."},
            {"id": "C", "texto": "Bandera Alfa."},
            {"id": "D", "texto": "Tres bolas negras."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Anexo IV: Una señal de peligro es mover los brazos extendidos lateralmente de arriba abajo.",
        "imagen_url": "/images/ripa/distress.jpg"
    }
])

questions.extend([
    {
        "enunciado_es": "¿Qué luz indica 'buque en operaciones de remolque'?",
        "opciones_json": [
            {"id": "A", "texto": "Dos luces de tope amarillas."},
            {"id": "B", "texto": "Dos luces de tope blancas verticales (o tres si >200m)."},
            {"id": "C", "texto": "Una luz verde sobre blanca."},
            {"id": "D", "texto": "Una luz roja sobre blanca."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 24: Un buque de propulsión mecánica remolcando exhibirá dos luces de tope en línea vertical.",
        "imagen_url": "/images/ripa/tow_lights_basic.jpg"
    },
    {
        "enunciado_es": "¿Qué señal acústica emite un buque piloto en visibilidad reducida?",
        "opciones_json": [
            {"id": "A", "texto": "Cuatro pitadas cortas."},
            {"id": "B", "texto": "Una larga y dos cortas."},
            {"id": "C", "texto": "Tres cortas."},
            {"id": "D", "texto": "Una larga cada 2 minutos."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 35: Un buque de practicaje en servicio puede emitir, además de las señales normales, cuatro pitadas cortas.",
        "imagen_url": "/images/ripa/pilot_fog.jpg"
    },
    {
        "enunciado_es": "¿Qué indica una marca bicónica en un buque fondeado?",
        "opciones_json": [
            {"id": "A", "texto": "Nada, no se usa."},
            {"id": "B", "texto": "Buque realizando operaciones de pesca."},
            {"id": "C", "texto": "Buque restringido por su calado."},
            {"id": "D", "texto": "Buque en operaciones de dragado con obstrucción."}
        ],
        "respuesta_correcta": "B",
        "explicacion_es": "Regla 26: Un buque dedicado a la pesca exhibirá dos conos unidos por sus vértices (marca bicónica). Si está fondeado pescando, exhibirá las mismas luces o marcas.",
        "imagen_url": "/images/ripa/pesca_fondeado.jpg"
    },
    {
        "enunciado_es": "¿Qué buque debe mantenerse apartado en un cruce: uno restringido por calado o uno de vela?",
        "opciones_json": [
            {"id": "A", "texto": "El de vela."},
            {"id": "B", "texto": "El restringido por calado."},
            {"id": "C", "texto": "Ninguno, deben comunicarse."},
            {"id": "D", "texto": "El de menor eslora."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 18: Un buque de vela se mantendrá apartado de un buque restringido por su calado.",
        "imagen_url": "/images/ripa/hierarchy_cbd.jpg"
    },
    {
        "enunciado_es": "¿Qué significa una luz blanca todo horizonte visible a 2 millas?",
        "opciones_json": [
            {"id": "A", "texto": "Luz de alcance."},
            {"id": "B", "texto": "Luz de tope de un buque menor de 12m."},
            {"id": "C", "texto": "Luz de fondeo de un buque menor de 50m."},
            {"id": "D", "texto": "Todas las anteriores son posibles dependiendo del contexto."}
        ],
        "respuesta_correcta": "D",
        "explicacion_es": "Regla 22: Una luz blanca con alcance de 2 millas puede ser de tope (<12m), de alcance (<50m) o de fondeo (<50m).",
        "imagen_url": "/images/ripa/white_light.jpg"
    },
    {
        "enunciado_es": "¿Cuándo debe encender las luces de navegación un buque?",
        "opciones_json": [
            {"id": "A", "texto": "Desde la puesta hasta la salida del sol y en visibilidad reducida."},
            {"id": "B", "texto": "Solo de noche."},
            {"id": "C", "texto": "Solo en alta mar."},
            {"id": "D", "texto": "Siempre que esté en movimiento."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 20: Las reglas relativas a las luces deberán cumplirse desde la puesta del sol hasta su salida, y en condiciones de visibilidad reducida.",
        "imagen_url": "/images/ripa/lights_time.jpg"
    },
    {
        "enunciado_es": "¿Qué indica una marca esférica negra en la parte de proa?",
        "opciones_json": [
            {"id": "A", "texto": "Buque fondeado."},
            {"id": "B", "texto": "Buque varado."},
            {"id": "C", "texto": "Buque sin gobierno."},
            {"id": "D", "texto": "Buque remolcando."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 30: Un buque fondeado exhibirá de día una bola negra en la parte de proa.",
        "imagen_url": "/images/ripa/anchor_ball.jpg"
    },
    {
        "enunciado_es": "Un buque navegando a vela y motor, ¿qué debe exhibir?",
        "opciones_json": [
            {"id": "A", "texto": "Una marca cónica con el vértice hacia abajo."},
            {"id": "B", "texto": "Una marca cónica con el vértice hacia arriba."},
            {"id": "C", "texto": "Dos conos unidos por la base."},
            {"id": "D", "texto": "Una bola negra."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 25: Un buque que navegue a vela y a la vez a motor exhibirá a proa un cono con el vértice hacia abajo.",
        "imagen_url": "/images/ripa/motorsail.jpg"
    },
    {
        "enunciado_es": "¿Qué luces debe exhibir un buque pesquero no de arrastre lanzando redes?",
        "opciones_json": [
            {"id": "A", "texto": "Roja sobre blanca todo horizonte."},
            {"id": "B", "texto": "Verde sobre blanca todo horizonte."},
            {"id": "C", "texto": "Roja sobre roja."},
            {"id": "D", "texto": "Blanca sobre roja."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Regla 26: Un buque dedicado a la pesca, que no sea de arrastre, exhibirá una luz roja sobre una blanca todo horizonte.",
        "imagen_url": "/images/ripa/pesca_luces.jpg"
    },
    {
        "enunciado_es": "¿Qué señal indica peligro y necesidad de ayuda?",
        "opciones_json": [
            {"id": "A", "texto": "Movimiento lento y repetido de los brazos extendidos lateralmente de arriba abajo."},
            {"id": "B", "texto": "Cinco pitadas cortas."},
            {"id": "C", "texto": "Bandera Alfa."},
            {"id": "D", "texto": "Tres bolas negras."}
        ],
        "respuesta_correcta": "A",
        "explicacion_es": "Anexo IV: Una señal de peligro es mover los brazos extendidos lateralmente de arriba abajo.",
        "imagen_url": "/images/ripa/distress.jpg"
    }
])

def generate_sql():
    # Helper to format JSON for SQL
    questions_json = json.dumps(questions).replace("'", "''")

    sql_header = """
-- MIGRATION: ADD COMPREHENSIVE RIPA QUIZ
-- Generated by script

DO $$
DECLARE
    v_modulo_id UUID;
    v_unidad_id UUID;
    v_evaluacion_id UUID;
    v_pregunta_id UUID;
    v_questions JSONB;
    v_q RECORD;
BEGIN
    -- 1. Get Module ID (Practica y Reglamento)
    SELECT id INTO v_modulo_id FROM public.modulos WHERE slug = 'practica-reglamento' LIMIT 1;

    IF v_modulo_id IS NULL THEN
        RAISE NOTICE 'Module practica-reglamento not found. Skipping.';
        RETURN;
    END IF;

    -- 2. Create or Get Unit 'Examen Avanzado RIPA'
    INSERT INTO public.unidades_didacticas (
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
        contenido_practico_eu
    )
    VALUES (
        v_modulo_id,
        'examen-ripa-avanzado',
        'Examen Avanzado RIPA (Patrón de Yate)',
        'RIPA Azterketa Aurreratua',
        99, -- High order to be at the end
        60,
        ARRAY['Dominar el Reglamento Internacional para Prevenir Abordajes', 'Identificar luces y marcas', 'Conocer las reglas de rumbo y gobierno'],
        ARRAY['Nazioarteko Araudia menperatzea', 'Argiak eta markak identifikatzea', 'Norabide eta gobernu arauak ezagutzea'],
        '<h2>Examen Avanzado de RIPA</h2><p>Este examen simula las condiciones de un examen de Patrón de Yate. Consta de 50 preguntas sobre luces, marcas, señales acústicas y reglas de rumbo y gobierno.</p>',
        '<h2>RIPA Azterketa Aurreratua</h2><p>Azterketa honek Patroi tituluaren baldintzak simulatzen ditu.</p>',
        '<p>Realiza el test para evaluar tus conocimientos.</p>',
        '<p>Egin testa zure ezagutzak ebaluatzeko.</p>'
    )
    ON CONFLICT (modulo_id, slug) DO UPDATE SET
        nombre_es = EXCLUDED.nombre_es,
        duracion_estimada_min = EXCLUDED.duracion_estimada_min
    RETURNING id INTO v_unidad_id;

    -- If updated (id not returned by INSERT returning if conflict?), select it
    IF v_unidad_id IS NULL THEN
        SELECT id INTO v_unidad_id FROM public.unidades_didacticas WHERE modulo_id = v_modulo_id AND slug = 'examen-ripa-avanzado';
    END IF;

    -- 3. Create Evaluation
    INSERT INTO public.evaluaciones (
        tipo,
        entidad_tipo,
        entidad_id,
        titulo_es,
        titulo_eu,
        descripcion_es,
        descripcion_eu,
        num_preguntas,
        tiempo_limite_min,
        nota_aprobado,
        intentos_maximos,
        aleatorizar_preguntas,
        aleatorizar_opciones
    )
    VALUES (
        'quiz_unidad',
        'unidad',
        v_unidad_id,
        'Examen RIPA Completo (50 Preguntas)',
        'RIPA Azterketa Osoa (50 Galdera)',
        'Simulacro de examen oficial. 50 preguntas tipo test.',
        'Azterketa ofizialaren simulazioa.',
        50,
        60, -- 60 minutes
        75.00, -- 75% to pass
        NULL,
        TRUE,
        TRUE
    )
    RETURNING id INTO v_evaluacion_id;

    -- 4. Insert Questions
"""
    sql_questions = f"    v_questions := '{questions_json}'::jsonb;"

    sql_footer = """
    FOR v_q IN SELECT * FROM jsonb_to_recordset(v_questions) AS x(
        enunciado_es TEXT,
        opciones_json JSONB,
        respuesta_correcta TEXT,
        explicacion_es TEXT,
        imagen_url TEXT
    )
    LOOP
        INSERT INTO public.preguntas (
            evaluacion_id,
            enunciado_es,
            enunciado_eu,
            tipo_pregunta,
            opciones_es,
            opciones_eu, -- Copying ES to EU for now as placeholder
            respuesta_correcta,
            explicacion_es,
            explicacion_eu,
            imagen_url,
            orden,
            opciones_json -- Legacy field, keeping it populated
        )
        VALUES (
            v_evaluacion_id,
            v_q.enunciado_es,
            v_q.enunciado_es, -- Placeholder EU
            'opcion_multiple',
            v_q.opciones_json,
            v_q.opciones_json, -- Placeholder EU
            to_jsonb(v_q.respuesta_correcta),
            v_q.explicacion_es,
            v_q.explicacion_es, -- Placeholder EU
            v_q.imagen_url,
            0,
            v_q.opciones_json
        );
    END LOOP;

    RAISE NOTICE 'RIPA Quiz created with 50 questions.';
END $$;
"""

    with open('supabase/migrations/20240523000000_add_ripa_quiz.sql', 'w') as f:
        f.write(sql_header + sql_questions + sql_footer)

if __name__ == '__main__':
    generate_sql()
