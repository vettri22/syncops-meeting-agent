import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Clock, 
  Users, 
  Trash2, 
  ArrowRight,
  ShieldAlert,
  ListFilter,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Meeting, Speaker } from '../types';

interface TranscriptIngestionProps {
  meetings: Meeting[];
  speakers: Speaker[];
  activeMeeting: Meeting | null;
  onSelectMeeting: (meeting: Meeting) => void;
  onIngestNewTranscript: (title: string, date: string, rawText: string) => Promise<void>;
  onDeleteMeeting: (meetingId: string) => Promise<void>;
  isProcessing: boolean;
}

export const TranscriptIngestion: React.FC<TranscriptIngestionProps> = ({
  meetings,
  speakers,
  activeMeeting,
  onSelectMeeting,
  onIngestNewTranscript,
  onDeleteMeeting,
  isProcessing
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rawText, setRawText] = useState('');
  const [speakerFilter, setSpeakerFilter] = useState<string>('all');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    await onIngestNewTranscript(title || 'Engineering Architecture Sync', date, rawText);
    setTitle('');
    setRawText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  const loadSampleTranscript = (sampleType: 'sprint' | 'conflict') => {
    if (sampleType === 'sprint') {
      setTitle('Sprint 43 Technical Kickoff');
      setDate('2026-11-21');
      setRawText(`[00:01:10] Alice Chen: Let us lock in our Q4 backend standard. We decided to use PostgreSQL on AWS RDS for transactional safety.
[00:03:20] Bob Martinez: Agreed. I will write the Knex database migrations by Nov 25.
[00:05:00] Carol Danvers: Our hard launch date is set for Dec 1st. Marketing campaign is locked.
[00:07:30] Dave Wilson: Our infrastructure budget ceiling is $12,000 per month across AWS.`);
    } else {
      setTitle('Mid-Sprint Architecture Deviation Sync');
      setDate('2026-11-22');
      setRawText(`[00:02:40] Bob Martinez: PostgreSQL migrations are getting messy with dynamic schemas. Let us scrap PostgreSQL and switch to MongoDB Atlas on Google Cloud instead.
[00:04:15] Carol Danvers: The checkout page is not ready. Can we push our MVP launch date from Dec 1st to Dec 20th?
[00:06:50] Dave Wilson: If we deploy on GCP and AWS together, our monthly cloud bill will rise to $18,500.`);
    }
  };

  const filteredTurns = activeMeeting?.turns.filter(turn => {
    if (speakerFilter === 'all') return true;
    return turn.speaker.toLowerCase().includes(speakerFilter.toLowerCase());
  }) || [];

  return (
    <div className="space-y-6">
      
      {/* Product Onboarding & Mission Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Active Meeting Governance Engine
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Turn Raw Meeting Transcripts into Verified Execution
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Upload or paste any meeting dialogue. SyncOps extracts architectural decisions and action items, guards against contradictions with past meetings, and pushes verified tasks into your engineering tracker.
          </p>
        </div>
      </div>

      {/* Main Grid: Upload Form (Left) & Meetings History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              Ingest New Meeting Transcript
            </h2>
            <label className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1">
              <span>Upload file</span>
              <input
                type="file"
                accept=".txt,.vtt,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meeting Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sprint Architecture Sync"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meeting Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Dialogue Transcript (Format: "[00:02:15] Speaker: text" or "Speaker: text")
                </label>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={7}
                placeholder="[00:01:15] Alice Chen: We decided that PostgreSQL is our standard.
[00:03:00] Bob Martinez: I will prepare schema migrations by Nov 25."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono-code focus:outline-none focus:border-indigo-500 leading-relaxed"
                required
              />
            </div>

            {/* Quick Sample Buttons */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span>Quick Test:</span>
              <button
                type="button"
                onClick={() => loadSampleTranscript('sprint')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium transition-colors cursor-pointer"
              >
                + Baseline Meeting
              </button>
              <button
                type="button"
                onClick={() => loadSampleTranscript('conflict')}
                className="px-2 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 font-medium transition-colors cursor-pointer"
              >
                + Conflict Meeting
              </button>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>{isProcessing ? 'Processing with AI & Database...' : 'Process & Analyze Meeting'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Existing Meetings in Database & Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* List of Meetings in SQLite */}
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Stored Company Meetings ({meetings.length})
              </h3>
              <span className="text-xs text-slate-500 font-mono">SQLite Persistent</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {meetings.map((m) => {
                const isSelected = activeMeeting?.id === m.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectMeeting(m)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {m.date}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete meeting "${m.title}" and its records?`)) {
                            onDeleteMeeting(m.id);
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors"
                        title="Delete meeting"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate mb-1">
                      {m.title}
                    </h4>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span>{m.participants?.join(', ') || 'Team'}</span>
                    </div>
                  </div>
                );
              })}

              {meetings.length === 0 && (
                <div className="col-span-2 p-6 text-center text-xs text-slate-500">
                  No meetings stored yet. Paste a transcript on the left to begin!
                </div>
              )}
            </div>
          </div>

          {/* Active Meeting Transcript Viewer */}
          {activeMeeting && (
            <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Active Transcript:</span>
                    <span className="text-indigo-400 font-normal">{activeMeeting.title}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <ListFilter className="w-3 h-3 text-slate-400" />
                  <select
                    value={speakerFilter}
                    onChange={(e) => setSpeakerFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded px-2 py-0.5 focus:outline-none"
                  >
                    <option value="all">All Speakers</option>
                    {activeMeeting.participants?.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Turns Feed */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filteredTurns.map(turn => {
                  const isConflict = turn.text.toLowerCase().includes('scrap postgres') || 
                                     turn.text.toLowerCase().includes('dec 20') || 
                                     turn.text.toLowerCase().includes('18,500');

                  return (
                    <div 
                      key={turn.id} 
                      className={`p-2.5 rounded-lg border text-xs ${
                        isConflict 
                          ? 'bg-rose-950/20 border-rose-500/40 text-rose-200' 
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{turn.speaker}</span>
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                          <span>{turn.timestamp}</span>
                          {isConflict && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/20 text-rose-300 font-bold">
                              Conflict Trigger
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="font-mono-code text-[11px] leading-relaxed">
                        {turn.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
