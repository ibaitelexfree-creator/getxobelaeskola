import dotenv from 'dotenv';
dotenv.config();
const keys = [process.env.JULES_API_KEY, process.env.JULES_API_KEY_2, process.env.JULES_API_KEY_3];
keys.forEach((k, i) => {
    if (k) {
        console.log(`Key ${i + 1}: ${k.substring(0, 4)}...`);
    } else {
        console.log(`Key ${i + 1}: MISSING`);
    }
});
