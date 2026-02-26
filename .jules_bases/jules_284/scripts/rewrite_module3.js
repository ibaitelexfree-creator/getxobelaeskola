
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
        env[parts[0].trim()] = parts[1].trim();
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function rewriteModule3() {
    console.log('Rewriting Module 3 (Técnica y Maniobras) for Maneuver Challenges...');

    // 1. Get Module 3 ID
    const { data: module3 } = await supabase
        .from('modulos')
        .select('id')
        .eq('nombre_es', 'Técnica y Maniobras Básicas')
        .single();

    if (!module3) {
        console.error('Module 3 not found');
        return;
    }

    // 2. Delete existing units
    const { error: deleteError } = await supabase
        .from('unidades_didacticas')
        .delete()
        .eq('modulo_id', module3.id);

    if (deleteError) {
        console.error('Error deleting old units:', deleteError);
        return;
    }

    console.log('✓ Cleaned old units.');

    // 3. Insert new units
    const units = [
        {
            orden: 1,
            slug: 'virar-vs-trasluchar',
            nombre_es: 'Desafío: Virada vs. Trasluchada',
            nombre_eu: 'Erronka: Biratu vs. Trasluchatu',
            duracion_estimada_min: 20,
            contenido_teoria_es: `
## El Baile del Barco

Hay dos formas de cambiar de rumbo:
1.  **Virada por Avante (Tacking):** Girar cruzando la proa por el viento. (Entrar en la zona de "No Go").
2.  **Trasluchada (Gybing):** Girar cruzando la popa por el viento. (¡Peligro!).

## La Gran Diferencia

*   En la **Virada**, las velas flamean y pierden fuerza. Es una maniobra "lenta" y controlada.
*   En la **Trasluchada**, las velas pasan de un lado a otro llenas de viento. La botavara cruza a toda velocidad.

> **Regla de Oro:** Si tienes dudas, vira. La trasluchada requiere respeto y control de la botavara con la mano (o con la escota).
      `,
            contenido_teoria_eu: `
## Ontziaren Dantza

Bi modu daude norabidea aldatzeko:
1.  **Biratu Abantetik (Tacking):** Haizetik branka gurutzatuz biratu. ("No Go" eremuan sartu).
2.  **Trasluchatu (Gybing):** Haizetik popa gurutzatuz biratu. (Arriskua!).

## Alde Handia

*   **Biraketan**, belak astintzen dira eta indarra galtzen dute. Maniobra "motela" eta kontrolatua da.
*   **Trasluchadan**, belak haizez beteta pasatzen dira alde batetik bestera. Botavara abiadura bizian gurutzatzen da.

> **Urrezko Araua:** Zalantzarik baduzu, biratu. Trasluchadak errespetua eta botavara eskuarekin (edo eskotarekin) kontrolatzea eskatzen du.
      `
        },
        {
            orden: 2,
            slug: 'posicion-cuerpo',
            nombre_es: 'Tú eres el Contrapeso (La Banda)',
            nombre_eu: 'Zu zara Kontrapisua (Banda)',
            duracion_estimada_min: 15,
            contenido_teoria_es: `
## El Tripulante Activo

Un velero ligero, sin su tripulación, volcaría. Tú eres parte del equilibrio del barco.

## ¿Dónde me siento?

*   **Viento Flojo:** Siéntate dentro, a sotavento si es necesario, para que las velas cojan forma por gravedad.
*   **Viento Fuerte:** ¡Saca el culo! Cuélgate de la banda a barlovento. Cuanto más lejos esté tu peso del centro, más palanca haces (Par adrizante).

> **Misión:** Imagina que eres una balanza. Si el barco escora (se inclina), tú te mueves al lado contrario. ¡Nunca te quedes quieto!
      `,
            contenido_teoria_eu: `
## Tripulatzaile Aktiboa

Belaontzi arin bat, tripulaziorik gabe, irauliko litzateke. Zu ontziaren orekaren parte zara.

## Non esertzen naiz?

*   **Haize Ahula:** Eseri barruan, haizebe, beharrezkoa bada, belek grabitatez forma har dezaten.
*   **Haize Indartsua:** Atera ipurdia! Zintzilikatu bandatik haizealdera. Zure pisua zentrotik neoz eta urrunago egon, orduan eta palanka gehiago egiten duzu (Adrizatze parea).

> **Misioa:** Imajinatu balantza bat zarela. Ontzia eskoratzen bada (makurtzen bada), zu kontrako aldera mugitzen zara. Inoiz ez geratu geldi!
      `
        }
    ];

    for (const unit of units) {
        const { error } = await supabase
            .from('unidades_didacticas')
            .insert({
                modulo_id: module3.id,
                ...unit
            });

        if (error) console.error(`Error inserting ${unit.slug}:`, error);
        else console.log(`✓ Inserted ${unit.slug}`);
    }
}

rewriteModule3();
