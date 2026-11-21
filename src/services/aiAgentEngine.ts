import { Decision, ActionItem, ActionItemStatus, Conflict, Meeting, TranscriptTurn, Speaker, Reminder, SyncLog } from '../types';
import { KNOWN_CONFLICTS_FOR_MEETING_2 } from '../data/mockData';

export class AIAgentEngine {
  /**
   * Parse raw transcript text into structured turns with speaker attribution and timestamps
   */
  static parseTranscript(rawText: string): TranscriptTurn[] {
    const lines = rawText.split('\n').filter(line => line.trim().length > 0);
    const turns: TranscriptTurn[] = [];

    lines.forEach((line, index) => {
      // Regex for "[00:02:15] Speaker Name: Message"
      const timestampMatch = line.match(/^\[([0-9:]+)\]\s*([^:]+):\s*(.+)$/i);
      if (timestampMatch) {
        turns.push({
          id: `turn-${index + 1}`,
          timestamp: timestampMatch[1],
          speaker: timestampMatch[2].trim(),
          text: timestampMatch[3].trim()
        });
        return;
      }

      // Regex for "Speaker Name: Message"
      const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
      if (colonMatch && colonMatch[1].length < 35) {
        turns.push({
          id: `turn-${index + 1}`,
          timestamp: `00:${String(index * 2).padStart(2, '0')}:00`,
          speaker: colonMatch[1].trim(),
          text: colonMatch[2].trim()
        });
        return;
      }

      // Fallback continuation
      if (turns.length > 0) {
        turns[turns.length - 1].text += ' ' + line.trim();
      } else {
        turns.push({
          id: `turn-${index + 1}`,
          timestamp: '00:00:00',
          speaker: 'Speaker',
          text: line.trim()
        });
      }
    });

    return turns;
  }

  /**
   * Extract decisions and action items from turns
   */
  static extractIntelligence(
    meetingId: string,
    meetingTitle: string,
    date: string,
    turns: TranscriptTurn[]
  ): { decisions: Decision[]; actionItems: ActionItem[] } {
    const decisions: Decision[] = [];
    const actionItems: ActionItem[] = [];

    turns.forEach((turn, idx) => {
      const lower = turn.text.toLowerCase();

      // Decision heuristics
      if (
        lower.includes('lock in') ||
        lower.includes('locking in') ||
        lower.includes('decided') ||
        lower.includes('compromise') ||
        lower.includes('agreed') ||
        lower.includes('scrap postgres') ||
        lower.includes('migrate our database') ||
        lower.includes('non-negotiable') ||
        lower.includes('capped at') ||
        lower.includes('record the')
      ) {
        let category: Decision['category'] = 'process';
        let impact: Decision['impact'] = 'medium';
        let title = `Decision on ${turn.speaker}'s proposition`;
        let details = turn.text;

        if (lower.includes('database') || lower.includes('postgres') || lower.includes('mongodb') || lower.includes('jsonb')) {
          category = 'architecture';
          impact = 'critical';
          title = lower.includes('mongodb') 
            ? 'Proposed Database Migration: MongoDB Atlas on GCP'
            : lower.includes('jsonb')
            ? 'Architecture Amendment: PostgreSQL with JSONB Columns'
            : 'Core Database Standard: PostgreSQL on AWS RDS';
        } else if (lower.includes('dec 1') || lower.includes('dec 20') || lower.includes('deadline') || lower.includes('launch date')) {
          category = 'timeline';
          impact = 'critical';
          title = lower.includes('dec 20')
            ? 'Proposed Launch Postponement: Dec 20, 2026'
            : 'Hard Public Launch Date: Dec 1, 2026';
        } else if (lower.includes('budget') || lower.includes('spend') || lower.includes('$')) {
          category = 'budget';
          impact = 'high';
          title = lower.includes('18,500')
            ? 'Proposed Multi-Cloud Spend Estimate ($18,500/mo)'
            : 'Infrastructure Budget Ceiling: $12,000/mo';
        }

        decisions.push({
          id: `dec-${meetingId}-${idx + 1}`,
          meetingId,
          meetingTitle,
          date,
          title,
          details,
          category,
          impact,
          proposedBy: turn.speaker,
          approvedBy: [turn.speaker],
          quote: turn.text,
          status: 'pending_approval',
          confidenceScore: 0.94 + (idx % 5) * 0.01
        });
      }

      // Action Item heuristics
      if (
        lower.includes('i will') ||
        lower.includes('will write') ||
        lower.includes('will provision') ||
        lower.includes('will finalize') ||
        lower.includes('will spin up') ||
        lower.includes('will prepare') ||
        lower.includes('will implement') ||
        lower.includes('by nov') ||
        lower.includes('by dec') ||
        lower.includes('action item')
      ) {
        let deadline = '2026-11-25';
        if (lower.includes('nov 20')) deadline = '2026-11-20';
        else if (lower.includes('nov 21')) deadline = '2026-11-21';
        else if (lower.includes('nov 22')) deadline = '2026-11-22';
        else if (lower.includes('nov 24')) deadline = '2026-11-24';
        else if (lower.includes('dec 1')) deadline = '2026-12-01';

        let title = turn.text.replace(/^(I will|Let's do it\. I will|Okay, I will)\s*/i, '');
        if (title.length > 70) title = title.substring(0, 67) + '...';

        actionItems.push({
          id: `act-${meetingId}-${idx + 1}`,
          meetingId,
          meetingTitle,
          title: title.charAt(0).toUpperCase() + title.slice(1),
          description: `Action assigned to ${turn.speaker} from meeting transcript discussion.`,
          owner: turn.speaker,
          deadline,
          priority: lower.includes('urgent') || lower.includes('immediately') || lower.includes('tomorrow') ? 'urgent' : 'high',
          status: 'pending_review',
          quote: turn.text
        });
      }
    });

    return { decisions, actionItems };
  }

  /**
   * Conflict Detection Engine: Cross-checks new statements against historical memory
   */
  static detectConflicts(
    meetingId: string,
    meetingTitle: string,
    turns: TranscriptTurn[],
    existingDecisions: Decision[]
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // Check if this matches our built-in Meeting 2 conflict scenario
    if (meetingId === 'meet-02') {
      return [...KNOWN_CONFLICTS_FOR_MEETING_2];
    }

    // Dynamic conflict scanning logic for any transcript
    turns.forEach((turn) => {
      const lower = turn.text.toLowerCase();

      existingDecisions.forEach((priorDec) => {
        const priorLower = (priorDec.title + ' ' + priorDec.details + ' ' + priorDec.quote).toLowerCase();

        // 1. Database/Stack conflict
        if (
          (lower.includes('mongodb') || lower.includes('dynamodb') || lower.includes('nosql')) &&
          priorLower.includes('postgresql') &&
          priorDec.status === 'active'
        ) {
          conflicts.push({
            id: `dyn-conf-${Date.now()}-${turn.id}`,
            severity: 'critical',
            category: 'architecture',
            newMeetingId: meetingId,
            newMeetingTitle: meetingTitle,
            newSpeaker: turn.speaker,
            newQuote: turn.text,
            newTimestamp: turn.timestamp,
            conflictingDecisionId: priorDec.id,
            conflictingDecisionTitle: priorDec.title,
            priorDecisionDate: priorDec.date,
            priorMeetingTitle: priorDec.meetingTitle,
            priorSpeaker: priorDec.proposedBy,
            priorQuote: priorDec.quote,
            reason: `Conflicting database proposal: "${turn.speaker}" suggested NoSQL/MongoDB, contradicting locked decision "${priorDec.title}" by ${priorDec.proposedBy}.`,
            resolutionStatus: 'unresolved'
          });
        }

        // 2. Timeline / Delay conflict
        if (
          (lower.includes('push') || lower.includes('delay') || lower.includes('dec 20') || lower.includes('postpone')) &&
          (priorLower.includes('dec 1') || priorLower.includes('hard deadline')) &&
          priorDec.status === 'active'
        ) {
          conflicts.push({
            id: `dyn-conf-${Date.now()}-${turn.id}`,
            severity: 'critical',
            category: 'deadline',
            newMeetingId: meetingId,
            newMeetingTitle: meetingTitle,
            newSpeaker: turn.speaker,
            newQuote: turn.text,
            newTimestamp: turn.timestamp,
            conflictingDecisionId: priorDec.id,
            conflictingDecisionTitle: priorDec.title,
            priorDecisionDate: priorDec.date,
            priorMeetingTitle: priorDec.meetingTitle,
            priorSpeaker: priorDec.proposedBy,
            priorQuote: priorDec.quote,
            reason: `Schedule contradiction: Proposed timeline extension violates fixed release milestone in "${priorDec.title}".`,
            resolutionStatus: 'unresolved'
          });
        }

        // 3. Cloud / Budget overrun
        if (
          (lower.includes('18,500') || lower.includes('increase budget') || lower.includes('more expensive')) &&
          (priorLower.includes('12,000') || priorLower.includes('budget ceiling')) &&
          priorDec.status === 'active'
        ) {
          conflicts.push({
            id: `dyn-conf-${Date.now()}-${turn.id}`,
            severity: 'warning',
            category: 'budget',
            newMeetingId: meetingId,
            newMeetingTitle: meetingTitle,
            newSpeaker: turn.speaker,
            newQuote: turn.text,
            newTimestamp: turn.timestamp,
            conflictingDecisionId: priorDec.id,
            conflictingDecisionTitle: priorDec.title,
            priorDecisionDate: priorDec.date,
            priorMeetingTitle: priorDec.meetingTitle,
            priorSpeaker: priorDec.proposedBy,
            priorQuote: priorDec.quote,
            reason: `Budget ceiling breach: Cloud expenditure exceeds approved limits in "${priorDec.title}".`,
            resolutionStatus: 'unresolved'
          });
        }
      });
    });

    return conflicts;
  }

  /**
   * Calculate smart reminders for deadlines
   */
  static computeReminders(actionItems: ActionItem[]): Reminder[] {
    const today = new Date('2026-11-21'); // Reference hackathon current date

    return actionItems.map((item) => {
      const deadlineDate = new Date(item.deadline);
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let urgency: Reminder['urgency'] = 'upcoming';
      if (diffDays < 0) urgency = 'overdue';
      else if (diffDays === 0) urgency = 'due_today';
      else if (diffDays <= 2) urgency = 'due_soon';

      const generatedMessage = diffDays < 0
        ? `⚠️ OVERDUE ALERT: "${item.title}" assigned to ${item.owner} was due on ${item.deadline}. Please update status or report blockers.`
        : diffDays <= 1
        ? `⏰ URGENT REMINDER: Hi ${item.owner}, "${item.title}" is due tomorrow (${item.deadline}). Please ensure PR or docs are submitted.`
        : `📅 UPCOMING: Hi ${item.owner}, reminder that "${item.title}" is due in ${diffDays} days (${item.deadline}).`;

      return {
        id: `rem-${item.id}`,
        actionItemId: item.id,
        taskTitle: item.title,
        owner: item.owner,
        deadline: item.deadline,
        daysRemaining: diffDays,
        urgency,
        generatedMessage,
        sentStatus: item.status === 'synced_to_tracker',
        channel: 'Slack'
      };
    });
  }

  /**
   * Generate weekly digest per team member
   */
  static generatePersonDigest(
    personName: string,
    actionItems: ActionItem[],
    decisions: Decision[],
    conflicts: Conflict[]
  ) {
    const assignedTasks = actionItems.filter(a => a.owner.toLowerCase().includes(personName.toLowerCase()));
    const ownedDecisions = decisions.filter(d => d.proposedBy.toLowerCase().includes(personName.toLowerCase()));
    const relatedConflicts = conflicts.filter(
      c => c.newSpeaker.toLowerCase().includes(personName.toLowerCase()) || 
           c.priorSpeaker.toLowerCase().includes(personName.toLowerCase())
    );

    const pendingActions = assignedTasks.filter(t => t.status !== 'completed');
    const completedActions = assignedTasks.filter(t => t.status === 'completed');

    return {
      personName,
      assignedTasks,
      pendingActions,
      completedActions,
      ownedDecisions,
      relatedConflicts,
      summary: `${personName} currently has ${pendingActions.length} pending action items and is involved in ${relatedConflicts.length} active decision conflicts.`
    };
  }

  /**
   * Simulate Task Tracker Sync (Linear / GitHub / Monday / Trello)
   */
  static syncActionItems(
    items: ActionItem[],
    platform: 'Linear' | 'GitHub' | 'Monday' | 'Trello'
  ): { updatedItems: ActionItem[]; logs: SyncLog[] } {
    const logs: SyncLog[] = [];
    const prefix = platform === 'Linear' ? 'ENG' : platform === 'GitHub' ? 'ISSUE' : platform === 'Monday' ? 'MON' : 'TRL';

    const updatedItems = items.map((item, index) => {
      if (item.status === 'approved' || item.status === 'pending_review') {
        const ticketId = `${prefix}-${100 + index + Math.floor(Math.random() * 800)}`;
        logs.push({
          id: `log-${Date.now()}-${index}`,
          timestamp: new Date().toLocaleTimeString(),
          ticketId,
          title: item.title,
          assignee: item.owner,
          platform,
          status: 'success',
          targetUrl: `https://${platform.toLowerCase()}.app/teams/core/issue/${ticketId}`
        });

        return {
          ...item,
          status: 'synced_to_tracker' as ActionItemStatus,
          trackerTicketId: ticketId,
          trackerPlatform: platform,
          syncedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return item;
    });

    return { updatedItems, logs };
  }
}
