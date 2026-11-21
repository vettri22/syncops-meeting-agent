import { Speaker, Meeting, Decision, ActionItem, Conflict } from '../types';

export const INITIAL_SPEAKERS: Speaker[] = [
  { id: 'alice', name: 'Alice Chen', role: 'Lead Architect', avatarColor: 'from-violet-500 to-indigo-500' },
  { id: 'bob', name: 'Bob Martinez', role: 'Senior Backend Engineer', avatarColor: 'from-cyan-500 to-blue-500' },
  { id: 'carol', name: 'Carol Danvers', role: 'Staff Product Manager', avatarColor: 'from-amber-500 to-orange-500' },
  { id: 'dave', name: 'Dave Wilson', role: 'Head of Infrastructure & DevOps', avatarColor: 'from-emerald-500 to-teal-500' },
];

export const SCENARIO_MEETINGS: Meeting[] = [
  {
    id: 'meet-01',
    title: 'Sprint 42: Architecture & Roadmap Alignment',
    date: '2026-11-10',
    duration: '42 mins',
    participants: ['Alice Chen', 'Bob Martinez', 'Carol Danvers', 'Dave Wilson'],
    status: 'processed',
    summary: 'Consensus reached on PostgreSQL on AWS RDS for ACID compliance, Dec 1st hard release date, and $12k/month infra cap.',
    rawTranscript: `[00:02:15] Alice Chen: Let's align on core technical decisions for Q4. For the core transactional database, we are locking in PostgreSQL hosted on AWS RDS. No NoSQL or DocumentDB for core orders because we need strict ACID compliance.
[00:03:40] Bob Martinez: Understood. I can work with PostgreSQL. The schema will be straightforward.
[00:04:30] Carol Danvers: Agreed. What is our hard deadline for the public MVP release?
[00:04:45] Alice Chen: Dec 1st, 2026 is non-negotiable. Marketing is launching the global campaign that morning, and partner contracts are already signed.
[00:07:10] Dave Wilson: Understood. Our infrastructure budget ceiling is strictly capped at $12,000 per month across all AWS services.
[00:09:20] Bob Martinez: I will write the initial DB schema and migration scripts for PostgreSQL by Nov 20.
[00:11:05] Dave Wilson: I will provision the AWS RDS PostgreSQL multi-AZ cluster and configure VPC peering by Nov 22.
[00:13:40] Carol Danvers: I will finalize the API consumer contracts with the frontend team by Nov 24.`,
    turns: [
      { id: 't1-1', timestamp: '00:02:15', speaker: 'Alice Chen', text: 'Let\'s align on core technical decisions for Q4. For the core transactional database, we are locking in PostgreSQL hosted on AWS RDS. No NoSQL or DocumentDB for core orders because we need strict ACID compliance.' },
      { id: 't1-2', timestamp: '00:03:40', speaker: 'Bob Martinez', text: 'Understood. I can work with PostgreSQL. The schema will be straightforward.' },
      { id: 't1-3', timestamp: '00:04:30', speaker: 'Carol Danvers', text: 'Agreed. What is our hard deadline for the public MVP release?' },
      { id: 't1-4', timestamp: '00:04:45', speaker: 'Alice Chen', text: 'Dec 1st, 2026 is non-negotiable. Marketing is launching the global campaign that morning, and partner contracts are already signed.' },
      { id: 't1-5', timestamp: '00:07:10', speaker: 'Dave Wilson', text: 'Understood. Our infrastructure budget ceiling is strictly capped at $12,000 per month across all AWS services.' },
      { id: 't1-6', timestamp: '00:09:20', speaker: 'Bob Martinez', text: 'I will write the initial DB schema and migration scripts for PostgreSQL by Nov 20.' },
      { id: 't1-7', timestamp: '00:11:05', speaker: 'Dave Wilson', text: 'I will provision the AWS RDS PostgreSQL multi-AZ cluster and configure VPC peering by Nov 22.' },
      { id: 't1-8', timestamp: '00:13:40', speaker: 'Carol Danvers', text: 'I will finalize the API consumer contracts with the frontend team by Nov 24.' },
    ]
  },
  {
    id: 'meet-02',
    title: 'Mid-Sprint Technical Sync (Conflict Incident)',
    date: '2026-11-18',
    duration: '28 mins',
    participants: ['Bob Martinez', 'Carol Danvers', 'Dave Wilson'],
    status: 'staged_for_review',
    summary: 'Deviations proposed: Bob suggests migrating to MongoDB on GCP, Carol suggests delaying launch to Dec 20, Dave projects budget overrun.',
    rawTranscript: `[00:03:10] Bob Martinez: Hey team, PostgreSQL schema migrations are getting tricky with the dynamic product metadata. I'm thinking we should just scrap Postgres and migrate our database to MongoDB Atlas on Google Cloud Platform instead.
[00:05:40] Carol Danvers: Hmm, that might slow us down a bit. Also, the frontend guys need more time for checkout redesign. Can we push our MVP launch date from Dec 1st to Dec 20th?
[00:08:15] Dave Wilson: If we run multi-cloud with GCP and AWS, our monthly cloud spend will jump to $18,500.
[00:10:30] Bob Martinez: Let's do it. I will spin up MongoDB Atlas instances on GCP by tomorrow afternoon.
[00:12:15] Dave Wilson: Okay, I will prepare Google Cloud IAM roles and billing accounts for the new database cluster by Nov 21.`,
    turns: [
      { id: 't2-1', timestamp: '00:03:10', speaker: 'Bob Martinez', text: 'Hey team, PostgreSQL schema migrations are getting tricky with the dynamic product metadata. I\'m thinking we should just scrap Postgres and migrate our database to MongoDB Atlas on Google Cloud Platform instead.' },
      { id: 't2-2', timestamp: '00:05:40', speaker: 'Carol Danvers', text: 'Hmm, that might slow us down a bit. Also, the frontend guys need more time for checkout redesign. Can we push our MVP launch date from Dec 1st to Dec 20th?' },
      { id: 't2-3', timestamp: '00:08:15', speaker: 'Dave Wilson', text: 'If we run multi-cloud with GCP and AWS, our monthly cloud spend will jump to $18,500.' },
      { id: 't2-4', timestamp: '00:10:30', speaker: 'Bob Martinez', text: 'Let\'s do it. I will spin up MongoDB Atlas instances on GCP by tomorrow afternoon.' },
      { id: 't2-5', timestamp: '00:12:15', speaker: 'Dave Wilson', text: 'Okay, I will prepare Google Cloud IAM roles and billing accounts for the new database cluster by Nov 21.' },
    ]
  },
  {
    id: 'meet-03',
    title: 'Emergency Governance & Compromise Alignment',
    date: '2026-11-19',
    duration: '35 mins',
    participants: ['Alice Chen', 'Bob Martinez', 'Carol Danvers'],
    status: 'staged_for_review',
    summary: 'Resolution of conflicts: Alice rejects MongoDB to preserve ACID guarantees, Bob proposes PostgreSQL JSONB columns as middle-ground.',
    rawTranscript: `[00:01:30] Alice Chen: I reviewed the SyncOps conflict alert from yesterday. We cannot switch to MongoDB on GCP—we have legal compliance requirements requiring strict ACID transactions for order auditing. Furthermore, marketing contracts mandate the Dec 1st launch.
[00:03:10] Bob Martinez: I understand Alice's concern now. What if we stick with PostgreSQL on AWS, but use PostgreSQL native JSONB columns for the dynamic attributes? That gives us document flexibility without sacrificing ACID.
[00:05:20] Alice Chen: That is an excellent compromise! Let's officially record the JSONB amendment to our database architecture.
[00:06:40] Carol Danvers: Great, then we freeze scope and maintain the Dec 1st launch date.
[00:08:15] Bob Martinez: I will implement the PostgreSQL JSONB schema and sample queries by Nov 21.`,
    turns: [
      { id: 't3-1', timestamp: '00:01:30', speaker: 'Alice Chen', text: 'I reviewed the SyncOps conflict alert from yesterday. We cannot switch to MongoDB on GCP—we have legal compliance requirements requiring strict ACID transactions for order auditing. Furthermore, marketing contracts mandate the Dec 1st launch.' },
      { id: 't3-2', timestamp: '00:03:10', speaker: 'Bob Martinez', text: 'I understand Alice\'s concern now. What if we stick with PostgreSQL on AWS, but use PostgreSQL native JSONB columns for the dynamic attributes? That gives us document flexibility without sacrificing ACID.' },
      { id: 't3-3', timestamp: '00:05:20', speaker: 'Alice Chen', text: 'That is an excellent compromise! Let\'s officially record the JSONB amendment to our database architecture.' },
      { id: 't3-4', timestamp: '00:06:40', speaker: 'Carol Danvers', text: 'Great, then we freeze scope and maintain the Dec 1st launch date.' },
      { id: 't3-5', timestamp: '00:08:15', speaker: 'Bob Martinez', text: 'I will implement the PostgreSQL JSONB schema and sample queries by Nov 21.' },
    ]
  }
];

export const INITIAL_DECISIONS: Decision[] = [
  {
    id: 'dec-101',
    meetingId: 'meet-01',
    meetingTitle: 'Sprint 42: Architecture & Roadmap Alignment',
    date: '2026-11-10',
    title: 'Primary Database: PostgreSQL on AWS RDS',
    details: 'Locked in PostgreSQL on AWS RDS for strict ACID compliance and transactional consistency for order processing.',
    category: 'architecture',
    impact: 'critical',
    proposedBy: 'Alice Chen',
    approvedBy: ['Bob Martinez', 'Carol Danvers', 'Dave Wilson'],
    quote: 'For the core transactional database, we are locking in PostgreSQL hosted on AWS RDS. No NoSQL or DocumentDB for core orders because we need strict ACID compliance.',
    status: 'active',
    confidenceScore: 0.98
  },
  {
    id: 'dec-102',
    meetingId: 'meet-01',
    meetingTitle: 'Sprint 42: Architecture & Roadmap Alignment',
    date: '2026-11-10',
    title: 'Hard Public Launch Date: Dec 1, 2026',
    details: 'Non-negotiable public MVP launch locked to align with paid global marketing campaign and partner commitments.',
    category: 'timeline',
    impact: 'critical',
    proposedBy: 'Alice Chen',
    approvedBy: ['Carol Danvers'],
    quote: 'Dec 1st, 2026 is non-negotiable. Marketing is launching the global campaign that morning, and partner contracts are already signed.',
    status: 'active',
    confidenceScore: 0.99
  },
  {
    id: 'dec-103',
    meetingId: 'meet-01',
    meetingTitle: 'Sprint 42: Architecture & Roadmap Alignment',
    date: '2026-11-10',
    title: 'Infrastructure Monthly Spend Cap: $12,000',
    details: 'Cloud infrastructure expenditure capped at $12k/month across all AWS accounts for Q4.',
    category: 'budget',
    impact: 'high',
    proposedBy: 'Dave Wilson',
    approvedBy: ['Alice Chen', 'Carol Danvers'],
    quote: 'Our infrastructure budget ceiling is strictly capped at $12,000 per month across all AWS services.',
    status: 'active',
    confidenceScore: 0.95
  }
];

export const INITIAL_ACTION_ITEMS: ActionItem[] = [
  {
    id: 'act-201',
    meetingId: 'meet-01',
    meetingTitle: 'Sprint 42: Architecture & Roadmap Alignment',
    title: 'Draft PostgreSQL initial schema & migration scripts',
    description: 'Set up Knex/Prisma migration files for core relational tables adhering to ACID guidelines.',
    owner: 'Bob Martinez',
    deadline: '2026-11-20',
    priority: 'high',
    status: 'synced_to_tracker',
    quote: 'I will write the initial DB schema and migration scripts for PostgreSQL by Nov 20.',
    trackerTicketId: 'ENG-104',
    trackerPlatform: 'Linear',
    syncedAt: '2026-11-10 11:30'
  },
  {
    id: 'act-202',
    meetingId: 'meet-01',
    meetingTitle: 'Sprint 42: Architecture & Roadmap Alignment',
    title: 'Provision AWS RDS PostgreSQL Multi-AZ Cluster',
    description: 'Configure VPC peering, security groups, automated daily snapshots, and IAM auth.',
    owner: 'Dave Wilson',
    deadline: '2026-11-22',
    priority: 'urgent',
    status: 'synced_to_tracker',
    quote: 'I will provision the AWS RDS PostgreSQL multi-AZ cluster and configure VPC peering by Nov 22.',
    trackerTicketId: 'OPS-212',
    trackerPlatform: 'Linear',
    syncedAt: '2026-11-10 11:32'
  },
  {
    id: 'act-203',
    meetingId: 'meet-01',
    meetingTitle: 'Sprint 42: Architecture & Roadmap Alignment',
    title: 'Finalize API consumer contract specs for Frontend',
    description: 'Provide OpenAPI/Swagger 3.0 spec for client endpoints to unblock UI engineers.',
    owner: 'Carol Danvers',
    deadline: '2026-11-24',
    priority: 'medium',
    status: 'synced_to_tracker',
    quote: 'I will finalize the API consumer contracts with the frontend team by Nov 24.',
    trackerTicketId: 'PROD-88',
    trackerPlatform: 'Linear',
    syncedAt: '2026-11-10 11:35'
  }
];

export const KNOWN_CONFLICTS_FOR_MEETING_2: Conflict[] = [
  {
    id: 'conf-301',
    severity: 'critical',
    category: 'architecture',
    newMeetingId: 'meet-02',
    newMeetingTitle: 'Mid-Sprint Technical Sync (Conflict Incident)',
    newSpeaker: 'Bob Martinez',
    newQuote: "I'm thinking we should just scrap Postgres and migrate our database to MongoDB Atlas on Google Cloud Platform instead.",
    newTimestamp: '00:03:10',
    conflictingDecisionId: 'dec-101',
    conflictingDecisionTitle: 'Primary Database: PostgreSQL on AWS RDS',
    priorDecisionDate: '2026-11-10',
    priorMeetingTitle: 'Sprint 42: Architecture & Roadmap Alignment',
    priorSpeaker: 'Alice Chen',
    priorQuote: 'For the core transactional database, we are locking in PostgreSQL hosted on AWS RDS. No NoSQL or DocumentDB for core orders because we need strict ACID compliance.',
    reason: 'Direct architectural contradiction. Replacing PostgreSQL on AWS with MongoDB on GCP violates previously approved ACID transactional compliance and cloud vendor standardization.',
    resolutionStatus: 'unresolved'
  },
  {
    id: 'conf-302',
    severity: 'critical',
    category: 'deadline',
    newMeetingId: 'meet-02',
    newMeetingTitle: 'Mid-Sprint Technical Sync (Conflict Incident)',
    newSpeaker: 'Carol Danvers',
    newQuote: 'Can we push our MVP launch date from Dec 1st to Dec 20th?',
    newTimestamp: '00:05:40',
    conflictingDecisionId: 'dec-102',
    conflictingDecisionTitle: 'Hard Public Launch Date: Dec 1, 2026',
    priorDecisionDate: '2026-11-10',
    priorMeetingTitle: 'Sprint 42: Architecture & Roadmap Alignment',
    priorSpeaker: 'Alice Chen',
    priorQuote: 'Dec 1st, 2026 is non-negotiable. Marketing is launching the global campaign that morning, and partner contracts are already signed.',
    reason: 'Schedule breach. Proposed 19-day postponement directly violates signed partner contracts and marketing campaign kickoff commitments.',
    resolutionStatus: 'unresolved'
  },
  {
    id: 'conf-303',
    severity: 'warning',
    category: 'budget',
    newMeetingId: 'meet-02',
    newMeetingTitle: 'Mid-Sprint Technical Sync (Conflict Incident)',
    newSpeaker: 'Dave Wilson',
    newQuote: 'If we run multi-cloud with GCP and AWS, our monthly cloud spend will jump to $18,500.',
    newTimestamp: '00:08:15',
    conflictingDecisionId: 'dec-103',
    conflictingDecisionTitle: 'Infrastructure Monthly Spend Cap: $12,000',
    priorDecisionDate: '2026-11-10',
    priorMeetingTitle: 'Sprint 42: Architecture & Roadmap Alignment',
    priorSpeaker: 'Dave Wilson',
    priorQuote: 'Our infrastructure budget ceiling is strictly capped at $12,000 per month across all AWS services.',
    reason: 'Budget overrun. Estimated monthly spend of $18,500 exceeds approved ceiling of $12,000 by 54%.',
    resolutionStatus: 'unresolved'
  }
];
