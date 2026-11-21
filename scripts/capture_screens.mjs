import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function captureScreenshots() {
  const outputDir = path.resolve('C:/Users/accou/.gemini/antigravity/scratch/syncops-meeting-agent/HACKATHON_DEMO_FINAL/raw_screens');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Initial Screen: Conflict Center with 3 breaches
  console.log('Capturing screen_01_conflict_initial.png...');
  await page.screenshot({ path: path.join(outputDir, 'screen_01_conflict_initial.png') });

  // 2. Conflict Center scrolled to show side-by-side diff
  console.log('Capturing screen_02_conflict_diff.png...');
  await page.evaluate(() => window.scrollBy(0, 250));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, 'screen_02_conflict_diff.png') });

  // 3. Transcript Ingestion Tab
  console.log('Capturing screen_03_ingest_meeting2.png...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('button:has-text("Transcript Ingest")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, 'screen_03_ingest_meeting2.png') });

  // 4. Ingest Meeting 1
  console.log('Capturing screen_04_ingest_meeting1.png...');
  await page.click('h4:has-text("Sprint 42: Architecture & Roadmap Alignment")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, 'screen_04_ingest_meeting1.png') });

  // 5. Decision Memory Bank Tab
  console.log('Capturing screen_05_memory_bank.png...');
  await page.click('button:has-text("Decision Memory Bank")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, 'screen_05_memory_bank.png') });

  // 6. Staging Confirmation Gate (select meeting 2 again to show staging panel)
  console.log('Capturing screen_06_staging_gate.png...');
  await page.click('button:has-text("Transcript Ingest")');
  await page.waitForTimeout(500);
  await page.click('h4:has-text("Mid-Sprint Technical Sync (Conflict Incident)")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, 'screen_06_staging_gate.png') });

  // 7. Execution Board Tab
  console.log('Capturing screen_07_execution_kanban.png...');
  await page.click('button:has-text("Execution Tracker")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, 'screen_07_execution_kanban.png') });

  // 8. Deadline Reminders Tab
  console.log('Capturing screen_08_deadline_reminders.png...');
  await page.click('button:has-text("Deadline Reminders")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, 'screen_08_deadline_reminders.png') });

  // 9. Personal Digest Tab (Alice Chen)
  console.log('Capturing screen_09_personal_digest_alice.png...');
  await page.click('button:has-text("Weekly Digests")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, 'screen_09_personal_digest_alice.png') });

  // 10. Personal Digest Tab (Bob Martinez)
  console.log('Capturing screen_10_personal_digest_bob.png...');
  await page.click('button:has-text("Bob Martinez")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, 'screen_10_personal_digest_bob.png') });

  // 11. Guided Demo Tour Modal
  console.log('Capturing screen_11_guided_tour.png...');
  await page.click('button:has-text("1-Click Judge Demo")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, 'screen_11_guided_tour.png') });

  await browser.close();
  console.log('All screenshots captured successfully in 1080p!');
}

captureScreenshots().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
