import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  GitBranch,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Decision, DecisionCategory, DecisionStatus } from '../types';

interface DecisionMemoryBankProps {
  decisions: Decision[];
  onSelectDecision?: (decision: Decision) => void;
}

export const DecisionMemoryBank: React.FC<DecisionMemoryBankProps> = ({
  decisions,
  onSelectDecision
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredDecisions = decisions.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.proposedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCount = decisions.filter(d => d.status === 'active').length;
  const supersededCount = decisions.filter(d => d.status === 'superseded').length;

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Persistent Cross-Meeting Memory Bank
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono">
                {activeCount} Active Contracts
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Immutable company decision ledger. Preserves decisions across past meetings to continuously guard against conflicting proposals, forgotten commitments, and scope creep.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <span className="text-slate-500 block text-[10px]">Active</span>
            <span className="text-emerald-400 font-bold text-base">{activeCount}</span>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <span className="text-slate-500 block text-[10px]">Superseded</span>
            <span className="text-slate-400 font-bold text-base">{supersededCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search decisions, owners, keywords..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="architecture">Architecture</option>
            <option value="timeline">Timeline</option>
            <option value="budget">Budget</option>
            <option value="security">Security</option>
            <option value="process">Process</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Decisions</option>
            <option value="superseded">Superseded Decisions</option>
            <option value="pending_approval">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Decisions Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDecisions.map((dec) => {
          const isActive = dec.status === 'active';

          return (
            <div 
              key={dec.id}
              className={`p-5 rounded-2xl border transition-all ${
                isActive 
                  ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/40 shadow-sm' 
                  : 'bg-slate-950/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {dec.status}
                  </span>
                  <span className="font-mono text-[11px] text-indigo-400 font-semibold uppercase">
                    {dec.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dec.date}</span>
                </div>
              </div>

              <h4 className="font-bold text-sm text-white mb-1.5 leading-snug">
                {dec.title}
              </h4>

              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                {dec.details}
              </p>

              {/* Exact Transcript Citation */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono-code text-indigo-200/80 italic mb-4">
                "{dec.quote}"
              </div>

              {/* Origin Meta Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div>
                  Origin: <strong className="text-slate-300">{dec.meetingTitle}</strong>
                </div>
                <div>
                  Champion: <strong className="text-indigo-300">{dec.proposedBy}</strong>
                </div>
              </div>

            </div>
          );
        })}

        {filteredDecisions.length === 0 && (
          <div className="col-span-2 p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-400">
            No decisions match the current query.
          </div>
        )}
      </div>

    </div>
  );
};
