# SyncOps AI — Full-Stack Meeting-to-Execution Governance Platform

> **Hackathon Track:** Problem 03 — Meeting-to-Execution Agent  
> **Architecture:** Full-Stack Web Application (Node.js REST API + SQLite DB + React 19 / TypeScript / Vite)

---

## 🌟 What SyncOps Is (and Why It's Built This Way)

Traditional meeting assistants are passive **transcript summarizers** that dump text into Slack and forget everything. When a team meets a week later, engineers accidentally contradict prior architectures, slide deadlines, or breach budgets because no system connects past consensus to current work.

**SyncOps is an active, production-grade governance platform:**
1. **Persistent SQLite Decision Memory:** Stores organizational commitments in a persistent database (`server/syncops.db`).
2. **Cross-Meeting Contradiction Guard:** Real-time contradiction engine analyzes new proposals against locked decisions, flagging stack swaps, deadline extensions, and budget overruns with side-by-side quote diffs.
3. **Execution Tracker & Kanban:** Full CRUD task board with Linear ticket generation (`ENG-104`), status transitions, assignee management, and real CSV data exports.
4. **Proactive Deadline Nudges:** Monitors approaching due dates and generates formatted Slack/Email notifications.
5. **Personalized Weekly Digests:** Individual commitment rollups for every engineer.

---

## 🏗️ Full-Stack System Architecture

```
[ Frontend: React 19 + TypeScript + Tailwind CSS ] (Port 3000)
                     │
            HTTP REST API Calls
            (Vite Proxy: /api/*)
                     │
                     ▼
[ Backend: Node.js 24 REST API Server ] (Port 3001)
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
[ Native SQLite Database ]    [ Local Intelligence Engine ]
  • meetings                   • Turn parsing & speaker attribution
  • decisions                  • Structured JSON extraction
  • action_items               • Multi-vector contradiction detection
  • conflicts                  • Dynamic deadline delta calculations
  • settings
```

---

## 🚀 Running the Full-Stack Application

### 1. Start the SQLite REST API Backend (Port 3001)
```bash
cd C:\Users\accou\.gemini\antigravity\scratch\syncops-meeting-agent
node server/index.js
```

### 2. Start the Frontend Application (Port 3000)
```bash
npm run dev
```

Open your browser at **http://localhost:3000/**.

---

## 💡 How to Test the Real Product (Judge Walkthrough)

1. **Ingest a Real Meeting:**
   * Go to **Meetings & Ingestion**.
   * Paste any meeting transcript or click `+ Baseline Meeting` / `+ Conflict Meeting` to load realistic sample dialogue.
   * Click **"Process & Analyze Meeting"**.
   * Watch the backend parse turns, assign speakers, extract decisions, create tasks, and persist them directly into SQLite.
2. **Experience the Contradiction Guard:**
   * Click the **Conflict Center** tab.
   * Inspect the side-by-side diff comparing the locked decision (Postgres on AWS) against the rogue proposal (MongoDB on GCP).
   * Click **"Enforce Prior Decision"** or **"Adopt Proposed Change & Supersede"** — the database updates in real time.
3. **Manage the Execution Board:**
   * Click the **Execution Tracker** tab.
   * Click **"+ Add Task"** to create a custom action item.
   * Move tasks between **To Do**, **In Progress**, **In Review**, and **Done**.
   * Click **"Source Quote"** on any task to see its verbatim transcript citation.
4. **Export Live Data:**
   * Click **"Export CSV"** in the top navigation bar to download the entire system database as a CSV file.

---

## 🎬 Official Hackathon Live Product Demo Video & Presentation

The official demonstration video has been produced directly from the live working web application in 1080p with synchronized developer narration:

- **Full Demonstration Video (MP4):** [`HACKATHON_LIVE_DEMO.mp4`](file:///C:/Users/accou/.gemini/antigravity/scratch/syncops-meeting-agent/HACKATHON_DEMO_FINAL/HACKATHON_LIVE_DEMO.mp4) (Duration: 2m 51s, 1920x1080, 30 FPS, 11.1 MB)
- **Synchronized Subtitles (SRT):** [`HACKATHON_LIVE_DEMO_SUBTITLES.srt`](file:///C:/Users/accou/.gemini/antigravity/scratch/syncops-meeting-agent/HACKATHON_DEMO_FINAL/HACKATHON_LIVE_DEMO_SUBTITLES.srt)
- **Narration & Live Walkthrough Script:** [`HACKATHON_LIVE_DEMO_SCRIPT.md`](file:///C:/Users/accou/.gemini/antigravity/scratch/syncops-meeting-agent/HACKATHON_DEMO_FINAL/HACKATHON_LIVE_DEMO_SCRIPT.md)
- **Technical Summary & Architecture Document:** [`TECHNICAL_SUMMARY.md`](file:///C:/Users/accou/.gemini/antigravity/scratch/syncops-meeting-agent/HACKATHON_DEMO_FINAL/TECHNICAL_SUMMARY.md)

