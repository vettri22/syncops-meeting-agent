import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function testRecord() {
  const videoDir = path.resolve('./test_video_output');
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: videoDir,
      size: { width: 1920, height: 1080 }
    },
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Click on Conflict Center
  await page.click('button:has-text("Conflict Center")');
  await page.waitForTimeout(2000);

  // Close context to finish writing video
  await context.close();
  await browser.close();

  const files = fs.readdirSync(videoDir);
  console.log('Recorded video files:', files);
}

testRecord().catch(err => {
  console.error('Error recording:', err);
  process.exit(1);
});
