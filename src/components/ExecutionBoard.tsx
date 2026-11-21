import React, { useState } from 'react';
import { 
  Kanban, 
  CheckCircle2, 
  Clock, 
  User, 
  Terminal,
  Send,
  Plus,
  Trash2,
  Calendar,
  X,
  ExternalLink
} from 'lucide-react';
import { ActionItem, Speaker, SyncLog } from '../types';

interface ExecutionBoardProps {
  actionItems: ActionItem[];
  speakers: Speaker[];
  syncLogs: SyncLog[];
  onUpdateActionStatus: (actionId: string, newStatus: ActionItem['status']) => Promise<void>;
  onCreateManualAction: (item: Partial<ActionItem>) => Promise<void>;
  onDeleteAction: (actionId: string) => Promise<void>;
  onSyncAllPending: () => void;
}

export const ExecutionBoard: React.FC<ExecutionBoardProps> = ({
  actionItems,
  speakers,
  syncLogs,
  onUpdateActionStatus,
  onCreateManualAction,
  onDeleteAction,
  onSyncAllPending
}) => {
  const [selectedQuote, setSelectedQuote] = useState<{ id: string; quote: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState(speakers[0]?.name || 'Alice Chen');
  const [newTaskDeadline, setNewTaskDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskPriority, setNewTaskPriority] = useState<ActionItem['priority']>('high');

  const todoItems = actionItems.filter(a => a.status === 'todo' || a.status === 'pending_review');
  const inProgressItems = actionItems.filter(a => a.status === 'in_progress');
  const reviewItems = actionItems.filter(a => a.status === 'review' || a.status === 'approved');
  const completedItems = actionItems.filter(a => a.status === 'completed' || a.status === 'synced_to_tracker');

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await onCreateManualAction({
      title: newTaskTitle,
      owner: newTaskOwner,
      deadline: newTaskDeadline,
      priority: newTaskPriority,
      status: 'todo',
      meetingTitle: 'Manual Task Entry'
    });
    setNewTaskTitle('');
    setIsModalOpen(false);
  };

  const renderCard = (item: ActionItem) => {
    const speakerMeta = speakers.find(s => s.name === item.owner);
    const isOverdue = new Date(item.deadline) < new Date('2026-11-21');

    return (
      <div 
        key={item.id}
        className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 shadow-sm transition-all space-y-2.5 group"
      >
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {item.trackerTicketId ? (
              <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                {item.trackerTicketId}
              </span>
            ) : (
              <span className="font-mono text-[10px] text-slate-500">
                Local
              </span>
            )}
            <span className="text-[10px] text-slate-500">
              {item.trackerPlatform || 'Linear'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
              item.priority === 'urgent'
                ? 'bg-rose-500/20 text-rose-300'
                : item.priority === 'high'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {item.priority}
            </span>

            <button
              onClick={() => onDeleteAction(item.id)}
              className="text-slate-600 hover:text-rose-400 p-0.5 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete task"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <h4 className="font-bold text-xs text-white leading-snug">
          {item.title}
        </h4>

        {/* Assigned Owner & Due Date */}
        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-900">
          <div className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${speakerMeta?.avatarColor || 'from-slate-600 to-slate-400'} flex items-center justify-center text-[9px] font-bold text-white`}>
              {item.owner.charAt(0)}
            </div>
            <span className="text-slate-300 font-medium text-[11px] truncate max-w-[90px]">{item.owner}</span>
          </div>

          <div className={`flex items-center gap-1 font-mono text-[10px] ${
            isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
          }`}>
            <Clock className="w-2.5 h-2.5" />
            <span>{item.deadline}</span>
          </div>
        </div>

        {/* Meeting quote citation */}
        {item.quote && (
          <div className="pt-0.5">
            <button
              onClick={() => setSelectedQuote(selectedQuote?.id === item.id ? null : { id: item.id, quote: item.quote })}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
            >
              {selectedQuote?.id === item.id ? 'Hide Citation' : 'Source Quote'}
            </button>
            {selectedQuote?.id === item.id && (
              <div className="mt-1.5 p-2 rounded bg-indigo-950/20 border border-indigo-500/20 text-[10px] text-indigo-200 italic font-mono-code leading-relaxed">
                "{item.quote}"
              </div>
            )}
          </div>
        )}

        {/* Status transition controls */}
        <div className="pt-1.5 border-t border-slate-900 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">Move:</span>
          <div className="flex items-center gap-1">
            {item.status !== 'todo' && (
              <button
                onClick={() => onUpdateActionStatus(item.id, 'todo')}
                className="px-1.5 py-0.5 text-[9px] rounded bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              >
                Todo
              </button>
            )}
            {item.status !== 'in_progress' && (
              <button
                onClick={() => onUpdateActionStatus(item.id, 'in_progress')}
                className="px-1.5 py-0.5 text-[9px] rounded bg-blue-950/40 text-blue-300 hover:bg-blue-900/60 border border-blue-500/30"
              >
                Progress
              </button>
            )}
            {item.status !== 'review' && (
              <button
                onClick={() => onUpdateActionStatus(item.id, 'review')}
                className="px-1.5 py-0.5 text-[9px] rounded bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-500/30"
              >
                Review
              </button>
            )}
            {item.status !== 'completed' ? (
              <button
                onClick={() => onUpdateActionStatus(item.id, 'completed')}
                className="px-1.5 py-0.5 text-[9px] rounded bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-500/30"
              >
                Done
              </button>
            ) : (
              <button
                onClick={() => onUpdateActionStatus(item.id, 'todo')}
                className="px-1.5 py-0.5 text-[9px] rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                Reopen
              </button>
            )}
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Board Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Kanban className="w-5 h-5 text-indigo-400" />
              Real Execution Tracker & Kanban
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300">
              {actionItems.length} Total Tasks
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Every commitment extracted from meetings is converted into an actionable, tracked task. Drag, update status, and sync to Linear.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* 4 Kanban Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Column 1: Todo */}
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 p-4 flex flex-col min-h-[460px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              To Do ({todoItems.length})
            </span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {todoItems.map(renderCard)}
            {todoItems.length === 0 && (
              <div className="h-32 flex items-center justify-center text-xs text-slate-600 text-center">
                No tasks to do.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 p-4 flex flex-col min-h-[460px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-blue-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              In Progress ({inProgressItems.length})
            </span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {inProgressItems.map(renderCard)}
            {inProgressItems.length === 0 && (
              <div className="h-32 flex items-center justify-center text-xs text-slate-600 text-center">
                No active tasks in progress.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: In Review */}
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 p-4 flex flex-col min-h-[460px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              In Review ({reviewItems.length})
            </span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {reviewItems.map(renderCard)}
            {reviewItems.length === 0 && (
              <div className="h-32 flex items-center justify-center text-xs text-slate-600 text-center">
                No tasks under review.
              </div>
            )}
          </div>
        </div>

        {/* Column 4: Completed */}
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 p-4 flex flex-col min-h-[460px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Done ({completedItems.length})
            </span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {completedItems.map(renderCard)}
            {completedItems.length === 0 && (
              <div className="h-32 flex items-center justify-center text-xs text-slate-600 text-center">
                No completed tasks yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Real-time Webhook Audit Dispatch Log */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono-code text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-900">
          <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
            <Terminal className="w-3.5 h-3.5" />
            Live Webhook & Tracker Integration Dispatch Log
          </span>
          <span className="text-emerald-400">HTTP 200 • SQLite Sync Active</span>
        </div>

        <div className="space-y-1 max-h-24 overflow-y-auto text-[11px]">
          {syncLogs.map(log => (
            <div key={log.id} className="text-slate-300 flex items-center justify-between py-0.5">
              <span className="text-emerald-400 font-bold">[{log.timestamp}] POST 200</span>
              <span className="text-indigo-300 font-semibold">{log.ticketId}</span>
              <span className="text-slate-200 truncate max-w-xs">{log.title}</span>
              <span className="text-slate-400">Owner: {log.assignee}</span>
              <span className="text-cyan-400">{log.platform}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Add Action Item to Execution Board
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement PostgreSQL schema migrations"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Assignee</label>
                  <select
                    value={newTaskOwner}
                    onChange={(e) => setNewTaskOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 focus:outline-none"
                  >
                    {speakers.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 focus:outline-none"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
