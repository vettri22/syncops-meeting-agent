import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  GitCompare, 
  ArrowUpRight,
  Layers
} from 'lucide-react';
import { Conflict, ConflictResolution } from '../types';

interface ConflictCenterProps {
  conflicts: Conflict[];
  onResolveConflict: (conflictId: string, resolution: ConflictResolution, note: string) => Promise<void>;
  onNavigateToMemory: () => void;
}

export const ConflictCenter: React.FC<ConflictCenterProps> = ({
  conflicts,
  onResolveConflict,
  onNavigateToMemory
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unresolved' | 'resolved'>('all');

  const filteredConflicts = conflicts.filter(c => {
    if (activeTab === 'unresolved') return c.resolutionStatus === 'unresolved';
    if (activeTab === 'resolved') return c.resolutionStatus !== 'unresolved';
    return true;
  });

  const unresolvedCount = conflicts.filter(c => c.resolutionStatus === 'unresolved').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        unresolvedCount > 0 
          ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border-rose-500/30 shadow-xl shadow-rose-950/20' 
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl border ${
              unresolvedCount > 0 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Cross-Meeting Contradiction Guard
                </h2>
                {unresolvedCount > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                    {unresolvedCount} Active Contradictions
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    All Decisions Aligned
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                SyncOps evaluates meeting discussions against historical company decisions stored in SQLite memory. When a team member proposes an incompatible tech stack, delayed timeline, or budget expansion, the contradiction is caught and verified before it slips into production.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400">Database Memory Integrity</span>
              <div className="text-lg font-bold font-mono text-indigo-400">
                {unresolvedCount === 0 ? '100% Locked' : `${Math.max(0, 100 - unresolvedCount * 25)}% Compliance`}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            All Conflicts ({conflicts.length})
          </button>
          <button
            onClick={() => setActiveTab('unresolved')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'unresolved' 
                ? 'bg-rose-600 text-white' 
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            Unresolved ({unresolvedCount})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'resolved' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            Resolved ({conflicts.length - unresolvedCount})
          </button>
        </div>
      </div>

      {/* Conflict Cards List */}
      <div className="space-y-4">
        {filteredConflicts.map((conflict) => {
          const isResolved = conflict.resolutionStatus !== 'unresolved';

          return (
            <div 
              key={conflict.id}
              className={`rounded-xl border transition-all ${
                isResolved
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                  : conflict.severity === 'critical'
                  ? 'bg-slate-900/80 border-rose-500/40 shadow-lg shadow-rose-950/20'
                  : 'bg-slate-900/80 border-amber-500/40 shadow-lg shadow-amber-950/20'
              }`}
            >
              {/* Header Badge */}
              <div className="p-4 border-b border-slate-800/70 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    conflict.severity === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {conflict.severity === 'critical' ? 'Critical Contradiction' : 'Warning: Deviation'}
                  </span>

                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                    {conflict.category} Conflict
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    conflict.resolutionStatus === 'unresolved'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : conflict.resolutionStatus === 'overridden'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : conflict.resolutionStatus === 'dismissed'
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {conflict.resolutionStatus === 'unresolved' ? 'Action Required' : `Resolved: ${conflict.resolutionStatus}`}
                  </span>
                </div>
              </div>

              {/* Side-by-Side Diff Section */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Historical Decision Column */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 relative group">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1 font-semibold text-indigo-400">
                      <Clock className="w-3.5 h-3.5" />
                      Locked Decision in Memory
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">{conflict.priorDecisionDate}</span>
                  </div>

                  <h4 className="font-bold text-slate-200 text-sm mb-1">
                    {conflict.conflictingDecisionTitle}
                  </h4>
                  <div className="text-xs text-slate-400 mb-3">
                    Established in <span className="text-slate-300 font-medium">"{conflict.priorMeetingTitle}"</span> by <span className="text-indigo-300 font-medium">{conflict.priorSpeaker}</span>
                  </div>

                  {/* Quote block */}
                  <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200/90 italic font-mono-code leading-relaxed">
                    "{conflict.priorQuote}"
                  </div>
                </div>

                {/* New Contradiction Column */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-rose-900/30 relative">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1 font-semibold text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      New Proposed Deviation
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {conflict.newTimestamp || 'In Session'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-200 text-sm mb-1">
                    Proposed in "{conflict.newMeetingTitle}"
                  </h4>
                  <div className="text-xs text-slate-400 mb-3">
                    Stated by <span className="text-rose-300 font-medium">{conflict.newSpeaker}</span> during discussion
                  </div>

                  {/* Quote block */}
                  <div className="p-3 rounded-lg bg-rose-950/25 border border-rose-500/30 text-xs text-rose-200/90 italic font-mono-code leading-relaxed">
                    "{conflict.newQuote}"
                  </div>
                </div>

              </div>

              {/* AI Conflict Analysis Reason */}
              <div className="px-5 pb-4">
                <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">Contradiction Diagnostic: </span>
                    {conflict.reason}
                  </div>
                </div>
              </div>

              {/* Resolution Action Footer */}
              {!isResolved ? (
                <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
                    Select Action:
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onResolveConflict(conflict.id, 'dismissed', 'Enforced historical decision. Rejected rogue suggestion.')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Enforce Prior Decision (Reject Proposal)
                    </button>

                    <button
                      onClick={() => onResolveConflict(conflict.id, 'overridden', 'Team consensus approved update. Memory bank updated with superseding record.')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                      Adopt Proposed Change & Supersede
                    </button>

                    <button
                      onClick={() => onResolveConflict(conflict.id, 'escalated', 'Escalated to executive agenda for leadership review.')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Escalate to Agenda
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Resolution logged: <strong className="text-slate-200">{conflict.resolutionNote || conflict.resolutionStatus}</strong></span>
                  </div>
                  <button
                    onClick={onNavigateToMemory}
                    className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                  >
                    View in Memory Bank &rarr;
                  </button>
                </div>
              )}

            </div>
          );
        })}

        {filteredConflicts.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800/80">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Contradictions in this view</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              All meeting decisions and discussion points are currently consistent with company memory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
