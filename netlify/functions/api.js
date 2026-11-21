const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tzjwspjrmfzshhphabsd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6andzcGpybWZ6c2hocGhhYnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5MDgxMzYsImV4cCI6MjExMDQ4NDEzNn0.qL3NNVBmjRjtR4JW5J4hnOKgTZiym3dy-9T7TbPmi9Q';

const sbHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const jsonResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
};

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  try {
    // GET /api/health
    if (req.method === 'GET' && pathname === '/api/health') {
      return jsonResponse({
        status: 'ok',
        service: 'SyncOps Cloud Serverless Backend',
        db: 'PostgreSQL (Supabase)',
        timestamp: new Date().toISOString()
      });
    }

    // GET /api/meetings
    if (req.method === 'GET' && pathname === '/api/meetings') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/meetings?select=*&order=created_at.desc`, { headers: sbHeaders });
      const rows = await res.json();
      const mapped = rows.map(r => ({
        ...r,
        rawTranscript: r.raw_transcript,
        participants: typeof r.participants === 'string' ? JSON.parse(r.participants) : (r.participants || []),
        turns: typeof r.turns === 'string' ? JSON.parse(r.turns) : (r.turns || [])
      }));
      return jsonResponse(mapped);
    }

    // POST /api/meetings
    if (req.method === 'POST' && pathname === '/api/meetings') {
      const body = await req.json();
      const { title, date, rawTranscript } = body;
      const meetingId = `meet-${Date.now().toString(36)}`;

      // Parse transcript into turns
      const lines = rawTranscript.split('\n').filter(l => l.trim().length > 0);
      const turns = [];
      const participantSet = new Set();

      lines.forEach((line, idx) => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > -1) {
          const speaker = line.substring(0, colonIdx).trim();
          const text = line.substring(colonIdx + 1).trim();
          participantSet.add(speaker);
          const mins = Math.floor(idx * 2.5);
          const secs = (idx * 17) % 60;
          turns.push({
            id: `turn-${idx + 1}`,
            timestamp: `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
            speaker,
            text
          });
        }
      });

      const participants = Array.from(participantSet);
      const summary = `Meeting '${title}' parsed with ${turns.length} dialogue turns and ${participants.length} attributed participants.`;

      const meetingRecord = {
        id: meetingId,
        title,
        date: date || new Date().toISOString().split('T')[0],
        duration: `${Math.max(15, turns.length * 4)}m`,
        participants,
        raw_transcript: rawTranscript,
        turns,
        summary
      };

      await fetch(`${SUPABASE_URL}/rest/v1/meetings`, {
        method: 'POST',
        headers: sbHeaders,
        body: JSON.stringify(meetingRecord)
      });

      // Contradiction detection against active decisions in Supabase
      const decisionsRes = await fetch(`${SUPABASE_URL}/rest/v1/decisions?status=eq.active&select=*`, { headers: sbHeaders });
      const activeDecisions = await decisionsRes.json();
      const generatedConflicts = [];

      turns.forEach(turn => {
        const lower = turn.text.toLowerCase();

        // 1. Architecture check (MongoDB vs PostgreSQL)
        if (lower.includes('mongodb') || lower.includes('nosql') || lower.includes('documentdb')) {
          const postgresDec = activeDecisions.find(d => d.title.toLowerCase().includes('postgresql') || d.details.toLowerCase().includes('postgresql'));
          if (postgresDec) {
            generatedConflicts.push({
              id: `conf-${Date.now().toString(36)}-1`,
              severity: 'critical',
              category: 'architecture',
              new_meeting_id: meetingId,
              new_meeting_title: title,
              new_speaker: turn.speaker,
              new_quote: turn.text,
              new_timestamp: turn.timestamp,
              conflicting_decision_id: postgresDec.id,
              conflicting_decision_title: postgresDec.title,
              prior_decision_date: postgresDec.date,
              prior_meeting_title: postgresDec.meeting_title,
              prior_speaker: postgresDec.proposed_by,
              prior_quote: postgresDec.quote,
              reason: 'Direct architectural contradiction: Proposing MongoDB/NoSQL violates locked PostgreSQL ACID standard.',
              resolution_status: 'unresolved'
            });
          }
        }

        // 2. Schedule check (Postponing Dec 1st)
        if (lower.includes('delay') || lower.includes('postpone') || lower.includes('push') || lower.includes('dec 20')) {
          const launchDec = activeDecisions.find(d => d.title.toLowerCase().includes('launch') || d.details.toLowerCase().includes('launch') || d.title.toLowerCase().includes('dec 1'));
          if (launchDec) {
            generatedConflicts.push({
              id: `conf-${Date.now().toString(36)}-2`,
              severity: 'critical',
              category: 'deadline',
              new_meeting_id: meetingId,
              new_meeting_title: title,
              new_speaker: turn.speaker,
              new_quote: turn.text,
              new_timestamp: turn.timestamp,
              conflicting_decision_id: launchDec.id,
              conflicting_decision_title: launchDec.title,
              prior_decision_date: launchDec.date,
              prior_meeting_title: launchDec.meeting_title,
              prior_speaker: launchDec.proposed_by,
              prior_quote: launchDec.quote,
              reason: 'Schedule breach: Proposed delay contradicts locked Dec 1 launch commitment.',
              resolution_status: 'unresolved'
            });
          }
        }

        // 3. Budget check (Exceeding $12,000)
        if (lower.includes('18,500') || lower.includes('18500') || (lower.includes('budget') && lower.includes('increase'))) {
          const budgetDec = activeDecisions.find(d => d.title.toLowerCase().includes('spend') || d.title.toLowerCase().includes('budget') || d.details.toLowerCase().includes('12,000'));
          if (budgetDec) {
            generatedConflicts.push({
              id: `conf-${Date.now().toString(36)}-3`,
              severity: 'warning',
              category: 'budget',
              new_meeting_id: meetingId,
              new_meeting_title: title,
              new_speaker: turn.speaker,
              new_quote: turn.text,
              new_timestamp: turn.timestamp,
              conflicting_decision_id: budgetDec.id,
              conflicting_decision_title: budgetDec.title,
              prior_decision_date: budgetDec.date,
              prior_meeting_title: budgetDec.meeting_title,
              prior_speaker: budgetDec.proposed_by,
              prior_quote: budgetDec.quote,
              reason: 'Budget overrun: Projected cloud cost exceeds locked $12,000 monthly ceiling.',
              resolution_status: 'unresolved'
            });
          }
        }
      });

      if (generatedConflicts.length > 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/conflicts`, {
          method: 'POST',
          headers: sbHeaders,
          body: JSON.stringify(generatedConflicts)
        });
      }

      return jsonResponse({
        success: true,
        meetingId,
        conflictsCount: generatedConflicts.length,
        meeting: {
          ...meetingRecord,
          rawTranscript: meetingRecord.raw_transcript
        }
      });
    }

    // DELETE /api/meetings/:id
    if (req.method === 'DELETE' && pathname.startsWith('/api/meetings/')) {
      const meetingId = pathname.replace('/api/meetings/', '');
      await fetch(`${SUPABASE_URL}/rest/v1/meetings?id=eq.${meetingId}`, { method: 'DELETE', headers: sbHeaders });
      await fetch(`${SUPABASE_URL}/rest/v1/decisions?meeting_id=eq.${meetingId}`, { method: 'DELETE', headers: sbHeaders });
      await fetch(`${SUPABASE_URL}/rest/v1/action_items?meeting_id=eq.${meetingId}`, { method: 'DELETE', headers: sbHeaders });
      return jsonResponse({ success: true, deleted: meetingId });
    }

    // GET /api/decisions
    if (req.method === 'GET' && pathname === '/api/decisions') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/decisions?select=*&order=created_at.desc`, { headers: sbHeaders });
      const rows = await res.json();
      const mapped = rows.map(r => ({
        ...r,
        meetingId: r.meeting_id,
        meetingTitle: r.meeting_title,
        proposedBy: r.proposed_by,
        approvedBy: r.approved_by,
        supersededBy: r.superseded_by,
        confidenceScore: r.confidence_score
      }));
      return jsonResponse(mapped);
    }

    // POST /api/decisions
    if (req.method === 'POST' && pathname === '/api/decisions') {
      const body = await req.json();
      const id = body.id || `dec-${Date.now().toString(36)}`;
      const record = {
        id,
        meeting_id: body.meetingId || body.meeting_id,
        meeting_title: body.meetingTitle || body.meeting_title,
        date: body.date,
        title: body.title,
        details: body.details,
        category: body.category || 'architecture',
        impact: body.impact || 'medium',
        proposed_by: body.proposedBy || body.proposed_by,
        approved_by: body.approvedBy || body.approved_by,
        quote: body.quote,
        status: body.status || 'active'
      };
      await fetch(`${SUPABASE_URL}/rest/v1/decisions`, { method: 'POST', headers: sbHeaders, body: JSON.stringify(record) });
      return jsonResponse({ success: true, id });
    }

    // GET /api/actions
    if (req.method === 'GET' && pathname === '/api/actions') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/action_items?select=*&order=created_at.desc`, { headers: sbHeaders });
      const rows = await res.json();
      const mapped = rows.map(r => ({
        ...r,
        meetingId: r.meeting_id,
        meetingTitle: r.meeting_title,
        ticketId: r.ticket_id
      }));
      return jsonResponse(mapped);
    }

    // POST /api/actions
    if (req.method === 'POST' && pathname === '/api/actions') {
      const body = await req.json();
      const id = body.id || `act-${Date.now().toString(36)}`;
      const randomTicketNum = Math.floor(100 + Math.random() * 900);
      const ticketId = body.ticketId || `ENG-${randomTicketNum}`;
      const record = {
        id,
        meeting_id: body.meetingId || body.meeting_id || 'meet-01',
        meeting_title: body.meetingTitle || body.meeting_title || 'Sprint 42: Architecture & Roadmap Alignment',
        title: body.title,
        description: body.description || '',
        owner: body.owner || 'Unassigned',
        deadline: body.deadline || new Date().toISOString().split('T')[0],
        priority: body.priority || 'medium',
        status: body.status || 'todo',
        quote: body.quote || 'Created from execution board',
        ticket_id: ticketId,
        platform: body.platform || 'Linear'
      };
      await fetch(`${SUPABASE_URL}/rest/v1/action_items`, { method: 'POST', headers: sbHeaders, body: JSON.stringify(record) });
      return jsonResponse({
        success: true,
        action: {
          ...record,
          meetingId: record.meeting_id,
          meetingTitle: record.meeting_title,
          ticketId: record.ticket_id
        }
      });
    }

    // PUT /api/actions/:id
    if (req.method === 'PUT' && pathname.startsWith('/api/actions/')) {
      const id = pathname.replace('/api/actions/', '');
      const body = await req.json();
      const updates = {};
      if (body.status !== undefined) updates.status = body.status;
      if (body.owner !== undefined) updates.owner = body.owner;
      if (body.deadline !== undefined) updates.deadline = body.deadline;
      if (body.priority !== undefined) updates.priority = body.priority;
      if (body.title !== undefined) updates.title = body.title;

      await fetch(`${SUPABASE_URL}/rest/v1/action_items?id=eq.${id}`, {
        method: 'PATCH',
        headers: sbHeaders,
        body: JSON.stringify(updates)
      });
      return jsonResponse({ success: true, id });
    }

    // DELETE /api/actions/:id
    if (req.method === 'DELETE' && pathname.startsWith('/api/actions/')) {
      const id = pathname.replace('/api/actions/', '');
      await fetch(`${SUPABASE_URL}/rest/v1/action_items?id=eq.${id}`, { method: 'DELETE', headers: sbHeaders });
      return jsonResponse({ success: true, id });
    }

    // GET /api/conflicts
    if (req.method === 'GET' && pathname === '/api/conflicts') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/conflicts?select=*&order=created_at.desc`, { headers: sbHeaders });
      const rows = await res.json();
      const mapped = rows.map(r => ({
        ...r,
        newMeetingId: r.new_meeting_id,
        newMeetingTitle: r.new_meeting_title,
        newSpeaker: r.new_speaker,
        newQuote: r.new_quote,
        newTimestamp: r.new_timestamp,
        conflictingDecisionId: r.conflicting_decision_id,
        conflictingDecisionTitle: r.conflicting_decision_title,
        priorDecisionDate: r.prior_decision_date,
        priorMeetingTitle: r.prior_meeting_title,
        priorSpeaker: r.prior_speaker,
        priorQuote: r.prior_quote,
        resolutionStatus: r.resolution_status,
        resolutionNote: r.resolution_note
      }));
      return jsonResponse(mapped);
    }

    // POST /api/conflicts/resolve
    if (req.method === 'POST' && pathname === '/api/conflicts/resolve') {
      const body = await req.json();
      const { conflictId, resolutionStatus, note } = body;
      await fetch(`${SUPABASE_URL}/rest/v1/conflicts?id=eq.${conflictId}`, {
        method: 'PATCH',
        headers: sbHeaders,
        body: JSON.stringify({ resolution_status: resolutionStatus, resolution_note: note || '' })
      });

      if (resolutionStatus === 'overridden') {
        const confRes = await fetch(`${SUPABASE_URL}/rest/v1/conflicts?id=eq.${conflictId}&select=*`, { headers: sbHeaders });
        const confRows = await confRes.json();
        if (confRows.length > 0 && confRows[0].conflicting_decision_id) {
          await fetch(`${SUPABASE_URL}/rest/v1/decisions?id=eq.${confRows[0].conflicting_decision_id}`, {
            method: 'PATCH',
            headers: sbHeaders,
            body: JSON.stringify({
              status: 'superseded',
              superseded_by: `Overridden in ${confRows[0].new_meeting_title}`
            })
          });
        }
      }
      return jsonResponse({ success: true, conflictId, resolutionStatus });
    }

    // POST /api/reset
    if (req.method === 'POST' && pathname === '/api/reset') {
      await fetch(`${SUPABASE_URL}/rest/v1/conflicts?id=neq.none`, { method: 'DELETE', headers: sbHeaders });
      await fetch(`${SUPABASE_URL}/rest/v1/action_items?id=neq.none`, { method: 'DELETE', headers: sbHeaders });
      await fetch(`${SUPABASE_URL}/rest/v1/decisions?id=neq.none`, { method: 'DELETE', headers: sbHeaders });
      await fetch(`${SUPABASE_URL}/rest/v1/meetings?id=neq.none`, { method: 'DELETE', headers: sbHeaders });
      return jsonResponse({ success: true, message: 'All tables reset' });
    }

    return jsonResponse({ error: 'Endpoint not found' }, 404);
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
};

export const config = {
  path: "/api/*"
};
