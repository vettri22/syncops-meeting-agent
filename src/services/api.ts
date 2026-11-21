import { Meeting, Decision, ActionItem, Conflict, ConflictResolution } from '../types';

const API_BASE = '/api';

export class SyncOpsAPI {
  static async getMeetings(): Promise<Meeting[]> {
    try {
      const res = await fetch(`${API_BASE}/meetings`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      console.warn('API fetch failed, falling back to local storage', e);
      const saved = localStorage.getItem('syncops_meetings');
      return saved ? JSON.parse(saved) : [];
    }
  }

  static async createMeeting(title: string, date: string, rawTranscript: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, rawTranscript })
      });
      if (!res.ok) throw new Error('Create meeting failed');
      return await res.json();
    } catch (e) {
      console.error('Failed to create meeting on API', e);
      throw e;
    }
  }

  static async deleteMeeting(meetingId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/meetings/${meetingId}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to delete meeting on API', e);
      return false;
    }
  }

  static async getDecisions(): Promise<Decision[]> {
    try {
      const res = await fetch(`${API_BASE}/decisions`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      console.warn('API fetch failed, falling back to local storage', e);
      const saved = localStorage.getItem('syncops_decisions');
      return saved ? JSON.parse(saved) : [];
    }
  }

  static async getActionItems(): Promise<ActionItem[]> {
    try {
      const res = await fetch(`${API_BASE}/actions`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      console.warn('API fetch failed, falling back to local storage', e);
      const saved = localStorage.getItem('syncops_actions');
      return saved ? JSON.parse(saved) : [];
    }
  }

  static async createActionItem(item: Partial<ActionItem>): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to create action item', e);
      return null;
    }
  }

  static async updateActionItem(id: string, updates: Partial<ActionItem>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/actions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to update action item', e);
      return false;
    }
  }

  static async deleteActionItem(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/actions/${id}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to delete action item', e);
      return false;
    }
  }

  static async getConflicts(): Promise<Conflict[]> {
    try {
      const res = await fetch(`${API_BASE}/conflicts`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      console.warn('API fetch failed, falling back to local storage', e);
      const saved = localStorage.getItem('syncops_conflicts');
      return saved ? JSON.parse(saved) : [];
    }
  }

  static async resolveConflict(conflictId: string, resolutionStatus: ConflictResolution, note?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/conflicts/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conflictId, resolutionStatus, note })
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to resolve conflict on API', e);
      return false;
    }
  }

  static async resetDatabase(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
      return res.ok;
    } catch (e) {
      return false;
    }
  }
}
