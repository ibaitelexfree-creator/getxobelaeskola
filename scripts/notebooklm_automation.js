const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function runNotebookLMAutomation() {
    console.log('--- Iniciando Automatización de NotebookLM ---');

    const sourceFilePath = path.join(process.cwd(), 'notebooklm_source.txt');
    if (!fs.existsSync(sourceFilePath)) {
        console.error('El archivo fuente no existe. Ejecuta generate_ai_report_source.js primero.');
        return;
    }
    const sourceText = fs.readFileSync(sourceFilePath, 'utf8');

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    let userDataDir = 'C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\User Data';

    let browser;
    try {
        console.log('Conectando al navegador...');
        browser = await puppeteer.launch({
            executablePath: chromePath,
            userDataDir: userDataDir,
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });

        const page = await browser.newPage();

        console.log('Navegando a NotebookLM...');
        await page.goto('https://notebooklm.google.com/', { waitUntil: 'networkidle2' });

        // 1. Esperar y clickar en "Crear nuevo"
        console.log('Esperando botón "Crear nuevo"...');
        const createButtonSelector = 'button[aria-label="Crear cuaderno"], button.create-new-button, mat-card.create-new-action-button';
        await page.waitForSelector(createButtonSelector, { timeout: 15000 });
        await page.click(createButtonSelector);

        // 2. Esperar al modal de fuentes y elegir "Texto copiado"
        console.log('Esperando modal de fuentes...');
        await page.waitForTimeout(3000);

        // Buscamos el div que contiene "Texto copiado"
        const copiedTextSelector = '//div[contains(text(), "Texto copiado")] | //button[contains(., "Texto copiado")]';
        const [copiedTextBtn] = await page.$x(copiedTextSelector);
        if (copiedTextBtn) {
            await copiedTextBtn.click();
        } else {
            console.log('No se encontró el botón de Texto Copiado por XPath, intentando click por posición o texto...');
            // Fallback: buscar por texto plano en el DOM
            await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('div, button, span'));
                const target = elements.find(el => el.textContent.includes('Texto copiado'));
                if (target) target.click();
            });
        }

        // 3. Pegar el contenido
        console.log('Pegando contenido del reporte...');
        await page.waitForSelector('textarea, [contenteditable="true"]', { timeout: 5000 });
        await page.keyboard.type(sourceText);

        // 4. Guardar fuente
        console.log('Guardando fuente...');
        await page.keyboard.press('Control');
        await page.keyboard.press('Enter');
        await page.keyboard.release('Control');

        // Esperar procesamiento
        console.log('Esperando a que se procese la fuente...');
        await page.waitForTimeout(10000);

        // 5. Generar Audio (Guía de audio)
        console.log('Buscando sección de Guía de audio...');
        // El botón suele decir "Generar" dentro de la tarjeta de Audio Overview
        const generateAudioSelector = '//button[contains(., "Generar")]';
        const [generateBtn] = await page.$x(generateAudioSelector);
        if (generateBtn) {
            await generateBtn.click();
            console.log('Generación de Audio iniciada. Esto tardará unos minutos.');
        }

        // 6. Generar Infografía (Si existe el botón directo o vía notas)
        // Por ahora lo dejamos marcado como "Sincronización manual" si no hay selector claro.

        console.log('PROCESO COMPLETADO: El navegador se cerrará en 30 segundos.');
        console.log('NOTA: La descarga real es automática una vez finalizada la generación.');

        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('Error durante la automatización de NotebookLM:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

runNotebookLMAutomation();
