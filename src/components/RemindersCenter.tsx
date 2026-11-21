import React, { useState } from 'react';
import { 
  BellRing, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Mail, 
  MessageSquare, 
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';
import { Reminder, Speaker } from '../types';

interface RemindersCenterProps {
  reminders: Reminder[];
  speakers: Speaker[];
  onTriggerReminder: (reminderId: string, channel: 'Slack' | 'Email') => void;
  onSendAllUrgentReminders: () => void;
}

export const RemindersCenter: React.FC<RemindersCenterProps> = ({
  reminders,
  speakers,
  onTriggerReminder,
  onSendAllUrgentReminders
}) => {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'upcoming'>('all');
  const [activeChannel, setActiveChannel] = useState<'Slack' | 'Email'>('Slack');
  const [sentToast, setSentToast] = useState<string | null>(null);

  const urgentCount = reminders.filter(r => r.urgency === 'overdue' || r.urgency === 'due_today' || r.urgency === 'due_soon').length;

  const filteredReminders = reminders.filter(r => {
    if (filter === 'urgent') return r.urgency === 'overdue' || r.urgency === 'due_today' || r.urgency === 'due_soon';
    if (filter === 'upcoming') return r.urgency === 'upcoming';
    return true;
  });

  const handleSend = (id: string, taskTitle: string, owner: string) => {
    onTriggerReminder(id, activeChannel);
    setSentToast(`Dispatched ${activeChannel} notification to ${owner} for "${taskTitle}"`);
    setTimeout(() => setSentToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {sentToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{sentToast}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <BellRing className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Automated Deadline Guard & Reminders
              </h2>
              {urgentCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {urgentCount} Due Soon
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Proactively tracks task deadlines extracted from meetings and sends context-aware nudge notifications through Slack and Email before delivery dates slip.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Channel selector */}
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setActiveChannel('Slack')}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeChannel === 'Slack' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Slack
            </button>
            <button
              onClick={() => setActiveChannel('Email')}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeChannel === 'Email' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </button>
          </div>

          <button
            onClick={onSendAllUrgentReminders}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Broadcast All Urgent</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          All Deadlines ({reminders.length})
        </button>
        <button
          onClick={() => setFilter('urgent')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            filter === 'urgent' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Urgent & Overdue ({urgentCount})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            filter === 'upcoming' ? 'bg-slate-800 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Upcoming ({reminders.length - urgentCount})
        </button>
      </div>

      {/* Reminders Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReminders.map((rem) => {
          const speakerMeta = speakers.find(s => s.name === rem.owner);
          const isUrgent = rem.urgency === 'overdue' || rem.urgency === 'due_today' || rem.urgency === 'due_soon';

          return (
            <div 
              key={rem.id}
              className={`p-5 rounded-xl border transition-all ${
                rem.urgency === 'overdue'
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : isUrgent
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${speakerMeta?.avatarColor || 'from-slate-600 to-slate-400'} flex items-center justify-center text-[10px] font-bold text-white`}>
                    {rem.owner.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-200">{rem.owner}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5">({speakerMeta?.role})</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  rem.urgency === 'overdue'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : rem.urgency === 'due_today'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : rem.urgency === 'due_soon'
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {rem.daysRemaining < 0 
                    ? `${Math.abs(rem.daysRemaining)} Days Overdue` 
                    : rem.daysRemaining === 0 
                    ? 'Due Today!' 
                    : `Due in ${rem.daysRemaining} days`}
                </span>
              </div>

              <h4 className="font-bold text-sm text-white mb-2 leading-snug">
                {rem.taskTitle}
              </h4>

              {/* Generated Slack/Email Nudge Preview */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono-code text-indigo-200/90 leading-relaxed mb-4">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Generated {activeChannel} Nudge:
                </div>
                {rem.generatedMessage}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Target: {rem.deadline}</span>
                </div>

                <button
                  onClick={() => handleSend(rem.id, rem.taskTitle, rem.owner)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Send {activeChannel} Alert</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
