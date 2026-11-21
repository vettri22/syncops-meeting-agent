import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'syncops.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high concurrency
db.exec('PRAGMA journal_mode = WAL;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    duration TEXT,
    participants TEXT,
    raw_transcript TEXT,
    turns TEXT,
    summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,
    meeting_id TEXT,
    meeting_title TEXT,
    date TEXT,
    title TEXT NOT NULL,
    details TEXT,
    category TEXT,
    impact TEXT,
    proposed_by TEXT,
    approved_by TEXT,
    quote TEXT,
    status TEXT DEFAULT 'active',
    superseded_by TEXT,
    confidence_score REAL DEFAULT 0.95,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS action_items (
    id TEXT PRIMARY KEY,
    meeting_id TEXT,
    meeting_title TEXT,
    title TEXT NOT NULL,
    description TEXT,
    owner TEXT,
    deadline TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'todo',
    quote TEXT,
    ticket_id TEXT,
    platform TEXT DEFAULT 'Linear',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS conflicts (
    id TEXT PRIMARY KEY,
    severity TEXT,
    category TEXT,
    new_meeting_id TEXT,
    new_meeting_title TEXT,
    new_speaker TEXT,
    new_quote TEXT,
    new_timestamp TEXT,
    conflicting_decision_id TEXT,
    conflicting_decision_title TEXT,
    prior_decision_date TEXT,
    prior_meeting_title TEXT,
    prior_speaker TEXT,
    prior_quote TEXT,
    reason TEXT,
    resolution_status TEXT DEFAULT 'unresolved',
    resolution_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

console.log('SyncOps SQLite Database Initialized at:', dbPath);

// Pre-seed with default team project if empty
const countStmt = db.prepare('SELECT COUNT(*) as count FROM meetings');
const row = countStmt.get();
if (row.count === 0) {
  console.log('Seeding initial team project...');

  // Meeting 1
  const m1Id = 'meet-01';
  const m1Turns = [
    { id: 't1-1', timestamp: '00:02:15', speaker: 'Alice Chen', text: 'Let us align on core technical decisions for Q4. For the core transactional database, we are locking in PostgreSQL hosted on AWS RDS. No NoSQL or DocumentDB for core orders because we need strict ACID compliance.' },
    { id: 't1-2', timestamp: '00:03:40', speaker: 'Bob Martinez', text: 'Understood. I can work with PostgreSQL. The schema will be straightforward.' },
    { id: 't1-3', timestamp: '00:04:30', speaker: 'Carol Danvers', text: 'Agreed. What is our hard deadline for the public MVP release?' },
    { id: 't1-4', timestamp: '00:04:45', speaker: 'Alice Chen', text: 'Dec 1st, 2026 is non-negotiable. Marketing is launching the global campaign that morning, and partner contracts are already signed.' },
    { id: 't1-5', timestamp: '00:07:10', speaker: 'Dave Wilson', text: 'Understood. Our infrastructure budget ceiling is strictly capped at $12,000 per month across all AWS services.' },
    { id: 't1-6', timestamp: '00:09:20', speaker: 'Bob Martinez', text: 'I will write the initial DB schema and migration scripts for PostgreSQL by Nov 20.' },
    { id: 't1-7', timestamp: '00:11:05', speaker: 'Dave Wilson', text: 'I will provision the AWS RDS PostgreSQL multi-AZ cluster and configure VPC peering by Nov 22.' },
    { id: 't1-8', timestamp: '00:13:40', speaker: 'Carol Danvers', text: 'I will finalize the API consumer contracts with the frontend team by Nov 24.' }
  ];

  db.prepare(`
    INSERT INTO meetings (id, title, date, duration, participants, raw_transcript, turns, summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    m1Id,
    'Sprint 42: Architecture & Roadmap Alignment',
    '2026-11-10',
    '42 mins',
    JSON.stringify(['Alice Chen', 'Bob Martinez', 'Carol Danvers', 'Dave Wilson']),
    m1Turns.map(t => `[${t.timestamp}] ${t.speaker}: ${t.text}`).join('\n'),
    JSON.stringify(m1Turns),
    'Locked PostgreSQL on AWS RDS for ACID compliance, Dec 1st hard release date, and $12k/month infra cap.'
  );

  // Decisions for Meeting 1
  const insertDec = db.prepare(`
    INSERT INTO decisions (id, meeting_id, meeting_title, date, title, details, category, impact, proposed_by, approved_by, quote, status, confidence_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDec.run(
    'dec-101', m1Id, 'Sprint 42: Architecture & Roadmap Alignment', '2026-11-10',
    'Primary Database: PostgreSQL on AWS RDS',
    'Locked in PostgreSQL on AWS RDS for strict ACID compliance and transactional consistency for order processing.',
    'architecture', 'critical', 'Alice Chen', JSON.stringify(['Bob Martinez', 'Carol Danvers', 'Dave Wilson']),
    'For the core transactional database, we are locking in PostgreSQL hosted on AWS RDS. No NoSQL or DocumentDB for core orders because we need strict ACID compliance.',
    'active', 0.98
  );

  insertDec.run(
    'dec-102', m1Id, 'Sprint 42: Architecture & Roadmap Alignment', '2026-11-10',
    'Hard Public Launch Date: Dec 1, 2026',
    'Non-negotiable public MVP launch locked to align with paid global marketing campaign and partner commitments.',
    'timeline', 'critical', 'Alice Chen', JSON.stringify(['Carol Danvers']),
    'Dec 1st, 2026 is non-negotiable. Marketing is launching the global campaign that morning, and partner contracts are already signed.',
    'active', 0.99
  );

  insertDec.run(
    'dec-103', m1Id, 'Sprint 42: Architecture & Roadmap Alignment', '2026-11-10',
    'Infrastructure Monthly Spend Cap: $12,000',
    'Cloud infrastructure expenditure capped at $12k/month across all AWS accounts for Q4.',
    'budget', 'high', 'Dave Wilson', JSON.stringify(['Alice Chen', 'Carol Danvers']),
    'Our infrastructure budget ceiling is strictly capped at $12,000 per month across all AWS services.',
    'active', 0.95
  );

  // Actions for Meeting 1
  const insertAct = db.prepare(`
    INSERT INTO action_items (id, meeting_id, meeting_title, title, description, owner, deadline, priority, status, quote, ticket_id, platform)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAct.run('act-201', m1Id, 'Sprint 42: Architecture & Roadmap Alignment', 'Draft PostgreSQL initial schema & migration scripts', 'Set up Knex/Prisma migration files for core relational tables adhering to ACID guidelines.', 'Bob Martinez', '2026-11-20', 'high', 'todo', 'I will write the initial DB schema and migration scripts for PostgreSQL by Nov 20.', 'ENG-104', 'Linear');
  insertAct.run('act-202', m1Id, 'Sprint 42: Architecture & Roadmap Alignment', 'Provision AWS RDS PostgreSQL Multi-AZ Cluster', 'Configure VPC peering, security groups, automated daily snapshots, and IAM auth.', 'Dave Wilson', '2026-11-22', 'urgent', 'in_progress', 'I will provision the AWS RDS PostgreSQL multi-AZ cluster and configure VPC peering by Nov 22.', 'OPS-212', 'Linear');
  insertAct.run('act-203', m1Id, 'Sprint 42: Architecture & Roadmap Alignment', 'Finalize API consumer contract specs for Frontend', 'Provide OpenAPI/Swagger 3.0 spec for client endpoints to unblock UI engineers.', 'Carol Danvers', '2026-11-24', 'medium', 'review', 'I will finalize the API consumer contracts with the frontend team by Nov 24.', 'PROD-88', 'Linear');

  // Meeting 2 (Contains the real-world conflicts!)
  const m2Id = 'meet-02';
  const m2Turns = [
    { id: 't2-1', timestamp: '00:03:10', speaker: 'Bob Martinez', text: 'Hey team, PostgreSQL schema migrations are getting tricky with the dynamic product metadata. I am thinking we should just scrap Postgres and migrate our database to MongoDB Atlas on Google Cloud Platform instead.' },
    { id: 't2-2', timestamp: '00:05:40', speaker: 'Carol Danvers', text: 'Hmm, that might slow us down a bit. Also, the frontend guys need more time for checkout redesign. Can we push our MVP launch date from Dec 1st to Dec 20th?' },
    { id: 't2-3', timestamp: '00:08:15', speaker: 'Dave Wilson', text: 'If we run multi-cloud with GCP and AWS, our monthly cloud spend will jump to $18,500.' },
    { id: 't2-4', timestamp: '00:10:30', speaker: 'Bob Martinez', text: 'Let us do it. I will spin up MongoDB Atlas instances on GCP by tomorrow afternoon.' }
  ];

  db.prepare(`
    INSERT INTO meetings (id, title, date, duration, participants, raw_transcript, turns, summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    m2Id,
    'Mid-Sprint Technical Sync (Decisions Deviation)',
    '2026-11-18',
    '28 mins',
    JSON.stringify(['Bob Martinez', 'Carol Danvers', 'Dave Wilson']),
    m2Turns.map(t => `[${t.timestamp}] ${t.speaker}: ${t.text}`).join('\n'),
    JSON.stringify(m2Turns),
    'Meeting where team members proposed migrating to MongoDB on GCP, postponing launch to Dec 20, and expanding cloud budget.'
  );

  // Conflicts generated for Meeting 2
  const insertConf = db.prepare(`
    INSERT INTO conflicts (id, severity, category, new_meeting_id, new_meeting_title, new_speaker, new_quote, new_timestamp, conflicting_decision_id, conflicting_decision_title, prior_decision_date, prior_meeting_title, prior_speaker, prior_quote, reason, resolution_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertConf.run(
    'conf-301', 'critical', 'architecture', m2Id, 'Mid-Sprint Technical Sync (Decisions Deviation)',
    'Bob Martinez', 'I am thinking we should just scrap Postgres and migrate our database to MongoDB Atlas on Google Cloud Platform instead.', '00:03:10',
    'dec-101', 'Primary Database: PostgreSQL on AWS RDS', '2026-11-10', 'Sprint 42: Architecture & Roadmap Alignment',
    'Alice Chen', 'For the core transactional database, we are locking in PostgreSQL hosted on AWS RDS. No NoSQL or DocumentDB for core orders because we need strict ACID compliance.',
    'Direct architectural contradiction: Replacing PostgreSQL on AWS with MongoDB on GCP violates previously locked ACID compliance and cloud vendor standardization.',
    'unresolved'
  );

  insertConf.run(
    'conf-302', 'critical', 'deadline', m2Id, 'Mid-Sprint Technical Sync (Decisions Deviation)',
    'Carol Danvers', 'Can we push our MVP launch date from Dec 1st to Dec 20th?', '00:05:40',
    'dec-102', 'Hard Public Launch Date: Dec 1, 2026', '2026-11-10', 'Sprint 42: Architecture & Roadmap Alignment',
    'Alice Chen', 'Dec 1st, 2026 is non-negotiable. Marketing is launching the global campaign that morning, and partner contracts are already signed.',
    'Schedule breach: 19-day launch postponement contradicts locked marketing launch and signed partner commitments.',
    'unresolved'
  );

  insertConf.run(
    'conf-303', 'warning', 'budget', m2Id, 'Mid-Sprint Technical Sync (Decisions Deviation)',
    'Dave Wilson', 'If we run multi-cloud with GCP and AWS, our monthly cloud spend will jump to $18,500.', '00:08:15',
    'dec-103', 'Infrastructure Monthly Spend Cap: $12,000', '2026-11-10', 'Sprint 42: Architecture & Roadmap Alignment',
    'Dave Wilson', 'Our infrastructure budget ceiling is strictly capped at $12,000 per month across all AWS services.',
    'Budget ceiling breach: Projected multi-cloud expenditure ($18,500) exceeds approved Q4 cap ($12,000) by $6,500.',
    'unresolved'
  );

  console.log('Initial project seeded into SQLite successfully!');
}

// REST API Request Handlers
const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Helper to read JSON body
  const readBody = () => new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
  });

  // API Routes
  if (req.method === 'GET' && pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'SyncOps Backend Engine', db: 'SQLite' }));
    return;
  }

  // GET /api/meetings
  if (req.method === 'GET' && pathname === '/api/meetings') {
    const rows = db.prepare('SELECT * FROM meetings ORDER BY created_at DESC').all();
    const parsed = rows.map(r => ({
      ...r,
      participants: JSON.parse(r.participants || '[]'),
      turns: JSON.parse(r.turns || '[]')
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(parsed));
    return;
  }

  // POST /api/meetings (Ingest new meeting & run intelligence engine)
  if (req.method === 'POST' && pathname === '/api/meetings') {
    readBody().then(data => {
      const { title, date, rawTranscript, duration } = data;
      const meetingId = `meet-${Date.now()}`;

      // Parse transcript turns
      const lines = (rawTranscript || '').split('\n').filter(l => l.trim().length > 0);
      const turns = [];
      const participantsSet = new Set();

      lines.forEach((line, idx) => {
        const timeMatch = line.match(/^\[([0-9:]+)\]\s*([^:]+):\s*(.+)$/i);
        if (timeMatch) {
          const spk = timeMatch[2].trim();
          turns.push({ id: `t-${idx+1}`, timestamp: timeMatch[1], speaker: spk, text: timeMatch[3].trim() });
          participantsSet.add(spk);
          return;
        }
        const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
        if (colonMatch && colonMatch[1].length < 35) {
          const spk = colonMatch[1].trim();
          turns.push({ id: `t-${idx+1}`, timestamp: `00:${String(idx*2).padStart(2,'0')}:00`, speaker: spk, text: colonMatch[2].trim() });
          participantsSet.add(spk);
          return;
        }
        turns.push({ id: `t-${idx+1}`, timestamp: '00:00:00', speaker: 'Speaker', text: line.trim() });
      });

      const participants = Array.from(participantsSet);
      if (participants.length === 0) participants.push('Participant');

      // Save meeting
      db.prepare(`
        INSERT INTO meetings (id, title, date, duration, participants, raw_transcript, turns, summary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        meetingId,
        title || 'Meeting Sync',
        date || new Date().toISOString().split('T')[0],
        duration || `${Math.max(15, turns.length * 2)} mins`,
        JSON.stringify(participants),
        rawTranscript || '',
        JSON.stringify(turns),
        `Transcript with ${turns.length} turns across ${participants.join(', ')}.`
      );

      // Extract decisions and actions
      const existingDecisions = db.prepare("SELECT * FROM decisions WHERE status = 'active'").all();
      const detectedConflicts = [];
      const extractedDecisions = [];
      const extractedActions = [];

      turns.forEach((turn, idx) => {
        const lower = turn.text.toLowerCase();

        // Check decisions
        if (lower.includes('decide') || lower.includes('locking in') || lower.includes('lock in') || lower.includes('agreed') || lower.includes('non-negotiable') || lower.includes('compromise') || lower.includes('scrap') || lower.includes('migrate')) {
          let cat = 'process';
          let impact = 'medium';
          let dTitle = `Decision: ${turn.speaker}'s conclusion`;
          if (lower.includes('database') || lower.includes('postgres') || lower.includes('mongo') || lower.includes('jsonb')) {
            cat = 'architecture';
            impact = 'critical';
            dTitle = lower.includes('mongo') ? 'Proposed Database Migration to MongoDB' : lower.includes('jsonb') ? 'Architecture Amendment: PostgreSQL with JSONB' : 'Database Standard: PostgreSQL';
          } else if (lower.includes('deadline') || lower.includes('launch') || lower.includes('dec 1') || lower.includes('dec 20')) {
            cat = 'timeline';
            impact = 'critical';
            dTitle = lower.includes('dec 20') ? 'Proposed Launch Postponement to Dec 20' : 'Hard Launch Milestone: Dec 1';
          } else if (lower.includes('budget') || lower.includes('$') || lower.includes('spend')) {
            cat = 'budget';
            impact = 'high';
            dTitle = lower.includes('18,500') ? 'Proposed Cloud Budget Expansion ($18,500)' : 'Infrastructure Monthly Spend Cap';
          }

          const decId = `dec-${meetingId}-${idx+1}`;
          extractedDecisions.push({
            id: decId,
            meetingId,
            meetingTitle: title,
            date: date || new Date().toISOString().split('T')[0],
            title: dTitle,
            details: turn.text,
            category: cat,
            impact,
            proposedBy: turn.speaker,
            approvedBy: [turn.speaker],
            quote: turn.text,
            status: 'active',
            confidenceScore: 0.96
          });

          db.prepare(`
            INSERT INTO decisions (id, meeting_id, meeting_title, date, title, details, category, impact, proposed_by, approved_by, quote, status, confidence_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(decId, meetingId, title, date || new Date().toISOString().split('T')[0], dTitle, turn.text, cat, impact, turn.speaker, JSON.stringify([turn.speaker]), turn.text, 'active', 0.96);
        }

        // Check Action items
        if (lower.includes('i will') || lower.includes('will write') || lower.includes('will provision') || lower.includes('will prepare') || lower.includes('will finalize') || lower.includes('by nov') || lower.includes('by dec')) {
          let deadline = '2026-11-28';
          if (lower.includes('nov 20')) deadline = '2026-11-20';
          else if (lower.includes('nov 22')) deadline = '2026-11-22';
          else if (lower.includes('nov 24')) deadline = '2026-11-24';
          else if (lower.includes('dec 1')) deadline = '2026-12-01';

          let aTitle = turn.text.replace(/^(I will|Let's do it\. I will|Okay, I will)\s*/i, '');
          if (aTitle.length > 60) aTitle = aTitle.substring(0, 57) + '...';

          const actId = `act-${meetingId}-${idx+1}`;
          const ticketId = `ENG-${100 + Math.floor(Math.random() * 800)}`;
          extractedActions.push({
            id: actId,
            meetingId,
            meetingTitle: title,
            title: aTitle.charAt(0).toUpperCase() + aTitle.slice(1),
            description: `Assigned to ${turn.speaker} from discussion.`,
            owner: turn.speaker,
            deadline,
            priority: lower.includes('urgent') || lower.includes('immediately') ? 'urgent' : 'high',
            status: 'todo',
            quote: turn.text,
            ticketId,
            platform: 'Linear'
          });

          db.prepare(`
            INSERT INTO action_items (id, meeting_id, meeting_title, title, description, owner, deadline, priority, status, quote, ticket_id, platform)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(actId, meetingId, title, aTitle.charAt(0).toUpperCase() + aTitle.slice(1), `Assigned to ${turn.speaker} from discussion.`, turn.speaker, deadline, 'high', 'todo', turn.text, ticketId, 'Linear');
        }

        // Check Conflicts against existing decisions
        existingDecisions.forEach(pDec => {
          const pLower = (pDec.title + ' ' + pDec.details + ' ' + pDec.quote).toLowerCase();
          if ((lower.includes('mongo') || lower.includes('nosql')) && pLower.includes('postgresql')) {
            const confId = `conf-${Date.now()}-${idx}`;
            detectedConflicts.push({
              id: confId,
              severity: 'critical',
              category: 'architecture',
              newMeetingId: meetingId,
              newMeetingTitle: title,
              newSpeaker: turn.speaker,
              newQuote: turn.text,
              newTimestamp: turn.timestamp,
              conflictingDecisionId: pDec.id,
              conflictingDecisionTitle: pDec.title,
              priorDecisionDate: pDec.date,
              priorMeetingTitle: pDec.meeting_title,
              priorSpeaker: pDec.proposed_by,
              priorQuote: pDec.quote,
              reason: `Direct contradiction: "${turn.speaker}" proposed MongoDB, violating locked decision "${pDec.title}" by ${pDec.proposed_by}.`,
              resolutionStatus: 'unresolved'
            });

            db.prepare(`
              INSERT INTO conflicts (id, severity, category, new_meeting_id, new_meeting_title, new_speaker, new_quote, new_timestamp, conflicting_decision_id, conflicting_decision_title, prior_decision_date, prior_meeting_title, prior_speaker, prior_quote, reason, resolution_status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(confId, 'critical', 'architecture', meetingId, title, turn.speaker, turn.text, turn.timestamp, pDec.id, pDec.title, pDec.date, pDec.meeting_title, pDec.proposed_by, pDec.quote, `Direct contradiction: "${turn.speaker}" proposed MongoDB, violating locked decision "${pDec.title}" by ${pDec.proposed_by}.`, 'unresolved');
          }

          if ((lower.includes('delay') || lower.includes('push') || lower.includes('dec 20')) && pLower.includes('dec 1')) {
            const confId = `conf-${Date.now()}-${idx}-dl`;
            detectedConflicts.push({
              id: confId,
              severity: 'critical',
              category: 'deadline',
              newMeetingId: meetingId,
              newMeetingTitle: title,
              newSpeaker: turn.speaker,
              newQuote: turn.text,
              newTimestamp: turn.timestamp,
              conflictingDecisionId: pDec.id,
              conflictingDecisionTitle: pDec.title,
              priorDecisionDate: pDec.date,
              priorMeetingTitle: pDec.meeting_title,
              priorSpeaker: pDec.proposed_by,
              priorQuote: pDec.quote,
              reason: `Schedule contradiction: Proposed date change violates locked milestone "${pDec.title}".`,
              resolutionStatus: 'unresolved'
            });

            db.prepare(`
              INSERT INTO conflicts (id, severity, category, new_meeting_id, new_meeting_title, new_speaker, new_quote, new_timestamp, conflicting_decision_id, conflicting_decision_title, prior_decision_date, prior_meeting_title, prior_speaker, prior_quote, reason, resolution_status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(confId, 'critical', 'deadline', meetingId, title, turn.speaker, turn.text, turn.timestamp, pDec.id, pDec.title, pDec.date, pDec.meeting_title, pDec.proposed_by, pDec.quote, `Schedule contradiction: Proposed date change violates locked milestone "${pDec.title}".`, 'unresolved');
          }
        });
      });

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        meetingId,
        title,
        extractedDecisions,
        extractedActions,
        detectedConflicts
      }));
    });
    return;
  }

  // DELETE /api/meetings/:id
  if (req.method === 'DELETE' && pathname.startsWith('/api/meetings/')) {
    const mId = pathname.replace('/api/meetings/', '');
    db.prepare('DELETE FROM meetings WHERE id = ?').run(mId);
    db.prepare('DELETE FROM decisions WHERE meeting_id = ?').run(mId);
    db.prepare('DELETE FROM action_items WHERE meeting_id = ?').run(mId);
    db.prepare('DELETE FROM conflicts WHERE new_meeting_id = ?').run(mId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, deletedId: mId }));
    return;
  }

  // GET /api/decisions
  if (req.method === 'GET' && pathname === '/api/decisions') {
    const rows = db.prepare('SELECT * FROM decisions ORDER BY created_at DESC').all();
    const mapped = rows.map(r => ({
      ...r,
      meetingId: r.meeting_id,
      meetingTitle: r.meeting_title,
      proposedBy: r.proposed_by,
      approvedBy: JSON.parse(r.approved_by || '[]'),
      confidenceScore: r.confidence_score,
      supersededBy: r.superseded_by
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mapped));
    return;
  }

  // GET /api/actions
  if (req.method === 'GET' && pathname === '/api/actions') {
    const rows = db.prepare('SELECT * FROM action_items ORDER BY deadline ASC').all();
    const mapped = rows.map(r => ({
      ...r,
      meetingId: r.meeting_id,
      meetingTitle: r.meeting_title,
      trackerTicketId: r.ticket_id,
      trackerPlatform: r.platform
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mapped));
    return;
  }

  // POST /api/actions (Create manual action item)
  if (req.method === 'POST' && pathname === '/api/actions') {
    readBody().then(data => {
      const actId = `act-manual-${Date.now()}`;
      const ticketId = `ENG-${100 + Math.floor(Math.random() * 800)}`;
      db.prepare(`
        INSERT INTO action_items (id, meeting_id, meeting_title, title, description, owner, deadline, priority, status, quote, ticket_id, platform)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        actId,
        data.meetingId || 'manual',
        data.meetingTitle || 'Manual Entry',
        data.title,
        data.description || '',
        data.owner || 'Unassigned',
        data.deadline || new Date().toISOString().split('T')[0],
        data.priority || 'medium',
        data.status || 'todo',
        data.quote || 'Created directly by user in Execution Board',
        ticketId,
        data.platform || 'Linear'
      );
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, id: actId, ticketId }));
    });
    return;
  }

  // PUT /api/actions/:id (Update task status, owner, deadline)
  if (req.method === 'PUT' && pathname.startsWith('/api/actions/')) {
    const actId = pathname.replace('/api/actions/', '');
    readBody().then(data => {
      if (data.status) {
        db.prepare('UPDATE action_items SET status = ? WHERE id = ?').run(data.status, actId);
      }
      if (data.owner) {
        db.prepare('UPDATE action_items SET owner = ? WHERE id = ?').run(data.owner, actId);
      }
      if (data.deadline) {
        db.prepare('UPDATE action_items SET deadline = ? WHERE id = ?').run(data.deadline, actId);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, id: actId }));
    });
    return;
  }

  // DELETE /api/actions/:id
  if (req.method === 'DELETE' && pathname.startsWith('/api/actions/')) {
    const actId = pathname.replace('/api/actions/', '');
    db.prepare('DELETE FROM action_items WHERE id = ?').run(actId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, deletedId: actId }));
    return;
  }

  // GET /api/conflicts
  if (req.method === 'GET' && pathname === '/api/conflicts') {
    const rows = db.prepare('SELECT * FROM conflicts ORDER BY created_at DESC').all();
    const mapped = rows.map(r => ({
      ...r,
      newMeetingId: r.new_meeting_id,
      newMeetingTitle: r.new_meeting_title,
      newSpeaker: r.new_speaker,
      newQuote: r.new_quote,
      newTimestamp: r.new_timestamp,
      conflictingDecisionId: r.conflicting_decision_id,
      conflictingDecisionTitle: r.conflicting_decision_title,
      priorDecisionDate: r.prior_decision_date,
      priorMeetingTitle: r.prior_meeting_title,
      priorSpeaker: r.prior_speaker,
      priorQuote: r.prior_quote,
      resolutionStatus: r.resolution_status,
      resolutionNote: r.resolution_note
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mapped));
    return;
  }

  // POST /api/conflicts/resolve
  if (req.method === 'POST' && pathname === '/api/conflicts/resolve') {
    readBody().then(data => {
      const { conflictId, resolutionStatus, note } = data;
      db.prepare('UPDATE conflicts SET resolution_status = ?, resolution_note = ? WHERE id = ?').run(resolutionStatus, note || '', conflictId);

      // If overridden, supersede the prior decision in DB
      if (resolutionStatus === 'overridden') {
        const conf = db.prepare('SELECT conflicting_decision_id, new_meeting_title FROM conflicts WHERE id = ?').get(conflictId);
        if (conf && conf.conflicting_decision_id) {
          db.prepare("UPDATE decisions SET status = 'superseded', superseded_by = ? WHERE id = ?").run(`Overridden in ${conf.new_meeting_title}`, conf.conflicting_decision_id);
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, conflictId, resolutionStatus }));
    });
    return;
  }

  // POST /api/reset (Reset database to pristine state)
  if (req.method === 'POST' && pathname === '/api/reset') {
    db.exec('DELETE FROM meetings; DELETE FROM decisions; DELETE FROM action_items; DELETE FROM conflicts;');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'All tables reset' }));
    return;
  }

  // Static file serving for production (Frontend SPA)
  if (!pathname.startsWith('/api')) {
    const distDir = path.join(__dirname, '../dist');
    let filePath = path.join(distDir, pathname === '/' ? 'index.html' : pathname);

    // Security check to prevent directory traversal
    if (!filePath.startsWith(distDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    // If file doesn't exist or is a directory, fallback to index.html (SPA history mode routing)
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html');
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf'
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // Fallback 404 for API
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`SyncOps Real REST API Server running at: http://localhost:${PORT}`);
});
