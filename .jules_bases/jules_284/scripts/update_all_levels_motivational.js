
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

const updates = [
    {
        slug: 'perfeccionamiento',
        es: "Eleva tu técnica al siguiente nivel. Aprende a dominar el trimado fino, navega con autonomía total y consigue tu distintivo de 'Navegante Autónomo'.",
        eu: "Zure teknika hurrengo mailara igo. Trimatu fin menderatzen ikasi, autonomia osoz nabigatu eta lortu zure 'Nabigatzaile Autonomoa' bereizgarria."
    },
    {
        slug: 'vela-ligera',
        es: "Siente la velocidad y la adrenalina. Domina embarcaciones ágiles, perfecciona tus trasluchadas y desbloquea el rango de 'Regatista de Élite'.",
        eu: "Abiadura eta adrenalina sentitu. Ontzi arinak menderatu, zure trasluchadak hobetu eta 'Eliteko Estropadalari' maila desblokeatu."
    },
    {
        slug: 'crucero',
        es: "El horizonte es tu límite. Aprende a planificar travesías, vivir a bordo y liderar tripulaciones como un auténtico 'Patrón de Travesía'.",
        eu: "Horizontea da zure muga. Zeharkaldiak planifikatzen ikasi, ontzian bizitzen eta eskifaia zuzentzen 'Zeharkaldi-Patroi' gisa."
    },
    {
        slug: 'maniobras-avanzadas',
        es: "Conviértete en un maestro de la maniobra. Navega en condiciones extremas, domina el atraque perfecto y gana el título de 'Domador de Mares'.",
        eu: "Manobra maisu bihurtu. Muturreko baldintzetan nabigatu, atrakatze perfektua menderatu eta 'Itsasoen Domatzaile' titulua irabazi."
    },
    {
        slug: 'seguridad-emergencias',
        es: "Ante la duda, seguridad. Prepárate para cualquier imprevisto, domina el rescate y conviértete en el 'Guardián del Mar' de tu embarcación.",
        eu: "Zalantzarik izanez gero, segurtasuna. Edozein ezustekotarako prestatu, erreskateak menderatu eta zure ontziko 'Itsasoko Zaindari' bihurtu."
    },
    {
        slug: 'meteorologia',
        es: "Lee el cielo, domina el viento. Anticipa tormentas, aprovecha cada racha y alcanza el conocimiento supremo como 'Señor del Viento'.",
        eu: "Zerua irakurri, haizea menderatu. Ekaitzak aurreikusi, haize-bolada bakoitza aprobetxatu eta 'Haizearen Jaun' ezagutza gorena lortu."
    }
];

async function updateLevels() {
    console.log('Updating all academy levels with motivational descriptions...');

    for (const update of updates) {
        const { error } = await supabase
            .from('niveles_formacion')
            .update({
                descripcion_es: update.es,
                descripcion_eu: update.eu
            })
            .eq('slug', update.slug);

        if (error) {
            console.error(`Error updating ${update.slug}:`, error);
        } else {
            console.log(`✓ Updated ${update.slug}`);
        }
    }

    console.log('All levels updated successfully!');
}

updateLevels();
