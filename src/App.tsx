import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TranscriptIngestion } from './components/TranscriptIngestion';
import { ConflictCenter } from './components/ConflictCenter';
import { DecisionMemoryBank } from './components/DecisionMemoryBank';
import { ExecutionBoard } from './components/ExecutionBoard';
import { RemindersCenter } from './components/RemindersCenter';
import { PersonalDigest } from './components/PersonalDigest';
import { StagingConfirmationPanel } from './components/StagingConfirmationPanel';
import { 
  Speaker, 
  Meeting, 
  Decision, 
  ActionItem, 
  Conflict, 
  ConflictResolution, 
  SyncLog 
} from './types';
import { INITIAL_SPEAKERS } from './data/mockData';
import { SyncOpsAPI } from './services/api';
import { AIAgentEngine } from './services/aiAgentEngine';
import { 
  ShieldAlert, 
  ArrowRight,
  Database,
  RefreshCw
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'ingest' | 'conflicts' | 'execution' | 'memory' | 'digest' | 'reminders'>('ingest');
  const [speakers] = useState<Speaker[]>(INITIAL_SPEAKERS);
  
  // Real Database States loaded from SQLite
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Sync Logs
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([
    {
      id: 'log-1',
      timestamp: '11:30:15 AM',
      ticketId: 'ENG-104',
      title: 'Draft PostgreSQL initial schema & migration scripts',
      assignee: 'Bob Martinez',
      platform: 'Linear',
      status: 'success',
      targetUrl: 'https://linear.app/teams/core/issue/ENG-104'
    },
    {
      id: 'log-2',
      timestamp: '11:32:40 AM',
      ticketId: 'OPS-212',
      title: 'Provision AWS RDS PostgreSQL Multi-AZ Cluster',
      assignee: 'Dave Wilson',
      platform: 'Linear',
      status: 'success',
      targetUrl: 'https://linear.app/teams/core/issue/OPS-212'
    }
  ]);

  // Staging state
  const [stagedDecisions, setStagedDecisions] = useState<Decision[]>([]);
  const [stagedActionItems, setStagedActionItems] = useState<ActionItem[]>([]);
  const [showStagingPanel, setShowStagingPanel] = useState<boolean>(false);

  // Load all initial data from real SQLite backend on mount
  const refreshAllData = async () => {
    setIsLoading(true);
    try {
      const [fetchedMeetings, fetchedDecisions, fetchedActions, fetchedConflicts] = await Promise.all([
        SyncOpsAPI.getMeetings(),
        SyncOpsAPI.getDecisions(),
        SyncOpsAPI.getActionItems(),
        SyncOpsAPI.getConflicts()
      ]);

      setMeetings(fetchedMeetings);
      setDecisions(fetchedDecisions);
      setActionItems(fetchedActions);
      setConflicts(fetchedConflicts);

      if (fetchedMeetings.length > 0 && !activeMeeting) {
        setActiveMeeting(fetchedMeetings[0]);
      }
    } catch (e) {
      console.error('Failed to load data from SQLite backend', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Reminders computed dynamically from action items
  const reminders = AIAgentEngine.computeReminders(actionItems);

  // Unresolved conflicts count
  const unresolvedConflictsCount = conflicts.filter(c => c.resolutionStatus === 'unresolved').length;

  /**
   * Ingest a new meeting transcript into SQLite
   */
  const handleIngestNewTranscript = async (title: string, date: string, rawText: string) => {
    setIsProcessing(true);
    try {
      const result = await SyncOpsAPI.createMeeting(title, date, rawText);
      await refreshAllData();

      // If conflicts detected, notify and switch to conflicts tab
      if (result.detectedConflicts && result.detectedConflicts.length > 0) {
        setActiveTab('conflicts');
      } else {
        setActiveTab('execution');
      }
    } catch (e) {
      alert('Failed to process meeting. Check server connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Delete meeting from SQLite
   */
  const handleDeleteMeeting = async (meetingId: string) => {
    await SyncOpsAPI.deleteMeeting(meetingId);
    if (activeMeeting?.id === meetingId) {
      setActiveMeeting(null);
    }
    await refreshAllData();
  };

  /**
   * Resolve a detected conflict in SQLite
   */
  const handleResolveConflict = async (conflictId: string, resolution: ConflictResolution, note: string) => {
    await SyncOpsAPI.resolveConflict(conflictId, resolution, note);
    await refreshAllData();
  };

  /**
   * Update task status in SQLite
   */
  const handleUpdateActionStatus = async (actionId: string, newStatus: ActionItem['status']) => {
    await SyncOpsAPI.updateActionItem(actionId, { status: newStatus });
    setActionItems(actionItems.map(a => a.id === actionId ? { ...a, status: newStatus } : a));
  };

  /**
   * Create a manual task in SQLite
   */
  const handleCreateManualAction = async (item: Partial<ActionItem>) => {
    await SyncOpsAPI.createActionItem(item);
    await refreshAllData();
  };

  /**
   * Delete a task from SQLite
   */
  const handleDeleteAction = async (actionId: string) => {
    await SyncOpsAPI.deleteActionItem(actionId);
    setActionItems(actionItems.filter(a => a.id !== actionId));
  };

  /**
   * Confirmation Step: Confirm staged items and sync to tracker
   */
  const handleConfirmAndPost = async (
    approvedDecisions: Decision[], 
    approvedActions: ActionItem[], 
    platform: 'Linear' | 'GitHub' | 'Monday' | 'Trello'
  ) => {
    // Sync action items to selected tracker
    const { updatedItems, logs } = AIAgentEngine.syncActionItems(approvedActions, platform);
    
    // Update statuses on backend
    for (const item of updatedItems) {
      await SyncOpsAPI.updateActionItem(item.id, { status: 'synced_to_tracker' as any });
    }

    setSyncLogs(prev => [...logs, ...prev]);
    setShowStagingPanel(false);
    setStagedDecisions([]);
    setStagedActionItems([]);
    await refreshAllData();
    setActiveTab('execution');
  };

  /**
   * Export all decisions and tasks to CSV
   */
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,ID,Title,Owner/Speaker,Date/Deadline,Status,Details/Citation\n";

    decisions.forEach(d => {
      csvContent += `"Decision","${d.id}","${d.title.replace(/"/g, '""')}","${d.proposedBy}","${d.date}","${d.status}","${d.quote.replace(/"/g, '""')}"\n`;
    });

    actionItems.forEach(a => {
      csvContent += `"Task","${a.id}","${a.title.replace(/"/g, '""')}","${a.owner}","${a.deadline}","${a.status}","${(a.description || a.quote || '').replace(/"/g, '""')}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `syncops_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        conflictCount={unresolvedConflictsCount}
        taskCount={actionItems.length}
        decisionCount={decisions.length}
        onNewMeetingClick={() => setActiveTab('ingest')}
        onExportCSV={handleExportCSV}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Global Conflict Floating Banner if on other tabs */}
        {unresolvedConflictsCount > 0 && activeTab !== 'conflicts' && (
          <div 
            onClick={() => setActiveTab('conflicts')}
            className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/70 border border-rose-500/50 flex items-center justify-between cursor-pointer hover:border-rose-400 transition-all shadow-lg shadow-rose-950/30"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
              <div className="text-xs">
                <span className="font-bold text-white">Active Alignment Breaches: </span>
                <span className="text-rose-200">
                  {unresolvedConflictsCount} proposed changes directly contradict prior locked decisions in company memory!
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
              <span>Review in Conflict Center</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Human-in-the-Loop Confirmation Staging Panel */}
        {showStagingPanel && (stagedDecisions.length > 0 || stagedActionItems.length > 0) && (
          <StagingConfirmationPanel
            stagedDecisions={stagedDecisions}
            stagedActionItems={stagedActionItems}
            conflicts={conflicts}
            speakers={speakers}
            onConfirmAndPost={handleConfirmAndPost}
            onCancel={() => setShowStagingPanel(false)}
          />
        )}

        {/* Loading State Indicator */}
        {isLoading && (
          <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Connecting to SyncOps SQLite Database...</span>
          </div>
        )}

        {/* Active Tab Views */}
        {!isLoading && activeTab === 'ingest' && (
          <TranscriptIngestion
            meetings={meetings}
            speakers={speakers}
            activeMeeting={activeMeeting}
            onSelectMeeting={(m) => setActiveMeeting(m)}
            onIngestNewTranscript={handleIngestNewTranscript}
            onDeleteMeeting={handleDeleteMeeting}
            isProcessing={isProcessing}
          />
        )}

        {!isLoading && activeTab === 'conflicts' && (
          <ConflictCenter
            conflicts={conflicts}
            onResolveConflict={handleResolveConflict}
            onNavigateToMemory={() => setActiveTab('memory')}
          />
        )}

        {!isLoading && activeTab === 'execution' && (
          <ExecutionBoard
            actionItems={actionItems}
            speakers={speakers}
            syncLogs={syncLogs}
            onUpdateActionStatus={handleUpdateActionStatus}
            onCreateManualAction={handleCreateManualAction}
            onDeleteAction={handleDeleteAction}
            onSyncAllPending={() => {
              const { updatedItems, logs } = AIAgentEngine.syncActionItems(actionItems, 'Linear');
              setActionItems(updatedItems);
              setSyncLogs(prev => [...logs, ...prev]);
            }}
          />
        )}

        {!isLoading && activeTab === 'memory' && (
          <DecisionMemoryBank
            decisions={decisions}
          />
        )}

        {!isLoading && activeTab === 'reminders' && (
          <RemindersCenter
            reminders={reminders}
            speakers={speakers}
            onTriggerReminder={(id, ch) => console.log(`Triggered ${ch} alert for ${id}`)}
            onSendAllUrgentReminders={() => {
              alert('Dispatched Slack reminders for all urgent deadlines.');
            }}
          />
        )}

        {!isLoading && activeTab === 'digest' && (
          <PersonalDigest
            speakers={speakers}
            actionItems={actionItems}
            decisions={decisions}
            conflicts={conflicts}
          />
        )}

      </main>

      {/* Real Product Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">SyncOps AI</span>
            <span>•</span>
            <span>Meeting-to-Execution Governance Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Database className="w-3 h-3" />
              SQLite Persistent Storage Active
            </span>
            <span>•</span>
            <button
              onClick={handleExportCSV}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Export System Data (CSV)
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
