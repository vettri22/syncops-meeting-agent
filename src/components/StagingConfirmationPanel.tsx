import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Kanban,
  User,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Decision, ActionItem, Conflict, Speaker } from '../types';

interface StagingConfirmationPanelProps {
  stagedDecisions: Decision[];
  stagedActionItems: ActionItem[];
  conflicts: Conflict[];
  speakers: Speaker[];
  onConfirmAndPost: (
    approvedDecisions: Decision[], 
    approvedActions: ActionItem[],
    trackerPlatform: 'Linear' | 'GitHub' | 'Monday' | 'Trello'
  ) => void;
  onCancel: () => void;
}

export const StagingConfirmationPanel: React.FC<StagingConfirmationPanelProps> = ({
  stagedDecisions,
  stagedActionItems,
  conflicts,
  speakers,
  onConfirmAndPost,
  onCancel
}) => {
  const [decisions, setDecisions] = useState<Decision[]>(stagedDecisions);
  const [actions, setActions] = useState<ActionItem[]>(stagedActionItems);
  const [selectedTracker, setSelectedTracker] = useState<'Linear' | 'GitHub' | 'Monday' | 'Trello'>('Linear');
  const [confirmedModalOpen, setConfirmedModalOpen] = useState(false);

  const unresolvedConflicts = conflicts.filter(c => c.resolutionStatus === 'unresolved');

  const handleToggleDecision = (id: string) => {
    setDecisions(decisions.map(d => d.id === id ? { ...d, status: d.status === 'active' ? 'pending_approval' : 'active' } : d));
  };

  const handleToggleAction = (id: string) => {
    setActions(actions.map(a => a.id === id ? { ...a, status: a.status === 'approved' ? 'pending_review' : 'approved' } : a));
  };

  const handleDeleteDecision = (id: string) => {
    setDecisions(decisions.filter(d => d.id !== id));
  };

  const handleDeleteAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id));
  };

  const handleOwnerChange = (actionId: string, newOwner: string) => {
    setActions(actions.map(a => a.id === actionId ? { ...a, owner: newOwner } : a));
  };

  const handleDeadlineChange = (actionId: string, newDeadline: string) => {
    setActions(actions.map(a => a.id === actionId ? { ...a, deadline: newDeadline } : a));
  };

  const approvedActions = actions.filter(a => a.status === 'approved' || a.status === 'synced_to_tracker');
  const approvedDecisions = decisions.filter(d => d.status === 'active');

  const executePost = () => {
    onConfirmAndPost(approvedDecisions, approvedActions, selectedTracker);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-indigo-500/30 p-6 shadow-2xl space-y-6">
      
      {/* Human-in-the-Loop Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Human-in-the-Loop Confirmation Gate
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                Staged for Review
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict governance rule: Nothing is posted to external project trackers or company memory without explicit human confirmation.
            </p>
          </div>
        </div>

        {/* Tracker Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Sync Target:</span>
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            {(['Linear', 'GitHub', 'Monday', 'Trello'] as const).map(platform => (
              <button
                key={platform}
                onClick={() => setSelectedTracker(platform)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  selectedTracker === platform 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conflict Warning if Unresolved */}
      {unresolvedConflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-slate-300">
            <span className="font-bold text-rose-300">Warning: </span>
            There are <strong className="text-white">{unresolvedConflicts.length} active decision conflicts</strong> detected in this meeting. Review or resolve them before locking decisions into persistent memory.
          </div>
        </div>
      )}

      {/* Grid of Staged Decisions & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Decisions Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Proposed Decisions ({decisions.length})
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              Toggle checkbox to approve
            </span>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {decisions.map(dec => {
              const isApproved = dec.status === 'active';

              return (
                <div 
                  key={dec.id}
                  className={`p-3.5 rounded-xl border transition-all text-xs ${
                    isApproved 
                      ? 'bg-slate-950 border-indigo-500/40' 
                      : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isApproved}
                        onChange={() => handleToggleDecision(dec.id)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-0 bg-slate-900 border-slate-700"
                      />
                      <div>
                        <h4 className="font-bold text-white text-xs leading-snug">{dec.title}</h4>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Proposed by <strong className="text-indigo-300">{dec.proposedBy}</strong> • Category: <span className="capitalize text-slate-300">{dec.category}</span>
                        </div>
                      </div>
                    </label>

                    <button
                      onClick={() => handleDeleteDecision(dec.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Discard decision"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 italic pl-6 font-mono-code border-l border-slate-800 ml-1 mt-1">
                    "{dec.quote}"
                  </p>
                </div>
              );
            })}

            {decisions.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500 border border-slate-800 rounded-xl">
                No new decisions proposed in this transcript.
              </div>
            )}
          </div>
        </div>

        {/* Action Items Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-2">
              <Kanban className="w-4 h-4 text-emerald-400" />
              Proposed Action Items ({actions.length})
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              Ready to sync to {selectedTracker}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {actions.map(act => {
              const isApproved = act.status === 'approved' || act.status === 'synced_to_tracker';

              return (
                <div 
                  key={act.id}
                  className={`p-3.5 rounded-xl border transition-all text-xs ${
                    isApproved 
                      ? 'bg-slate-950 border-emerald-500/40' 
                      : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <label className="flex items-start gap-2.5 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={isApproved}
                        onChange={() => handleToggleAction(act.id)}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-0 bg-slate-900 border-slate-700"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-xs leading-snug">{act.title}</h4>
                      </div>
                    </label>

                    <button
                      onClick={() => handleDeleteAction(act.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Discard action item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Inline Editable Fields: Owner & Deadline */}
                  <div className="grid grid-cols-2 gap-2 pl-6 mt-2 pt-2 border-t border-slate-900">
                    <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                      <User className="w-3 h-3 text-slate-400" />
                      <select
                        value={act.owner}
                        onChange={(e) => handleOwnerChange(act.id, e.target.value)}
                        className="bg-transparent text-[11px] text-slate-300 w-full focus:outline-none"
                      >
                        {speakers.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <input
                        type="date"
                        value={act.deadline}
                        onChange={(e) => handleDeadlineChange(act.id, e.target.value)}
                        className="bg-transparent text-[11px] text-slate-300 w-full focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {actions.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500 border border-slate-800 rounded-xl">
                No new action items staged.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Actions Bar */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Ready to commit: <strong className="text-white">{approvedDecisions.length} decisions</strong> to memory and sync <strong className="text-white">{approvedActions.length} action items</strong> to <strong className="text-indigo-400">{selectedTracker}</strong>.
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={executePost}
            disabled={approvedActions.length === 0 && approvedDecisions.length === 0}
            className="px-5 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Confirm & Post to {selectedTracker}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
