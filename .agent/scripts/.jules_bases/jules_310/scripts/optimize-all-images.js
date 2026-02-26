const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicImagesDir = path.join(process.cwd(), 'public', 'images');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

async function optimizeAll() {
    const allFiles = getAllFiles(publicImagesDir);
    const heavyImages = allFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        const size = fs.statSync(file).size;
        return (ext === '.png' || ext === '.jpg' || ext === '.jpeg') && size > 300 * 1024; // > 300KB
    });

    console.log(`Found ${heavyImages.length} heavy images to optimize.`);

    for (const file of heavyImages) {
        const ext = path.extname(file);
        const outputPath = file.replace(ext, '.webp');

        try {
            console.log(`Optimizing ${path.basename(file)}...`);
            await sharp(file)
                .webp({ quality: 60 })
                .toFile(outputPath);

            const oldSize = fs.statSync(file).size;
            const newSize = fs.statSync(outputPath).size;
            console.log(`  Done: ${path.basename(file)} -> ${path.basename(outputPath)}`);
            console.log(`  Size: ${(oldSize / 1024).toFixed(0)}KB -> ${(newSize / 1024).toFixed(0)}KB (${((1 - newSize / oldSize) * 100).toFixed(1)}% reduction)`);
        } catch (err) {
            console.error(`Error optimizing ${file}:`, err);
        }
    }
}

optimizeAll();
