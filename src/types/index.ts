export interface Speaker {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
}

export type DecisionCategory = 'architecture' | 'timeline' | 'budget' | 'security' | 'process';
export type DecisionImpact = 'critical' | 'high' | 'medium' | 'low';
export type DecisionStatus = 'active' | 'superseded' | 'contested' | 'pending_approval';

export interface Decision {
  id: string;
  meetingId: string;
  meetingTitle: string;
  date: string;
  title: string;
  details: string;
  category: DecisionCategory;
  impact: DecisionImpact;
  proposedBy: string;
  approvedBy: string[];
  quote: string;
  status: DecisionStatus;
  supersededBy?: string;
  confidenceScore: number;
}

export type ActionItemPriority = 'urgent' | 'high' | 'medium' | 'low';
export type ActionItemStatus = 'todo' | 'in_progress' | 'review' | 'pending_review' | 'approved' | 'synced_to_tracker' | 'completed';

export interface ActionItem {
  id: string;
  meetingId: string;
  meetingTitle: string;
  title: string;
  description: string;
  owner: string;
  deadline: string;
  priority: ActionItemPriority;
  status: ActionItemStatus;
  quote: string;
  trackerTicketId?: string;
  trackerPlatform?: 'Linear' | 'GitHub' | 'Monday' | 'Trello';
  syncedAt?: string;
}

export type ConflictSeverity = 'critical' | 'warning' | 'moderate';
export type ConflictResolution = 'unresolved' | 'overridden' | 'dismissed' | 'escalated';

export interface Conflict {
  id: string;
  severity: ConflictSeverity;
  category: 'architecture' | 'deadline' | 'budget' | 'ownership';
  newMeetingId: string;
  newMeetingTitle: string;
  newSpeaker: string;
  newQuote: string;
  newTimestamp?: string;
  conflictingDecisionId: string;
  conflictingDecisionTitle: string;
  priorDecisionDate: string;
  priorMeetingTitle: string;
  priorSpeaker: string;
  priorQuote: string;
  reason: string;
  resolutionStatus: ConflictResolution;
  resolutionNote?: string;
}

export interface TranscriptTurn {
  id: string;
  timestamp: string;
  speaker: string;
  text: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: string[];
  rawTranscript: string;
  turns: TranscriptTurn[];
  status: 'processed' | 'staged_for_review';
  summary?: string;
}

export interface Reminder {
  id: string;
  actionItemId: string;
  taskTitle: string;
  owner: string;
  deadline: string;
  daysRemaining: number;
  urgency: 'overdue' | 'due_today' | 'due_soon' | 'upcoming';
  generatedMessage: string;
  sentStatus: boolean;
  channel: 'Slack' | 'Email';
}

export interface SyncLog {
  id: string;
  timestamp: string;
  ticketId: string;
  title: string;
  assignee: string;
  platform: 'Linear' | 'GitHub' | 'Monday' | 'Trello';
  status: 'success' | 'queued';
  targetUrl: string;
}
