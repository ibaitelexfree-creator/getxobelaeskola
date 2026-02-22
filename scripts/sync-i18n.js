const fs = require('fs');
const path = require('path');

const esPath = path.join(__dirname, '../messages/es.json');
const euPath = path.join(__dirname, '../messages/eu.json');

try {
    if (!fs.existsSync(esPath)) {
        console.error(`Error: Source file not found at ${esPath}`);
        process.exit(1);
    }
    if (!fs.existsSync(euPath)) {
        console.error(`Error: Target file not found at ${euPath}`);
        process.exit(1);
    }

    const esContent = fs.readFileSync(esPath, 'utf8');
    const euContent = fs.readFileSync(euPath, 'utf8');

    const es = JSON.parse(esContent);
    const eu = JSON.parse(euContent);

    function sync(source, target) {
        let changed = false;

        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                const sourceValue = source[key];
                const targetValue = target[key];

                if (typeof sourceValue === 'object' && sourceValue !== null) {
                    // Source is object
                    if (targetValue === undefined || typeof targetValue !== 'object' || targetValue === null) {
                        // Target missing or not object, initialize as empty object
                        target[key] = {};
                        changed = true;
                    }
                    // Recurse
                    if (sync(sourceValue, target[key])) {
                        changed = true;
                    }
                } else {
                    // Source is primitive (string, etc.)
                    if (targetValue === undefined) {
                        target[key] = `[TODO: EU] ${sourceValue}`;
                        console.log(`Added missing key: ${key}`);
                        changed = true;
                    }
                }
            }
        }
        return changed;
    }

    if (sync(es, eu)) {
        fs.writeFileSync(euPath, JSON.stringify(eu, null, 2), 'utf8');
        console.log('Successfully synchronized eu.json with es.json.');
    } else {
        console.log('No changes needed for eu.json.');
    }

} catch (error) {
    console.error('Error synchronizing translation files:', error);
    process.exit(1);
}
