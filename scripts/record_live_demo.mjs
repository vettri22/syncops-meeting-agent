import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const videoOutputDir = path.resolve('C:/Users/accou/.gemini/antigravity/scratch/syncops-meeting-agent/HACKATHON_DEMO_FINAL/raw_live_video');
if (!fs.existsSync(videoOutputDir)) {
  fs.mkdirSync(videoOutputDir, { recursive: true });
}

// Clean old videos in directory
fs.readdirSync(videoOutputDir).forEach(f => fs.unlinkSync(path.join(videoOutputDir, f)));

async function runLiveRecording() {
  console.log('Launching Chromium for 1080p live browser recording...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--window-size=1920,1080', '--disable-web-security']
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: videoOutputDir,
      size: { width: 1920, height: 1080 }
    },
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  // Inject visible mouse cursor helper
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const cursor = document.createElement('div');
      cursor.id = 'playwright-mouse-pointer';
      cursor.style.width = '18px';
      cursor.style.height = '18px';
      cursor.style.borderRadius = '50%';
      cursor.style.background = 'rgba(99, 102, 241, 0.9)';
      cursor.style.border = '2px solid #ffffff';
      cursor.style.boxShadow = '0 0 10px rgba(99, 102, 241, 0.8)';
      cursor.style.position = 'fixed';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '999999';
      cursor.style.transform = 'translate(-50%, -50%)';
      cursor.style.transition = 'transform 0.08s ease, background 0.15s ease';
      document.body.appendChild(cursor);

      document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      });
      document.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.75)';
        cursor.style.background = '#22d3ee';
      });
      document.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.background = 'rgba(99, 102, 241, 0.9)';
      });
    });
  });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Helper for smooth mouse movements
  async function smoothMouseMove(targetX, targetY, steps = 15) {
    await page.mouse.move(targetX, targetY, { steps });
  }

  // --- SCENE 1: INTRODUCTION (0.0s - 13.37s) ---
  console.log('Recording Scene 1: Introduction...');
  await smoothMouseMove(300, 40, 20); // hover on logo
  await page.waitForTimeout(2500);
  await smoothMouseMove(480, 40, 15); // hover on SQLite DB badge
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.scrollBy({ top: 120, behavior: 'smooth' }));
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.scrollBy({ top: -120, behavior: 'smooth' }));
  await page.waitForTimeout(3870);

  // --- SCENE 2: PROBLEM STATEMENT (13.37s - 36.53s) (23.16s) ---
  console.log('Recording Scene 2: Problem Statement...');
  await smoothMouseMove(1300, 260, 20); // hover over Stored Meetings
  await page.waitForTimeout(3000);
  // Click on first meeting
  await page.click('h4:has-text("Sprint 42: Architecture & Roadmap Alignment")');
  await page.waitForTimeout(2500);
  // Scroll down transcript turns
  await page.evaluate(() => {
    const list = document.querySelector('.overflow-y-auto');
    if (list) list.scrollBy({ top: 180, behavior: 'smooth' });
  });
  await page.waitForTimeout(4000);
  await page.evaluate(() => {
    const list = document.querySelector('.overflow-y-auto');
    if (list) list.scrollBy({ top: -180, behavior: 'smooth' });
  });
  await page.waitForTimeout(4000);
  await smoothMouseMove(1300, 240, 20);
  await page.waitForTimeout(9660);

  // --- SCENE 3: PROPOSED SOLUTION (36.53s - 53.16s) (16.63s) ---
  console.log('Recording Scene 3: Proposed Solution...');
  // Hover across all main workspace navigation tabs
  await smoothMouseMove(260, 68, 15); // Meetings
  await page.waitForTimeout(2500);
  await smoothMouseMove(370, 68, 15); // Conflict Center
  await page.waitForTimeout(2500);
  await smoothMouseMove(490, 68, 15); // Execution Tracker
  await page.waitForTimeout(2500);
  await smoothMouseMove(640, 68, 15); // Decision Memory
  await page.waitForTimeout(2500);
  await smoothMouseMove(770, 68, 15); // Deadlines & Nudges
  await page.waitForTimeout(2500);
  await smoothMouseMove(900, 68, 15); // Team Digests
  await page.waitForTimeout(4130);

  // --- SCENE 4: LIVE WORKING DEMONSTRATION (53.16s - 116.28s) (63.12s) ---
  console.log('Recording Scene 4: Live Working Demonstration...');
  // Step 4.1: Ingest Baseline Meeting
  await page.click('button:has-text("Meetings & Ingestion")');
  await page.waitForTimeout(1500);
  await smoothMouseMove(300, 570, 15); // hover "+ Baseline Meeting"
  await page.click('button:has-text("+ Baseline Meeting")');
  await page.waitForTimeout(2500);
  await smoothMouseMove(300, 620, 15); // hover "Process & Analyze"
  await page.click('button:has-text("Process & Analyze Meeting")');
  await page.waitForTimeout(4000); // Wait for real SQLite save

  // Step 4.2: Ingest Conflict Meeting
  await page.click('button:has-text("Meetings & Ingestion")');
  await page.waitForTimeout(1500);
  await smoothMouseMove(410, 570, 15); // hover "+ Conflict Meeting"
  await page.click('button:has-text("+ Conflict Meeting")');
  await page.waitForTimeout(2500);
  await page.click('button:has-text("Process & Analyze Meeting")');
  await page.waitForTimeout(4000); // Auto-navigates or triggers alert!

  // Step 4.3: Conflict Center & Resolution
  await page.click('button:has-text("Conflict Center")');
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollBy({ top: 220, behavior: 'smooth' }));
  await page.waitForTimeout(3000);
  // Hover on Side-by-Side Diff
  await smoothMouseMove(550, 480, 15); // Locked decision quote
  await page.waitForTimeout(2500);
  await smoothMouseMove(1300, 480, 15); // Proposed contradiction quote
  await page.waitForTimeout(2500);
  // Click "Enforce Prior Decision (Reject Proposal)"
  const enforceBtn = await page.$('button:has-text("Enforce Prior Decision")');
  if (enforceBtn) {
    await enforceBtn.click();
    await page.waitForTimeout(2500);
  }

  // Step 4.4: Execution Tracker & Kanban Task Actions
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.click('button:has-text("Execution Tracker")');
  await page.waitForTimeout(2000);
  // Click "+ Add Task"
  await page.click('button:has-text("Add Task")');
  await page.waitForTimeout(1200);
  await page.fill('input[placeholder*="PostgreSQL"]', 'Deploy automated database backup verification');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Create Task")');
  await page.waitForTimeout(2000);

  // Move task to In Progress and Done
  const progressBtn = await page.$('button:has-text("Progress")');
  if (progressBtn) {
    await progressBtn.click();
    await page.waitForTimeout(1500);
  }
  const doneBtn = await page.$('button:has-text("Done")');
  if (doneBtn) {
    await doneBtn.click();
    await page.waitForTimeout(1500);
  }

  // Click "Source Quote" citation
  const quoteBtn = await page.$('button:has-text("Source Quote")');
  if (quoteBtn) {
    await quoteBtn.click();
    await page.waitForTimeout(2000);
  }

  // Step 4.5: Deadlines & Nudges
  await page.click('button:has-text("Deadlines & Nudges")');
  await page.waitForTimeout(2000);
  await page.click('button:has-text("Send Slack Alert")');
  await page.waitForTimeout(2500);

  // Step 4.6: Team Weekly Digests
  await page.click('button:has-text("Team & Weekly Digests")');
  await page.waitForTimeout(2000);
  await page.click('button:has-text("Bob Martinez")');
  await page.waitForTimeout(2500);
  await page.click('button:has-text("Copy Markdown Digest")');
  await page.waitForTimeout(3000);

  // --- SCENE 5: TECHNICAL EXPLANATION (116.28s - 144.31s) (28.03s) ---
  console.log('Recording Scene 5: Technical Explanation...');
  await page.click('button:has-text("Decision Memory Bank")');
  await page.waitForTimeout(2000);
  await page.fill('input[placeholder*="Search decisions"]', 'PostgreSQL');
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.scrollBy({ top: 180, behavior: 'smooth' }));
  await page.waitForTimeout(4000);
  await page.evaluate(() => window.scrollBy({ top: -180, behavior: 'smooth' }));
  await page.waitForTimeout(3000);
  await page.fill('input[placeholder*="Search decisions"]', '');
  await page.waitForTimeout(4000);
  await page.click('button:has-text("Execution Tracker")');
  await page.waitForTimeout(4000);
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await page.waitForTimeout(4030);

  // --- SCENE 6: INNOVATION AND IMPACT (144.31s - 159.05s) (14.74s) ---
  console.log('Recording Scene 6: Innovation and Impact...');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(2000);
  await smoothMouseMove(1700, 36, 15); // hover Export CSV
  await page.waitForTimeout(2000);
  await page.click('button:has-text("Export CSV")'); // triggers real CSV download
  await page.waitForTimeout(4000);
  await page.click('button:has-text("Conflict Center")');
  await page.waitForTimeout(6740);

  // --- SCENE 7: CLOSING (159.05s - 171.17s) (12.12s) ---
  console.log('Recording Scene 7: Closing...');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await smoothMouseMove(960, 400, 20); // hover center
  await page.waitForTimeout(12120);

  console.log('Finishing browser recording...');
  await context.close();
  await browser.close();

  const files = fs.readdirSync(videoOutputDir).filter(f => f.endsWith('.webm'));
  console.log('Raw live recording exported:', files[0]);
}

runLiveRecording().catch(err => {
  console.error('Recording failed:', err);
  process.exit(1);
});
