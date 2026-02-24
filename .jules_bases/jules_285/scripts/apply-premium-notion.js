
const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const UPGRADES = [
    {
        id: "30c31210b1a181b78d48ddc2e257759d", // Profiles
        title: "👤 Perfiles (Alumnos/Staff)",
        icon: "👤",
        cover: "https://images.unsplash.com/photo-1518837691462-801576b40292"
    },
    {
        id: "30c31210b1a18146bcb7c64bef1faff3", // Fleet
        title: "⛵ Flota (Embarcaciones)",
        icon: "⛵",
        cover: "https://images.unsplash.com/photo-1544436488-87581752f922"
    },
    {
        id: "30c31210b1a1810ead47caadf5a1e7a3", // Reservations
        title: "📅 Calendario de Reservas",
        icon: "📅",
        cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
    },
    {
        id: "30c31210b1a1814f81fdfb8594ffd81e", // Courses
        title: "🎓 Catálogo de Cursos",
        icon: "🎓",
        cover: "https://images.unsplash.com/photo-1589519160732-57fc498494f8"
    }
];

async function upgrade() {
    for (const item of UPGRADES) {
        console.log(`Upgrading ${item.title}...`);
        try {
            // First, try to Unarchive
            try {
                await notion.pages.update({
                    page_id: item.id,
                    archived: false
                });
                console.log(`  Unarchived ${item.id}`);
            } catch (unarchiveErr) {
                console.log(`  Unarchive attempt: ${unarchiveErr.message}`);
            }

            // Update Title
            await notion.databases.update({
                database_id: item.id,
                title: [{ text: { content: item.title } }],
            });

            // Update Icon & Cover
            await notion.pages.update({
                page_id: item.id,
                icon: { type: "emoji", emoji: item.icon },
                cover: { type: "external", external: { url: item.cover } }
            });
            console.log(`✅ ${item.title} upgraded.`);
        } catch (e) {
            console.error(`❌ Failed to upgrade ${item.title}: ${e.message}`);
        }
    }
}

upgrade();
