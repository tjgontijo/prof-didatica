import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000/desafio-literario';
const outDir = process.env.OUT_DIR
  ? path.resolve(process.env.OUT_DIR)
  : path.resolve('screenshots/desafio-literario');
const frameDir = path.join(outDir, 'demo-gif-frames');
const gifPath = path.join(outDir, 'demo-carrossel.gif');

const viewportWidth = Number.parseInt(process.env.VIEWPORT_WIDTH ?? '390', 10);
const viewportHeight = Number.parseInt(process.env.VIEWPORT_HEIGHT ?? '844', 10);
const deviceScaleFactor = Number.parseInt(process.env.DEVICE_SCALE_FACTOR ?? '2', 10);

const slides = Number.parseInt(process.env.SLIDES ?? '6', 10);
const framesPerSlide = Number.parseInt(process.env.FRAMES_PER_SLIDE ?? '6', 10);
const transitionMs = Number.parseInt(process.env.TRANSITION_MS ?? '600', 10);
const frameRate = Number.parseInt(process.env.FRAME_RATE ?? '10', 10);
const imageWaitTimeoutMs = Number.parseInt(process.env.IMAGE_WAIT_TIMEOUT_MS ?? '12000', 10);
const loopBack = (process.env.LOOP_BACK ?? 'true') !== 'false';

const captureSelector = process.env.CAPTURE_SELECTOR ?? '#demo .demo-carrossel';
const swiperSelector = '#demo .demo-carrossel .swiper';

const gifWidth = process.env.GIF_WIDTH ? Number.parseInt(process.env.GIF_WIDTH, 10) : null;

fs.rmSync(frameDir, { recursive: true, force: true });
fs.mkdirSync(frameDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: viewportWidth, height: viewportHeight },
  deviceScaleFactor,
});
const page = await context.newPage();

await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForSelector('#demo');
await page.locator('#demo').scrollIntoViewIfNeeded();
await page.waitForSelector(swiperSelector, { timeout: 120000 });

await page.waitForTimeout(800);

const captureTarget = page.locator(captureSelector);

const waitForImages = async () => {
  await captureTarget.evaluate(async (element, timeoutMs) => {
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
      new Promise((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  }, imageWaitTimeoutMs);
};

let frameIndex = 0;
const captureFrame = async () => {
  await waitForImages();
  const filename = `frame-${String(frameIndex).padStart(3, '0')}.png`;
  await captureTarget.screenshot({ path: path.join(frameDir, filename) });
  frameIndex += 1;
};

const slideNext = async () => {
  const usedApi = await page.evaluate(({ selector, speed }) => {
    const swiperEl = document.querySelector(selector);
    if (swiperEl?.swiper) {
      swiperEl.swiper.slideNext(speed);
      return true;
    }
    return false;
  }, { selector: swiperSelector, speed: transitionMs });

  if (!usedApi) {
    const nextButton = page.locator('#demo .swiper-button-next');
    if ((await nextButton.count()) > 0) {
      await nextButton.first().click();
    }
  }
};

await captureFrame();

const transitions = loopBack ? slides : Math.max(slides - 1, 1);
const stepDelay = Math.max(16, Math.floor(transitionMs / framesPerSlide));

for (let i = 0; i < transitions; i += 1) {
  await slideNext();
  for (let j = 0; j < framesPerSlide; j += 1) {
    await page.waitForTimeout(stepDelay);
    await captureFrame();
  }
}

await browser.close();

const vf = gifWidth
  ? `scale=${gifWidth}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=full[p];[s1][p]paletteuse=dither=sierra2_4a`
  : `split[s0][s1];[s0]palettegen=stats_mode=full[p];[s1][p]paletteuse=dither=sierra2_4a`;

const ffmpegArgs = [
  '-y',
  '-framerate',
  String(frameRate),
  '-i',
  path.join(frameDir, 'frame-%03d.png'),
  '-vf',
  vf,
  '-loop',
  '0',
  gifPath,
];

const result = spawnSync('ffmpeg', ffmpegArgs, { stdio: 'inherit' });
if (result.status !== 0) {
  throw new Error('ffmpeg failed to generate gif');
}

console.log(`GIF saved to ${gifPath}`);
