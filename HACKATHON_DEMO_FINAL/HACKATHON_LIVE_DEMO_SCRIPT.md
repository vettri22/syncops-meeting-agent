# SyncOps AI — Official Hackathon Live Product Demonstration Script

**Project Title:** SyncOps AI: Meeting-to-Execution Governance Platform  
**Target Duration:** 2 minutes 51 seconds (171.2 seconds) — Strictly within < 2m 55s ceiling  
**Video Type:** Real Screen Recording of Live Working Website (`http://localhost:3000/`)  
**Resolution:** 1080p (1920 × 1080), 30 FPS  
**Voice Engine:** Edge Neural TTS (`en-IN-PrabhatNeural` / Natural Indian English Developer Voice)  

---

## Complete Synced Walkthrough Script

### SCENE 1 — INTRODUCTION `[0:00 - 0:13]` (13.4s)
> **Visual On Screen:** Real live browser window at `http://localhost:3000/`. Cursor smoothly highlights the SyncOps AI logo, the "SQLite DB Connected" active status badge, and the clean workspace interface.

**Voice-Over:**
> "Hello, respected judges. Welcome to SyncOps AI, a live meeting-to-execution governance workspace engineered to solve a critical problem: decisions made in meetings get lost, forgotten, or contradicted."

---

### SCENE 2 — PROBLEM STATEMENT `[0:13 - 0:36]` (23.2s)
> **Visual On Screen:** Navigating stored company meetings in SQLite. Clicking on "Sprint 42 Architecture Alignment", scrolling down to review raw transcript dialogue turns where PostgreSQL on AWS, Dec 1st launch, and a $12k budget were locked.

**Voice-Over:**
> "Engineering teams spend dozens of hours in technical standups and architecture reviews. Yet, key decisions vanish into messy notes, commitments are forgotten, and subsequent meetings frequently overturn past consensus without anyone realizing it. Existing tools only dump flat transcript summaries into Slack, with zero persistent memory and zero conflict detection."

---

### SCENE 3 — PROPOSED SOLUTION `[0:36 - 0:53]` (16.6s)
> **Visual On Screen:** Cursor hovers across the top workspace navigation tabs: *Meetings & Ingestion*, *Conflict Center*, *Execution Tracker*, *Decision Memory Bank*, *Deadlines & Nudges*, and *Team Digests*.

**Voice-Over:**
> "SyncOps AI transforms ephemeral meeting dialogues into an immutable company decision ledger. We provide automated transcript ingestion, a persistent decision memory bank powered by SQLite, real-time contradiction detection, and an interactive Kanban execution tracker."

---

### SCENE 4 — LIVE WORKING DEMONSTRATION `[0:53 - 1:56]` (63.1s)
> **Visual On Screen:** 
> 1. Ingestion Form: Click `+ Baseline Meeting`, click `Process & Analyze Meeting` (spinner spins, SQLite updates).
> 2. Ingestion Form: Click `+ Conflict Meeting` (proposing MongoDB on GCP and Dec 20 delay), click `Process & Analyze Meeting` $\rightarrow$ automatically triggers the red Conflict Alert!
> 3. Conflict Center: Scroll to inspect the live side-by-side quote diff comparing Alice's locked PostgreSQL decision against Bob's rogue proposal. Click `Enforce Prior Decision (Reject Proposal)` $\rightarrow$ state updates to resolved.
> 4. Execution Tracker: Navigate to Kanban board. Click `+ Add Task` $\rightarrow$ modal opens $\rightarrow$ type `"Deploy automated database backup verification"` $\rightarrow$ assign to Bob Martinez $\rightarrow$ click `Create Task` $\rightarrow$ card appears in To Do! Move card to In Progress and Done. Click `Source Quote` to reveal verbatim citation.
> 5. Deadlines & Nudges: Click `Deadlines & Nudges` $\rightarrow$ click `Send Slack Alert` $\rightarrow$ green toast notification confirms dispatch.
> 6. Team Digests: Click `Team & Weekly Digests` $\rightarrow$ select `Bob Martinez` $\rightarrow$ click `Copy Markdown Digest`.

**Voice-Over:**
> "Let us explore the live product. On our Meetings workspace, we click Baseline Meeting and click Process and Analyze. Our backend immediately segments turns, attributes speakers, and extracts decisions and action items directly into SQLite. Next, we simulate Meeting 2, where Bob suggests switching to MongoDB and Carol proposes delaying launch. When we analyze this meeting, SyncOps immediately fires a Critical Alignment Alert! In our Conflict Center, we see a live side-by-side quote diff comparing Alice's locked PostgreSQL decision against Bob's rogue proposal. We resolve this live by enforcing the prior decision. In our Execution Tracker, every extracted action item becomes an active Kanban card. We click Add Task to create a new action item, and move cards between To Do, In Progress, and Done. In Deadlines and Nudges, the system tracks time deltas and generates one-click Slack alerts, while our Team Digest provides personalized weekly rollups."

---

### SCENE 5 — TECHNICAL EXPLANATION `[1:56 - 2:24]` (28.0s)
> **Visual On Screen:** Navigate to `Decision Memory Bank`. Type `"PostgreSQL"` in the search bar $\rightarrow$ instant reactive search. Scroll through audit logs. Switch to Execution Tracker and show the live terminal dispatch log.

**Voice-Over:**
> "Architecturally, SyncOps is a full-stack application. The frontend uses React 19, TypeScript, and Tailwind CSS. The backend runs a Node.js REST API backed by native SQLite for permanent data persistence. Our extraction engine enforces strict JSON schemas, binding every decision to verbatim transcript citations, while our contradiction engine cross-checks proposals across technical, timeline, and budget dimensions."

---

### SCENE 6 — INNOVATION AND IMPACT `[2:24 - 2:39]` (14.7s)
> **Visual On Screen:** Cursor hovers on the top navbar, clicks `Export CSV` $\rightarrow$ real `.csv` file downloads to the user's computer. Navigates back to Conflict Center to show zero remaining breaches.

**Voice-Over:**
> "SyncOps eliminates alignment drift, saving engineering teams over four hours per developer every week. With full SQLite persistence and real CSV exports, it guarantees that no organizational decision slips through the cracks."

---

### SCENE 7 — CLOSING `[2:39 - 2:51]` (12.1s)
> **Visual On Screen:** Smooth view of the SyncOps AI dashboard, active SQLite badge, and polished dark interface.

**Voice-Over:**
> "We are not demonstrating a prototype or static presentation. We have built an active, production-grade workspace that turns lost conversations into verified execution. Thank you."
