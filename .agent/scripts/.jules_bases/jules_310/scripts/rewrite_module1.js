
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

async function cleanAndRewriteModule1() {
    console.log('Cleaning and rewriting Module 1 for consistency...');

    // 1. Get Module 1 ID
    const { data: module1 } = await supabase
        .from('modulos')
        .select('id')
        .eq('nombre_es', 'Introducción y Seguridad')
        .single();

    if (!module1) {
        console.error('Module 1 not found');
        return;
    }

    // 2. Delete all existing units for this module to avoid conflicts
    const { error: deleteError } = await supabase
        .from('unidades_didacticas')
        .delete()
        .eq('modulo_id', module1.id);

    if (deleteError) {
        console.error('Error deleting old units:', deleteError);
        return;
    }

    console.log('✓ Cleaned old units.');

    // 3. Insert new gamified units
    const units = [
        {
            orden: 1,
            slug: 'partes-del-barco',
            nombre_es: 'Tu Equipo de Aventura: El Barco',
            nombre_eu: 'Zure Abentura Ekipamendua: Ontzia',
            duracion_estimada_min: 15,
            contenido_teoria_es: `
## Bienvenido a tu Nave

¿Listo para zarpar? Antes de levar anclas, necesitas conocer tu herramienta más importante: el barco. Piensa en él como tu **exoesqueleto en el mar**.

## Inventario de Cubierta (Desbloqueable)

*   **Proa (Bow):** La parte delantera. "Donde rompen las olas".
*   **Popa (Stern):** La parte trasera. "Donde dejas tu estela".
*   **Babor (Port):** Izquierda (Mirando a proa). Lado Rojo.
*   **Estribor (Starboard):** Derecha (Mirando a proa). Lado Verde.

> **Misión:** Memoriza estos 4 puntos cardinales del barco. ¡Tu vida dependerá de ejecutarlos rápido bajo presión!

## El Motor del Viento

*   **Mástil:** La columna vertebral que sostiene las velas.
*   **Botavara:** El brazo horizontal que extiende la vela mayor. **¡Cuidado con la cabeza!** Es el elemento más peligroso si cambia de lado bruscamente.
*   **Vela Mayor:** Tu motor principal.
*   **Foque:** La vela de proa, tu "turbo" y estabilizador.

## El Timón: Tu Volante

El timón no se mueve como el volante de un coche.
*   Si empujas la caña a **Estribor**, el barco gira a **Babor**.
*   Si empujas la caña a **Babor**, el barco gira a **Estribor**.

¡Es contraintuitivo al principio, pero pronto será instintivo!
      `,
            contenido_teoria_eu: `
## Ongi etorri zure Ontzira

Prest zarpatzeko? Aingurak altxatu aurretik, zure tresnarik garrantzitsuena ezagutu behar duzu: ontzia. Pentsatu ezazu **itsasoko zure exoeskeletoa** dela.

## Bizkarreko Inbentarioa (Desblokeagarria)

*   **Branka (Proa):** Aurreko aldea. "Olatuak apurtzen diren lekua".
*   **Popa (Stern):** Atzeko aldea. "Zure arrastoa uzten duzun lekua".
*   **Ababor (Babor):** Ezkerra (Brankara begira). Alde Gorria.
*   **Istribor (Estribor):** Eskuma (Brankara begira). Alde Berdea.

> **Misioa:** Memorizatu ontziaren 4 puntu kardinal hauek. Zure bizitza presiopean azkar exekutatzearen mende egongo da!

## Haizearen Motorra

*   **Masta:** Belak eusten dituen bizkarrezurra.
*   **Botavara:** Bela nagusia hedatzen duen beso horizontala. **Kontuz buruarekin!** Elementurik arriskutsuena da bat-batean aldatzen bada.
*   **Bela Nagusia:** Zure motor nagusia.
*   **Fokea:** Brankako bela, zure "turbo" eta egonkortzailea.

## Lemak: Zure Bolantea

Lema ez da auto baten bolantea bezala mugitzen.
*   Gobernua **Istriborrera** bultzatzen baduzu, ontziak **Ababorrera** biratzen du.
*   Gobernua **Ababorrera** bultzatzen baduzu, ontziak **Istriborrera** biratzen du.

Hasieran kontraintuitiboa da, baina laster sena bihurtuko da!
      `
        },
        {
            orden: 2,
            slug: 'equipo-personal',
            nombre_es: 'Armadura del Navegante: Seguridad',
            nombre_eu: 'Nabigatzailearen Armadura: Segurtasuna',
            duracion_estimada_min: 10,
            contenido_teoria_es: `
## No es Ropa, es Equipo

En el mar, el clima puede cambiar en minutos. Tu ropa es tu primera línea de defensa.

## El Chaleco Salvavidas (Tu Vida Extra)

No es opcional. Es como el cinturón de seguridad en un coche de carreras.
*   Debe estar ajustado (que no te suba a las orejas si caes al agua).
*   Debe permitirte moverte con agilidad.

## Calzado Antideslizante

Un resbalón en cubierta puede significar una caída al agua o un golpe. Usa calzado con suela de goma blanca (para no manchar) y buen agarre.

## Protección Solar

El sol se refleja en el agua y quema el doble. Gafas de sol y gorra son obligatorias si quieres conservar tu visión y evitar golpes de calor.
      `,
            contenido_teoria_eu: `
## Ez da Arropa, Ekipamendua da

Itsasoan, eguraldia minututan alda daiteke. Zure arropa defentsako lehen lerroa da.

## Salbamendu-txalekoa (Zure Bizitza Extra)

Ez da hautazkoa. Lasterketa-auto bateko segurtasun-uhala bezalakoa da.
*   Egokituta egon behar du (ez dakizkizun belarrietara igo uretara erortzen bazara).
*   Azkar mugitzeko aukera eman behar dizu.

## Irristagaitza den Oinetakoa

Bizkarrean irrist egiteak uretara erortzea edo kolpe bat hartzea ekar dezake. Erabili gomazko zola zuriko oinetakoak (ez zikintzeko) eta helduleku onarekin.

## Eguzki Babesa

Eguzkia uretan islatzen da eta bikoitza erretzen du. Eguzkitako betaurrekoak eta txanoa derrigorrezkoak dira ikusmena mantendu eta bero-kolpeak saihestu nahi badituzu.
      `
        }
    ];

    for (const unit of units) {
        const { error } = await supabase
            .from('unidades_didacticas')
            .insert({
                modulo_id: module1.id,
                ...unit
            });

        if (error) console.error(`Error inserting ${unit.slug}:`, error);
        else console.log(`✓ Inserted ${unit.slug}`);
    }
}

cleanAndRewriteModule1();
