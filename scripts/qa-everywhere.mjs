// End-to-end interaction check for the passport experiment.
// Usage: node scripts/qa-everywhere.mjs
import { chromium } from 'playwright';

const base = process.env.PASSPORT_URL ?? 'http://127.0.0.1:4072';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2 });
const errors = [];
page.on('console', (msg) => {
	if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', (err) => errors.push(String(err)));
await page.route('**unpkg.com/react-scan**', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
await page.addInitScript(() => localStorage.setItem('portfolio-pet:v1', JSON.stringify({ animal: 'none', color: 'brown' })));

await page.goto(`${base}/experiments/everywhere`, {
	waitUntil: 'domcontentloaded',
	timeout: 60_000,
});
await page.addStyleTag({ content: 'agentation-toolbar, astro-dev-toolbar { display: none !important; }' });
await page.evaluate(() => {
	document.querySelectorAll('astro-dev-toolbar, agentation-toolbar, #react-scan-root, #blur-stack').forEach((el) => el.remove());
});
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2200);

const check = async (name, condition, detail = '') => {
	console.log(`${condition ? 'PASS' : 'FAIL'} ${name}${detail ? `: ${detail}` : ''}`);
	if (!condition) process.exitCode = 1;
};

check('page renders', await page.locator('.passport-page').isVisible());
check('seven opening stamps', (await page.locator('.passport-stamp-slot').count()) === 7);
await page.evaluate(() => {
	document.querySelectorAll('astro-dev-toolbar, agentation-toolbar, #react-scan-root, #blur-stack').forEach((el) => el.remove());
});
await page.screenshot({ path: 'shots/qa/everywhere-initial.png', fullPage: true });

await page.locator('.passport-stamp-hit').first().click();
await page.waitForTimeout(200);
check('clicking a stamp selects it', (await page.locator('.passport-stamp-slot.is-selected').count()) === 1);
check(
	'selected stamp shows a remove control',
	await page.locator('.passport-stamp-remove').isVisible()
);
await page.keyboard.press('Escape');
await page.waitForTimeout(150);
check('escape clears the selection', (await page.locator('.passport-stamp-slot.is-selected').count()) === 0);

await page.locator('.passport-add').click();
await page.waitForTimeout(350);
const items = await page.locator('.passport-command-item').count();
check('selector lists all 197 countries', items === 197, String(items));
await page.locator('.passport-command-input').fill('uk');
await page.waitForTimeout(250);
const ukFirst = await page.locator('.passport-command-item').first().innerText();
check('UK search finds the United Kingdom first', ukFirst.includes('United Kingdom'), ukFirst.split('\n')[0]);
await page.locator('.passport-command-input').fill('Iceland');
await page.waitForTimeout(250);
await page.evaluate(() => {
	document.querySelectorAll('astro-dev-toolbar, agentation-toolbar, #react-scan-root, #blur-stack').forEach((el) => el.remove());
});
await page.screenshot({ path: 'shots/qa/everywhere-picker.png' });
await page.keyboard.press('Enter');
await page.waitForTimeout(900);
check('iceland stamp added', (await page.locator('.passport-stamp-slot').count()) === 8);
check('iceland row present', await page.locator('.passport-selected-row', { hasText: 'Iceland' }).isVisible());
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

const first = page.locator('.passport-stamp-slot').first();
const before = await first.evaluate((el) => el.getAttribute('style'));
const beforeBox = await first.boundingBox();
if (beforeBox) {
	await page.mouse.move(beforeBox.x + beforeBox.width / 2, beforeBox.y + beforeBox.height / 2);
	await page.mouse.down();
	await page.mouse.move(beforeBox.x + beforeBox.width / 2 + 56, beforeBox.y + beforeBox.height / 2 + 38, { steps: 8 });
	await page.waitForTimeout(120);
	const midClass = await first.getAttribute('class');
	const midPosition = await first.evaluate((el) => getComputedStyle(el).position);
	check('drag retains slot styling', midClass?.includes('is-dragging') === true && midPosition === 'absolute');
	await page.mouse.up();
	await page.waitForTimeout(250);
}
const afterBox = await first.boundingBox();
const after = await first.evaluate((el) => el.getAttribute('style'));
const position = await first.evaluate((el) => getComputedStyle(el).position);
check('drag keeps the slot positioned', position === 'absolute');
check(
	'drag follows the pointer',
	!!beforeBox && !!afterBox && Math.abs(afterBox.x - beforeBox.x - 56) < 16 && Math.abs(afterBox.y - beforeBox.y - 38) < 16,
	`${beforeBox?.x} -> ${afterBox?.x}`
);
check('drag updates the slot position', before !== after);
await first.locator('.passport-stamp-hit').focus();
const beforeKey = await first.evaluate((el) => el.getAttribute('style'));
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(250);
const afterKey = await first.evaluate((el) => el.getAttribute('style'));
check('arrow keys nudge a focused stamp', beforeKey !== afterKey);

await page.locator('.passport-tool[aria-label="Add random stamps"]').click();
await page.waitForTimeout(900);
check('random fills remaining slots', (await page.locator('.passport-stamp-slot').count()) === 9);

await page.locator('.passport-selected-remove').first().click();
await page.waitForTimeout(500);
check('row removal removes its stamp', (await page.locator('.passport-stamp-slot').count()) === 8);
check('row removal returns focus to the trigger', (await page.evaluate(() => document.activeElement?.id)) === 'passport-country-trigger');

await page.locator('.passport-tool[aria-label="New dates"]').click();
await page.waitForTimeout(900);
check('re-press keeps the count', (await page.locator('.passport-stamp-slot').count()) === 8);
await page.evaluate(() => {
	document.querySelectorAll('astro-dev-toolbar, agentation-toolbar, #react-scan-root, #blur-stack').forEach((el) => el.remove());
});
await page.screenshot({ path: 'shots/qa/everywhere-full.png', fullPage: true });

await page.locator('.passport-tool[aria-label="Add random stamps"]').click();
await page.waitForTimeout(900);
check('page fills to nine', (await page.locator('.passport-stamp-slot').count()) === 9);
check('trigger stays available when full', !(await page.locator('.passport-add').isDisabled()));
await page.locator('.passport-add').click();
await page.waitForTimeout(300);
check('full state explains itself', await page.locator('.passport-command-note').isVisible());
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.evaluate(() => {
	document.querySelectorAll('astro-dev-toolbar, agentation-toolbar, #react-scan-root, #blur-stack').forEach((el) => el.remove());
});
await page.screenshot({ path: 'shots/qa/everywhere-page-full.png', fullPage: true });
await page.locator('.passport-selected-remove').first().click();
await page.waitForTimeout(500);
check('picker remains available after removing at full', !(await page.locator('.passport-add').isDisabled()));
await page.locator('.passport-tool[aria-label="Clear page"]').click();
await page.waitForTimeout(500);
check('clear empties the page', (await page.locator('.passport-stamp-slot').count()) === 0);
check('empty state appears', await page.locator('.passport-empty').isVisible());
check('clear returns focus to the trigger', (await page.evaluate(() => document.activeElement?.id)) === 'passport-country-trigger');
await page.evaluate(() => {
	document.querySelectorAll('astro-dev-toolbar, agentation-toolbar, #react-scan-root, #blur-stack').forEach((el) => el.remove());
});
await page.screenshot({ path: 'shots/qa/everywhere-empty.png', fullPage: true });

await page.evaluate(() => localStorage.setItem('theme', 'dark'));
await page.reload({ waitUntil: 'domcontentloaded' });
await page.addStyleTag({ content: 'agentation-toolbar, astro-dev-toolbar { display: none !important; }' });
await page.evaluate(() => {
	document.querySelectorAll('astro-dev-toolbar, agentation-toolbar, #react-scan-root, #blur-stack').forEach((el) => el.remove());
});
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2200);
await page.evaluate(() => {
	document.querySelectorAll('astro-dev-toolbar, agentation-toolbar, #react-scan-root, #blur-stack').forEach((el) => el.remove());
});
await page.screenshot({ path: 'shots/qa/everywhere-dark.png', fullPage: true });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await mobile.addInitScript(() => localStorage.setItem('portfolio-pet:v1', JSON.stringify({ animal: 'none', color: 'brown' })));
await mobile.goto(`${base}/experiments/everywhere`, { waitUntil: 'domcontentloaded' });
await mobile.addStyleTag({ content: 'agentation-toolbar, astro-dev-toolbar { display: none !important; }' });
await mobile.evaluate(() => {
	document.querySelectorAll('astro-dev-toolbar, agentation-toolbar, #react-scan-root, #blur-stack').forEach((el) => el.remove());
});
await mobile.evaluate(() => document.fonts.ready);
await mobile.waitForTimeout(2200);
await mobile.evaluate(() => {
	document.querySelectorAll('astro-dev-toolbar, agentation-toolbar, #react-scan-root, #blur-stack').forEach((el) => el.remove());
});
await mobile.screenshot({ path: 'shots/qa/everywhere-mobile.png', fullPage: true });
const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
check('mobile has no horizontal overflow', !overflow);
const mobilePage = await mobile.locator('.passport-page').boundingBox();
const mobileControls = await mobile.locator('.passport-controls').boundingBox();
check('mobile shows the passport before the controls', !!mobilePage && !!mobileControls && mobilePage.y < mobileControls.y);
await mobile.setViewportSize({ width: 390, height: 500 });
await mobile.locator('.passport-add').scrollIntoViewIfNeeded();
await mobile.locator('.passport-add').click();
await mobile.waitForTimeout(350);
const sheet = await mobile.locator('.passport-picker-popover').boundingBox();
const sheetSearch = await mobile.locator('.passport-command-search').boundingBox();
check('mobile sheet fits a keyboard-height viewport', !!sheet && !!sheetSearch && sheet.y >= 0 && sheetSearch.y >= 0 && sheet.y + sheet.height <= 500);

check('no console errors', errors.length === 0, errors.join(' | '));
await browser.close();
