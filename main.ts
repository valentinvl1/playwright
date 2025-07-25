import express, { Request, Response } from 'express';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import 'dotenv/config';

// Add stealth plugin - this uses the actual puppeteer stealth plugin!
chromium.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000; // 'process' est global en Node.js

app.get('/search', async (req: Request, res: Response) => {
    const query = req.query.q || '';
    let browser;
    try {
        browser = await chromium.launch({
            headless: true,
            proxy: {
                server: process.env.PROXY_SERVER,
                username: process.env.PROXY_USERNAME,
                password: process.env.PROXY_PASSWORD
            },
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled'
            ]
        });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1366, height: 768 }
        });
        const page = await context.newPage();
        // Exemple : utiliser la query pour faire une recherche sur Google
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(String(query))}`, { waitUntil: 'load' });
        const title = await page.title();
        // On peut extraire d'autres infos si besoin
        res.json({
            success: true,
            title,
            url: page.url(),
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.get('/', (req: Request, res: Response) => {
    res.send('API Playwright en ligne. Utilisez /search?q=...');
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});
