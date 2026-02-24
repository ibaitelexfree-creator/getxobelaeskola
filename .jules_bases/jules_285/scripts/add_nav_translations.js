/**
 * Add dropdown nav translation keys to all locale files
 */
const fs = require('fs');
const path = require('path');

const newKeys = {
    es: {
        // Dropdown labels
        kids: 'Infantiles',
        adults: 'Adultos',
        windsurf: 'Windsurf',
        sailboats: 'Veleros',
        kayak_paddle: 'Kayak & Paddle',
        mooring: 'Atraques',
        membership: 'Socias',
        events: 'Eventos',
        // Subcategory items
        summer_camp: 'Campus de Verano',
        adult_initiation: 'Iniciación Adultos',
        adult_advanced: 'Tecnificación',
        windsurf_courses: 'Cursos Windsurf',
        sailboat_rental: 'Alquiler Veleros',
        small_craft_rental: 'Kayak / Paddle / Piragua',
        birthdays: 'Cumpleaños',
        bonos: 'Bonos',
        space_rental: 'Alquiler Espacio',
        all_courses: 'Todos los cursos',
        all_rentals: 'Todos los alquileres',
    },
    eu: {
        kids: 'Haurrentzako',
        adults: 'Helduentzako',
        windsurf: 'Windsurf',
        sailboats: 'Bela Ontziak',
        kayak_paddle: 'Kayak & Paddle',
        mooring: 'Atrakatzeak',
        membership: 'Bazkideak',
        events: 'Ekitaldiak',
        summer_camp: 'Udako Campusa',
        adult_initiation: 'Helduentzako Hasiera',
        adult_advanced: 'Teknifikazioa',
        windsurf_courses: 'Windsurf Ikastaroak',
        sailboat_rental: 'Bela Ontzi Alokairua',
        small_craft_rental: 'Kayak / Paddle / Piragua',
        birthdays: 'Urtebetetzeak',
        bonos: 'Bonuak',
        space_rental: 'Espazio Alokairua',
        all_courses: 'Ikastaro guztiak',
        all_rentals: 'Alokairua guztiak',
    },
    en: {
        kids: 'Kids',
        adults: 'Adults',
        windsurf: 'Windsurf',
        sailboats: 'Sailboats',
        kayak_paddle: 'Kayak & Paddle',
        mooring: 'Mooring',
        membership: 'Membership',
        events: 'Events',
        summer_camp: 'Summer Camp',
        adult_initiation: 'Adult Beginner',
        adult_advanced: 'Advanced',
        windsurf_courses: 'Windsurf Courses',
        sailboat_rental: 'Sailboat Rental',
        small_craft_rental: 'Kayak / Paddle / Canoe',
        birthdays: 'Birthdays',
        bonos: 'Packs',
        space_rental: 'Space Rental',
        all_courses: 'All Courses',
        all_rentals: 'All Rentals',
    },
    fr: {
        kids: 'Enfants',
        adults: 'Adultes',
        windsurf: 'Windsurf',
        sailboats: 'Voiliers',
        kayak_paddle: 'Kayak & Paddle',
        mooring: 'Mouillage',
        membership: 'Adhésion',
        events: 'Événements',
        summer_camp: 'Camp d\'été',
        adult_initiation: 'Initiation Adultes',
        adult_advanced: 'Perfectionnement',
        windsurf_courses: 'Cours Windsurf',
        sailboat_rental: 'Location Voiliers',
        small_craft_rental: 'Kayak / Paddle / Pirogue',
        birthdays: 'Anniversaires',
        bonos: 'Forfaits',
        space_rental: 'Location Espace',
        all_courses: 'Tous les cours',
        all_rentals: 'Toutes les locations',
    },
};

const locales = ['es', 'eu', 'en', 'fr'];

for (const loc of locales) {
    const filePath = path.join('messages', loc + '.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!data.nav) data.nav = {};

    Object.assign(data.nav, newKeys[loc]);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log('Updated ' + loc + '.json nav keys: ' + Object.keys(newKeys[loc]).length + ' new keys');
}

console.log('\nDone!');
