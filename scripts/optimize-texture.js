const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = ['bg-texture-maps.png', 'bg-texture-waves.png'];

async function optimize() {
    for (const img of images) {
        const inputPath = path.join(process.cwd(), 'public', 'images', img);
        const outputPath = path.join(process.cwd(), 'public', 'images', img.replace('.png', '.webp'));

        if (!fs.existsSync(inputPath)) {
            console.log(`File not found: ${inputPath}`);
            continue;
        }

        try {
            console.log(`Optimizing ${img}...`);
            await sharp(inputPath)
                .webp({ quality: 20 })
                .toFile(outputPath);

            const oldSize = fs.statSync(inputPath).size;
            const newSize = fs.statSync(outputPath).size;
            console.log(`Optimization of ${img} complete!`);
            console.log(`Old size: ${(oldSize / 1024).toFixed(2)} KB`);
            console.log(`New size: ${(newSize / 1024).toFixed(2)} KB`);
            console.log(`Reduction: ${((1 - newSize / oldSize) * 100).toFixed(2)}%`);
        } catch (err) {
            console.error(`Error optimizing ${img}:`, err);
        }
    }
}

optimize();
