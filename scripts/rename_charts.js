const fs = require('fs');
const path = require('path');

const dir = 'public/images/academy/ChartPlotterMap';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));

files.forEach((file, index) => {
    const oldPath = path.join(dir, file);
    const newPath = path.join(dir, `Chart${index + 1}.png`);
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${file} -> Chart${index + 1}.png`);
});
