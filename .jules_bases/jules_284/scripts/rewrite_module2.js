
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

async function rewriteModule2() {
    console.log('Rewriting Module 2 (Teoría de la Navegación) for Wind Lab integration...');

    // 1. Get Module 2 ID
    const { data: module2 } = await supabase
        .from('modulos')
        .select('id')
        .eq('nombre_es', 'Teoría de la Navegación')
        .single();

    if (!module2) {
        console.error('Module 2 not found');
        return;
    }

    // 2. Delete existing units
    const { error: deleteError } = await supabase
        .from('unidades_didacticas')
        .delete()
        .eq('modulo_id', module2.id);

    if (deleteError) {
        console.error('Error deleting old units:', deleteError);
        return;
    }

    console.log('✓ Cleaned old units.');

    // 3. Insert new units with Wind Lab hints
    const units = [
        {
            orden: 1,
            slug: 'la-rosa-de-los-vientos',
            nombre_es: 'Domando el Viento: La Rosa Interactiva',
            nombre_eu: 'Haizea Menderatzen: Arrosa Interaktiboa',
            duracion_estimada_min: 20,
            contenido_teoria_es: `
## El Mar es tu Tablero, el Viento es tu Motor

Navegar no es ir en línea recta. Es bailar con el viento. Según de dónde venga, tu barco tiene "marchas" diferentes.

## Los 4 Rumbos Sagrados

1.  **Ceñida (Close Hauled):** Navegar contra el viento (aprox. 45º). Las velas van cazadas a tope (planas). Es el rumbo más difícil e inestable.
2.  **Través (Beam Reach):** El viento entra por el costado (90º). ¡El rumbo más rápido y divertido! Las velas van a mitad.
3.  **Largo (Broad Reach):** El viento entra por la aleta (135º). Rumbo potente y estable.
4.  **Empopada (Running):** El viento viene de atrás (180º). Velas totalmente abiertas. Parece tranquilo, pero es engañoso (cuidado con las trasluchadas).

> **Laboratorio de Viento:** En nuestra simulación, prueba a poner el barco a 90º del viento y observa cómo la flecha de velocidad se dispara.
      `,
            contenido_teoria_eu: `
## Itsasoa da zure Taula, Haizea zure Motorra

Nabigatzea ez da lerro zuzenean joatea. Haizearekin dantza egitea da. Nondik datorren arabera, zure ontziak "martxa" desberdinak ditu.

## 4 Norabide Sakratuak

1.  **Ahaireko (Close Hauled):** Haizearen kontra nabigatzea (gutxi gorabehera 45º). Belak toperaino ehizatuta doaz (lauak). Norabiderik zailena eta ezegonkorrena da.
2.  **Zeharkako (Beam Reach):** Haizea albotik sartzen da (90º). Norabiderik azkarrena eta dibertigarriena! Belak erdira doaz.
3.  **Largoa (Broad Reach):** Haizea hegatsatik sartzen da (135º). Norabide indartsua eta egonkorra.
4.  **Popakoa (Running):** Haizea atzetik dator (180º). Belak guztiz irekita. Lasaia dirudi, baina engainagarria da (kontuz trasluchadekin).

> **Haize Laborategia:** Gure simulazioan, saiatu ontzia haizetik 90º-ra jartzen eta ikusi nola abiadura-gezia disparatzen den.
      `
        },
        {
            orden: 2,
            slug: 'fisica-velas',
            nombre_es: 'Física de Fluidos para Grumetes',
            nombre_eu: 'Jariakinen Fisika Grumeteentzat',
            duracion_estimada_min: 15,
            contenido_teoria_es: `
## ¿Por qué avanza un barco? (No es solo empuje)

Cuando vas empopada, el viento te **empuja** (como una mano en la espalda). Simple.
Pero cuando vas de ceñida (contra el viento), el viento te **succiona**. ¡Magia!

## El Efecto Ala de Avión

Tu vela mayor es una ala puesta en vertical.
*   El aire pasa más rápido por el lado de sotavento (curva exterior).
*   Esto crea baja presión (vacío) que "chupa" el barco hacia adelante.

Por eso necesitamos **orza**. Si no tuviéramos orza bajo el agua para frenar el derrape lateral, el barco se iría de lado.

> **Misión Mental:** Visualiza el flujo de aire pegado a la tela. Si la vela flamea, el flujo se ha roto. ¡Cázala suavemente hasta que deje de flamear!
      `,
            contenido_teoria_eu: `
## Zergatik egiten du aurrera ontzi batek? (Ez da bultzada bakarrik)

Popaz zoazenean, haizeak **bultzatzen** zaitu (esku bat bizkarrean bezala). Sinplea.
Baina ahairekoan zoazenean (haizearen kontra), haizeak **xurgatzen** zaitu. Magia!

## Hegazkin-hegalaren Efektua

Zure bela nagusia bertikalean jarritako hegal bat da.
*   Aire haizebetik (kanpoko kurbatik) azkarrago pasatzen da.
*   Honek presio baxua (hutsunea) sortzen du, ontzia aurrerantz "xurgatzen" duena.

Horregatik behar dugu **orza**. Uramenpe orzarik ez bagenu alboko irristatzea frenatzeko, ontzia alborantz joango litzateke.

> **Buruko Misioa:** Bisualizatu oihalari itsatsitako aire-fluxua. Belak astintzen badu, fluxua hautsi egin da. Ehizatu leunki astintzeari utzi arte!
      `
        }
    ];

    for (const unit of units) {
        const { error } = await supabase
            .from('unidades_didacticas')
            .insert({
                modulo_id: module2.id,
                ...unit
            });

        if (error) console.error(`Error inserting ${unit.slug}:`, error);
        else console.log(`✓ Inserted ${unit.slug}`);
    }
}

rewriteModule2();
