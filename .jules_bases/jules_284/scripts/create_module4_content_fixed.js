
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

async function createModule4Units() {
    console.log('Creating units for Module 4 (Seguridad Avanzada)...');

    // 1. Get Module 4 ID
    const { data: module4, error: mError } = await supabase
        .from('modulos')
        .select('id')
        .eq('nombre_es', 'Seguridad Avanzada y Reglamento')
        .single();

    if (mError || !module4) {
        console.error('Error finding Module 4:', mError);
        return;
    }

    const units = [
        {
            nombre_es: 'Protocolo de Choque: Quién Pasa Primero',
            nombre_eu: 'Talka Protokoloa: Nor Pasatzen da Lehenengo',
            slug: 'protocolo-choque-rippa',
            // descripcion_es: No existe en tabla, mover a contenido o ignorar
            contenido_teoria_es: `
## Dominando el RIPPA

**Descripción:** Domina las reglas de preferencia de paso (RIPPA) y evita colisiones en el mar.

## El Semáforo del Mar: Babor y Estribor

En el mar no hay carriles pintados, pero hay una regla de oro basada en las luces de navegación:

*   **Estribor (Verde):** Derecha. Si ves verde, tienes preferencia. ¡Sigue adelante!
*   **Babor (Rojo):** Izquierda. Si ves rojo, debes ceder el paso. ¡Maniobra!

> **Regla Mnemotécnica:** Si un barco viene por tu derecha (estribor), tiene preferencia. Igual que en una rotonda.

## La Ley del Viento: Barlovento y Sotavento

Cuando dos veleros se encuentran y reciben el viento por el mismo lado:
*   El barco a **Sotavento** (el que está más lejos del origen del viento) tiene preferencia.
*   El barco a **Barlovento** (el que recibe el viento primero) debe maniobrar.

¿Por qué? El barco a sotavento tiene "viento sucio" y menos capacidad de maniobra.

## Jerarquía de Maniobra

No todos los barcos son iguales. El orden de preferencia general (de quién tiene más derecho a quién tiene menos) es:
1.  Barco sin gobierno (Averiado).
2.  Barco con capacidad de maniobra restringida (Trabajando).
3.  Barco dedicado a la pesca.
4.  **Barco de Vela.**
5.  Barco de Motor.

¡Sí! Como velero, tienes preferencia sobre las lanchas motoras (en general), pero debes mantenerte alejado de los grandes buques comerciales en canales angostos.
      `,
            contenido_teoria_eu: `
## RIPPA Menderatzen

**Deskribapena:** Menderatu lehentasun-arauak (RIPPA) eta saihestu itsasoko talkak.

## Itsasoko Semaforoa: Ababor eta Istribor

Itsasoan ez dago errei margoturik, baina bada nabigazio-argietan oinarritutako urrezko arau bat:

*   **Istribor (Berdea):** Eskuma. Berdea ikusten baduzu, lehentasuna duzu. Aurrera!
*   **Ababor (Gorria):** Ezkerra. Gorria ikusten baduzu, bidea eman behar duzu. Maniobratu!

> **Arau Mnemoteknikoa:** Ontzi bat zure eskuinetik badator (istribor), lehentasuna du. Biribilgune batean bezala.

## Haizearen Legea: Haizealde eta Haizebe

Bi belaontzi elkartzen direnean eta haizea alde beretik jasotzen dutenean:
*   **Haizebe**ko ontziak (haizearen jatorritik urrunen dagoenak) du lehentasuna.
*   **Haizealde**ko ontziak (haizea lehenengo jasotzen duenak) maniobratu behar du.

Zergatik? Haizebeko ontziak "haize zikina" du eta maniobratzeko gaitasun txikiagoa.

## Maniobra Hierarkia

Ontzi guztiak ez dira berdinak. Lehentasun-ordena orokorra (nork duen eskubide gehiago eta nork gutxiago) hau da:
1.  Gobernurik gabeko ontzia (Matxuratua).
2.  Maniobratzeko gaitasun mugatua duen ontzia (Lanean).
3.  Arrantzan ari den ontzia.
4.  **Belaontzia.**
5.  Motordun ontzia.

Bai! Belaontzi gisa, lehentasuna duzu motordun txalupen gainetik (orokorrean), baina merkataritza-ontzi handietatik urrun mantendu behar duzu kanal estuetan.
      `,
            duracion_estimada_min: 15,
            orden: 1
        },
        {
            nombre_es: 'Rescate Contrarreloj: ¡Hombre al Agua!',
            nombre_eu: 'Erlojupeko Erreskatea: Gizon bat Uretara!',
            slug: 'rescate-hombre-al-agua',
            contenido_teoria_es: `
## Protocolo Vital

**Descripción:** Aprende el protocolo vital para recuperar a un tripulante caído al mar.

## 1. ¡Grita y Señala!

El primer segundo es crítico. Si ves caer a alguien:
1.  Grita con todas tus fuerzas: **"¡HOMBRE AL AGUA!"**.
2.  **Nunca le quites la vista de encima**. Señálalo con el brazo extendido. Si dejas de mirar, las olas lo ocultarán en segundos.
3.  Lanza inmediatamente un aro salvavidas o cualquier objeto flotante (defensa, chaleco) hacia él.

## 2. La Maniobra del Ocho

Para volver a buscarlo, no hagas un círculo simple (perderás velocidad). Dibuja un "Ocho":
1.  Ponte a un rumbo de través/ceñida alejándote un poco.
2.  Vira y vuelve hacia la víctima con el viento bajo control.
3.  El objetivo es llegar a la víctima **parado y proa al viento**.

## 3. Recogida por Sotavento

Acércate a la víctima siempre por **Sotavento** (dejando que el barco la proteja del viento).
*   Si te acercas por barlovento, el barco podría caer sobre la cabeza del náufrago por una ola o racha de viento.
*   Para el barco completamente (velas flameando) justo al lado de la persona.
*   Súbelo por la popa o la banda más baja.
      `,
            contenido_teoria_eu: `
## Ezinbesteko Protokoloa

**Deskribapena:** Ikasi itsasora eroritako tripulatzaile bat berreskuratzeko ezinbesteko protokoloa.

## 1. Oihukatu eta Seinalatu!

Lehen segundoa kritikoa da. Norbait erortzen ikusten baduzu:
1.  Oihukatu indar guztiarekin: **"GIZONA URETARA!"**.
2.  **Inoiz ez kendu begirik gainetik**. Besoa luzatuta seinalatu. Begiratzeari uzten badiozu, olatuek segundotan ezkutatuko dute.
3.  Bota berehala salbamendu-uztai bat edo flotatzen duen edozein objektu (defentsa, txalekoa) beragana.

## 2. Zortziaren Maniobra

Bila itzultzeko, ez egin zirkulu soil bat (abiadura galduko duzu). Marraztu "Zortzi" bat:
1.  Jarri zeharkako/haize-aldeko norabidean pixka bat urrunduz.
2.  Biratu eta itzuli biktimarengana haizea kontrolpean duzula.
3.  Helburua da biktimarengana **geldituta eta branka haizera begira** iristea.

## 3. Haizebetik Jasotzea

Hurbildu biktimarengana beti **Haizebetik** (ontziak haizetik babes dezan utziz).
*   Haizealdetik hurbiltzen bazara, ontzia naufragoaren buru gainera eror daiteke olatu edo haize-bolada baten ondorioz.
*   Gelditu ontzia erabat (belak astintzen) pertsonaren ondoan.
*   Igo popatik edo banda baxuenetik.
      `,
            duracion_estimada_min: 20,
            orden: 2
        },
        {
            nombre_es: 'La Vuelta al Mundo: Adrizando el Barco',
            nombre_eu: 'Munduaren Itzulia: Ontzia Zuzentzen',
            slug: 'adrizando-el-barco',
            contenido_teoria_es: `
## Superando el Vuelco

**Descripción:** Perder el miedo al vuelco es el primer paso para dominar la vela ligera.

## No te asustes, ¡Disfruta!

En vela ligera, volcar (zozobrar) es parte de la diversión y del aprendizaje. Si no vuelcas nunca, es que no estás probando los límites.

## Evitar la "Tortuga"

Cuando el barco vuelca, queda flotando de lado.
*   **Prioridad #1:** Evitar que se invierta totalmente (el mástil hacia abajo, o "hacer tortuga").
*   Para ello, nada rápidamente hacia la orza y súbete a ella. Tu peso evitará que el barco siga girando.

## La Palanca Humana

Para adrizar (enderezar) el barco:
1.  Comprueba que la escota de la mayor no esté cazada a tope (suéltala un poco).
2.  Súbete de pie sobre la orza.
3.  Agárrate a la regala (borde del barco) o al cabo de adrizamiento.
4.  Echate hacia atrás haciendo contrapeso. ¡El barco subirá solo!

> **Consejo Pro:** Súbete al barco por la banda (lateral) en cuanto se enderece, ¡o volverás a volcar hacia el otro lado!
      `,
            contenido_teoria_eu: `
## Iraultzea Gainditzen

**Deskribapena:** Iraultzearen beldurra galtzea bela arina menderatzeko lehen urratsa da.

## Ez izutu, Gozatu!

Bela arinean, iraultzea (zozobratzea) dibertsioaren eta ikaskuntzaren parte da. Inoiz iraultzen ez bazara, mugak probatzen ari ez zarelako da.

## "Dordoka" Saihestu

Ontzia iraultzen denean, alboz flotatzen geratzen da.
*   **1. Lehentasuna:** Erabat itzuli ez dadin saihestea (masta beherantz, edo "dordoka egitea").
*   Horretarako, igeri egin azkar orzarantz eta igo gainera. Zure pisuak ontziak biratzen jarraitzea eragotziko du.

## Giza Palanka

Ontzia zuzentzeko (adrizatzeko):
1.  Egiaztatu nagusiaren eskota ez dagoela toperaino ehizatuta (askatu pixka bat).
2.  Igo zutik orzaren gainera.
3.  Heldud regalari (ontzi-ertzari) edo adrizatze-kabuari.
4.  Bota atzerantz kontrapisua eginez. Ontzia bakarrik igoko da!

> **Pro Aholkua:** Igo ontzira bandatik (albotik) zuzendu bezain laster, bestela berriro irauliko zara beste alderantz!
      `,
            duracion_estimada_min: 15,
            orden: 3
        },
        {
            nombre_es: 'Nudos que Salvan Vidas',
            nombre_eu: 'Bizitzak Salbatzen dituzten Korapiloak',
            slug: 'nudos-esenciales',
            contenido_teoria_es: `
## Cabuyería Esencial

**Descripción:** Tres nudos esenciales que todo buen marinero debe poder hacer con los ojos cerrados.

## 1. As de Guía (Bowline) - El Rey

Es el nudo marinero por excelencia.
*   **Uso:** Para hacer una gaza fija que no se corre (no ahorca). Ideal para atar drizas o escotas.
*   **Ventaja:** Por mucha tensión que soporte, nunca se azoca (se aprieta tanto que no se puede soltar). Siempre es fácil de deshacer.
*   **Historia:** "La serpiente sale del lago, rodea el árbol y vuelve a entrar al lago".

## 2. Ballestrinque (Clove Hitch) - El Rápido

*   **Uso:** Para amarrar defensas a los guardamancebos o atar el barco temporalmente a un poste/bitácora.
*   **Precaución:** Puede soltarse si no tiene tensión constante.

## 3. Nudo Llano (Reef Knot) - La Unión

*   **Uso:** Para unir dos cabos del mismo grosor (mena). Típico para rizar velas (reducir trapo).
*   **Error Común:** No confundir con el "nudo de la abuela", que se deshace solo. El llano es simétrico y plano.
      `,
            contenido_teoria_eu: `
## Ezinbesteko Kabuyeria

**Deskribapena:** Itsasgizon on orok begiak itxita egin behar dituen funtsezko hiru korapilo.

## 1. Gidariaren Bekaizkeria (Bowline) - Erregea

Itsas korapilo nagusia da.
*   **Erabilera:** Lasterketa egiten ez duen begizta finko bat egiteko (ez du itotzen). Driza edo eskotak lotzeko aproposa.
*   **Abantaila:** Tentsio handia jasan arren, inoiz ez da estutzen (ezin da askatu). Beti da askatzeko erraza.
*   **Istorioa:** "Sugea lakutik ateratzen da, zuhaitza inguratzen du eta berriro lakuan sartzen da".

## 2. Ballestrinque (Clove Hitch) - Azkarra

*   **Erabilera:** Defentsak guardamanceboetara lotzeko edo ontzia aldi baterako zutoin/bitakora batera lotzeko.
*   **Kontuz:** Aska daiteke tentsio konstantea ez badu.

## 3. Korapilo Laua (Reef Knot) - Batasuna

*   **Erabilera:** Lodiera (mena) bereko bi kabo lotzeko. Ohikoa belak kizkurtzeko (trapua murriztea).
*   **Akats Ohikoa:** Ez nahastu "amona korapiloarekin", bera bakarrik askatzen baita. Laua simetrikoa eta laua da.
      `,
            duracion_estimada_min: 15,
            orden: 4
        }
    ];

    for (const unit of units) {
        const { error } = await supabase
            .from('unidades_didacticas')
            .upsert({
                modulo_id: module4.id,
                ...unit
            }, { onConflict: 'modulo_id, slug' }); // Handling duplicates

        if (error) {
            console.error(`Error creating unit ${unit.nombre_es}:`, error);
        } else {
            console.log(`✓ Created unit: ${unit.nombre_es}`);
        }
    }
}

createModule4Units();
