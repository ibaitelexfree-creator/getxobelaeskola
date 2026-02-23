const fs = require('fs');
const path = require('path');

const ES_PATH = path.join(__dirname, '../messages/es.json');
const EU_PATH = path.join(__dirname, '../messages/eu.json');

function loadJSON(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    }
    return {};
  } catch (err) {
    console.error(`Error reading ${filepath}:`, err);
    process.exit(1);
  }
}

function syncObjects(source, target) {
  // Handle Arrays
  if (Array.isArray(source)) {
    const resultArr = [];
    const targetIsArray = Array.isArray(target);

    // Sync indices present in source
    for (let i = 0; i < source.length; i++) {
      const sourceValue = source[i];
      const targetValue = targetIsArray ? target[i] : undefined;

      if (typeof sourceValue === 'object' && sourceValue !== null) {
        // Recurse
        resultArr[i] = syncObjects(sourceValue, targetValue);
      } else {
        // Leaf
        if (targetValue !== undefined) {
          resultArr[i] = targetValue;
        } else {
          resultArr[i] = `[TODO: EU] ${sourceValue}`;
        }
      }
    }

    // Preserve extra items from target
    if (targetIsArray && target.length > source.length) {
      for (let i = source.length; i < target.length; i++) {
        resultArr[i] = target[i];
      }
    }
    return resultArr;
  }

  // Handle Objects
  const result = {};

  // 1. Process keys present in Source (to maintain Source order)
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = target ? target[key] : undefined;

      if (typeof sourceValue === 'object' && sourceValue !== null) {
        // Recursive step for nested objects
        const targetObj = (typeof targetValue === 'object' && targetValue !== null) ? targetValue : {};
        result[key] = syncObjects(sourceValue, targetObj);
      } else {
        // Leaf node
        if (targetValue !== undefined) {
          result[key] = targetValue;
        } else {
          result[key] = `[TODO: EU] ${sourceValue}`;
        }
      }
    }
  }

  // 2. Process keys present in Target but NOT in Source (preserve extra keys)
  if (target && typeof target === 'object' && !Array.isArray(target)) {
    for (const key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        if (!Object.prototype.hasOwnProperty.call(result, key)) {
          result[key] = target[key];
        }
      }
    }
  }

  return result;
}

try {
  console.log('Reading files...');
  const es = loadJSON(ES_PATH);
  const eu = loadJSON(EU_PATH);

  console.log('Syncing keys...');
  const syncedEu = syncObjects(es, eu);

  console.log('Writing output...');
  fs.writeFileSync(EU_PATH, JSON.stringify(syncedEu, null, 2) + '\n', 'utf8');

  console.log('Successfully synced messages/eu.json with messages/es.json');
} catch (error) {
  console.error('An error occurred:', error);
  process.exit(1);
}
