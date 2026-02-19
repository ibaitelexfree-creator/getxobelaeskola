const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesToOptimize = [
    'public/images/bg-texture-maps.png',
    'public/images/Chart3.png',
    'public/images/Chart8.png',
    'public/images/Chart16.png',
    'public/images/Chart5.png',
    'public/images/rank-badge-capitan.png',
    'public/images/J80.png',
    'public/images/rank-badge-grumete.png',
    'public/images/wind-lab-dashboard.png',
    'public/images/feedback-success-confetti.png'
];

async function optimize() {
    console.log('--- Starting Image Optimization ---');

    for (const imgPath of imagesToOptimize) {
        const absolutePath = path.resolve(process.cwd(), imgPath);
        if (!fs.existsSync(absolutePath)) {
            console.warn(`[Skip] File not found: ${imgPath}`);
            continue;
        }

        const webpPath = absolutePath.replace(/\.png$/, '.webp');

        try {
            const statsBefore = fs.statSync(absolutePath);
            await sharp(absolutePath)
                .webp({ quality: 80, effort: 6 })
                .toFile(webpPath);

            const statsAfter = fs.statSync(webpPath);
            const reduction = ((statsBefore.size - statsAfter.size) / statsBefore.size * 100).toFixed(2);

            console.log(`[Done] ${imgPath} -> ${path.basename(webpPath)}`);
            console.log(`       Size: ${(statsBefore.size / 1024 / 1024).toFixed(2)}MB -> ${(statsAfter.size / 1024 / 1024).toFixed(2)}MB (-${reduction}%)`);

            // Note: We keep the original for now to avoid breaking imports immediately, 
            // but the goal is to shift the code to use webp.
        } catch (err) {
            console.error(`[Error] Failed to optimize ${imgPath}:`, err.message);
        }
    }

    console.log('--- Optimization Finished ---');
}

optimize();
