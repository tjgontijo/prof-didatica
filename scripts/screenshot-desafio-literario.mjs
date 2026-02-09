import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000/desafio-literario';
const outDir = process.env.OUT_DIR
  ? path.resolve(process.env.OUT_DIR)
  : path.resolve('screenshots/desafio-literario');

const sectionNames = [
  'hero',
  'problem',
  'whats-included',
  'solution',
  'demo',
  'bonuses',
  'plan-basic',
  'plan-full',
  'results',
  'faq'
];

const viewportWidth = Number.parseInt(process.env.VIEWPORT_WIDTH ?? '1280', 10);
const viewportHeight = Number.parseInt(process.env.VIEWPORT_HEIGHT ?? '720', 10);
const deviceScaleFactor = Number.parseInt(process.env.DEVICE_SCALE_FACTOR ?? '2', 10);
const imageWaitTimeoutMs = Number.parseInt(process.env.IMAGE_WAIT_TIMEOUT_MS ?? '12000', 10);
const motionWaitTimeoutMs = Number.parseInt(process.env.MOTION_WAIT_TIMEOUT_MS ?? '2000', 10);

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: viewportWidth, height: viewportHeight },
  deviceScaleFactor
});
const page = await context.newPage();

await page.emulateMedia({ reducedMotion: 'reduce' });
await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForSelector('main');

await page.addStyleTag({
  content: '*{animation: none !important; transition: none !important;}'
});

await page.evaluate(async () => {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
});

await page.waitForTimeout(1000);

const sections = await page.$$('main > div > section');
console.log(`Found ${sections.length} top-level sections.`);

const waitForImages = async (handle) => {
  await handle.evaluate(async (element, timeoutMs) => {
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.race([
      Promise.all(
        images.map((img) => {
          if (img.complete) return null;
          return new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          });
        })
      ),
      new Promise((resolve) => setTimeout(resolve, timeoutMs))
    ]);
  }, imageWaitTimeoutMs);
};

const waitForMotion = async (handle, name) => {
  if (name !== 'plan-full') return;
  await handle.evaluate(async (element, timeoutMs) => {
    const card = element.querySelector('.bg-white.rounded-xl');
    if (!card) return;
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      if (getComputedStyle(card).opacity === '1') return;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }, motionWaitTimeoutMs);
};

for (let index = 0; index < sections.length; index += 1) {
  const section = sections[index];
  const id = await section.getAttribute('id');
  const name = sectionNames[index] ?? id ?? `section-${index + 1}`;

  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await waitForImages(section);
  await waitForMotion(section, name);
  await section.screenshot({
    path: path.join(outDir, `${name}.png`)
  });
}

const footer = await page.$('footer');
if (footer) {
  await footer.scrollIntoViewIfNeeded();
  await waitForImages(footer);
  await footer.screenshot({ path: path.join(outDir, 'footer.png') });
}

await browser.close();
console.log(`Screenshots saved to ${outDir}`);
