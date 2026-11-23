// Screenshot helper for the experiment QA loop.
// Usage: node scripts/shot.mjs <path> <outfile> [width] [height] [dark] [full]
import { chromium } from 'playwright';

const [
	path = '/experiments/everywhere',
	out = 'shots/page.png',
	width = '1440',
	height = '1100',
	dark = '',
	full = '',
] = process.argv.slice(2);

const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: Number(width), height: Number(height) },
	deviceScaleFactor: 2,
});
await page.route('**unpkg.com/react-scan**', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
await page.addInitScript(() => localStorage.setItem('portfolio-pet:v1', JSON.stringify({ animal: 'none', color: 'brown' })));
if (dark === 'dark') {
	await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
}
const errors = [];
page.on('console', (msg) => {
	if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', (err) => errors.push(String(err)));
await page.goto(`http://localhost:4331${path}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
await page.addStyleTag({
	content: 'agentation-toolbar, astro-dev-toolbar, #react-scan-root { display: none !important; }',
});
await page.evaluate(() => {
	document.querySelectorAll('astro-dev-toolbar, agentation-toolbar, #react-scan-root, #blur-stack').forEach((el) => el.remove());
});
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2200);
await page.evaluate(() => {
	document.querySelectorAll('astro-dev-toolbar, agentation-toolbar, #react-scan-root, #blur-stack').forEach((el) => el.remove());
});
await page.screenshot({ path: out, fullPage: full === 'full' });
if (errors.length) console.log(`CONSOLE ERRORS\n${errors.join('\n')}`);
console.log(`saved ${out}`);
await browser.close();
