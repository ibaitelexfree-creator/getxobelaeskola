import { GoogleGenerativeAI } from '@google/generative-ai';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

// Helper to handle process args
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help')) {
  console.log(chalk.bold('Tribunal de Código: Debate de Seguridad (CLI)'));
  console.log('Uso: npm run debate:security -- <ruta_archivo>');
  console.log('Ejemplo: npm run debate:security -- src/lib/auth.ts');
  process.exit(0);
}

const filePath = args[0];
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(chalk.red('Error: GEMINI_API_KEY no está configurada en las variables de entorno.'));
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(chalk.red(`Error: No se encontró el archivo en ${filePath}`));
  process.exit(1);
}

const fileContent = fs.readFileSync(filePath, 'utf-8');
const fileName = path.basename(filePath);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey);
// Use a fast model for the debate to be snappy
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const model = genAI.getGenerativeModel({ model: modelName });

console.log(chalk.bold.bgBlue.white(` 🏛️  TRIBUNAL DE CÓDIGO: INICIANDO SESIÓN `));
console.log(chalk.gray(`Objetivo: ${fileName}`));
console.log(chalk.gray(`Modelo: ${modelName}`));
console.log('');

async function runDebate() {
  try {
    // --- ROUND 1: RED TEAM (ATTACKER) ---
    console.log(chalk.bold.red('🔥 RED TEAM (FISCALÍA) ESTÁ ANALIZANDO...'));

    const redTeamPrompt = `
      Eres un Investigador de Seguridad de élite (Red Team) y un Fiscal de Código implacable.
      Tu trabajo es auditar el siguiente archivo de código: "${fileName}".

      Tareas:
      1. Identificar POTENCIALES vulnerabilidades de seguridad (OWASP Top 10, fallos lógicos, problemas de autenticación, secretos expuestos, etc.).
      2. Sé agresivo pero técnico. No te contengas.
      3. Genera una lista de "Cargos" (Vulnerabilidades).
      4. Si el código parece seguro, indaga más profundo en casos borde o malas prácticas.

      Código a analizar:
      \`\`\`
      ${fileContent}
      \`\`\`

      Responde EXCLUSIVAMENTE EN ESPAÑOL.
      Formatea tu respuesta como una lista numerada de vulnerabilidades con su severidad (ALTA/MEDIA/BAJA).
    `;

    const redResponse = await model.generateContent(redTeamPrompt);
    const redOutput = redResponse.response.text();

    console.log(chalk.red(redOutput));
    console.log('');

    // --- ROUND 2: BLUE TEAM (DEFENDER) ---
    console.log(chalk.bold.blue('🛡️  BLUE TEAM (DEFENSA) ESTÁ RESPONDIENDO...'));

    const blueTeamPrompt = `
      Eres un Ingeniero de Seguridad Senior (Blue Team) y Abogado Defensor.
      Has recibido el siguiente reporte de vulnerabilidades del Red Team sobre el archivo "${fileName}".

      Tareas:
      1. Revisa cada afirmación hecha por el Red Team.
      2. Admite las vulnerabilidades válidas y propón correcciones concretas (snippets de código).
      3. Refuta los falsos positivos o afirmaciones exageradas explicando el contexto o las mitigaciones existentes (si son visibles).
      4. Mantén un tono profesional y constructivo.

      Reporte del Red Team:
      ${redOutput}

      Contexto del Código:
      \`\`\`
      ${fileContent}
      \`\`\`

      Responde EXCLUSIVAMENTE EN ESPAÑOL.
    `;

    const blueResponse = await model.generateContent(blueTeamPrompt);
    const blueOutput = blueResponse.response.text();

    console.log(chalk.blue(blueOutput));
    console.log('');

    // --- ROUND 3: JUDGE (VERDICT) ---
    console.log(chalk.bold.yellow('⚖️  JUEZ (CISO) ESTÁ DELIBERANDO...'));

    const judgePrompt = `
      Eres el Director de Seguridad de la Información (CISO) y el Juez que preside este tribunal.
      Has escuchado a la Fiscalía (Red Team) y a la Defensa (Blue Team).

      Tareas:
      1. Resume los riesgos de seguridad confirmados.
      2. Descarta las afirmaciones invalidadas.
      3. Asigna una "Puntuación de Seguridad" al código (0 = Crítico/Inseguro, 100 = Perfecto/Seguro).
      4. Lista las ACCIONES REQUERIDAS para el desarrollador.

      Argumento del Red Team:
      ${redOutput}

      Argumento del Blue Team:
      ${blueOutput}

      Responde EXCLUSIVAMENTE EN ESPAÑOL.
    `;

    const judgeResponse = await model.generateContent(judgePrompt);
    const judgeOutput = judgeResponse.response.text();

    console.log(chalk.yellow(judgeOutput));
    console.log('');
    console.log(chalk.bold.bgGreen.black(' ✅ TRIBUNAL FINALIZADO '));

  } catch (error) {
    console.error(chalk.bgRed.white(' ERROR FATAL DURANTE EL DEBATE '));
    console.error(error);
    process.exit(1);
  }
}

runDebate();
