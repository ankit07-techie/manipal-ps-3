import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Send,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Download,
} from 'lucide-react';
import { ConsumerRequestRecord } from '../../types';
import { getRequests, addRequestEvent, deleteRequest } from '../../services/api';

export const TrackRequestsView: React.FC = () => {
  const [requests, setRequests] = useState<ConsumerRequestRecord[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ConsumerRequestRecord | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getRequests();
      setRequests(data);
      if (data.length > 0 && !selectedRequest) {
        setSelectedRequest(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAddEvent = async (statusChange?: string) => {
    if (!selectedRequest) return;
    try {
      const desc = statusChange === 'sent_manually'
        ? 'Dispatched manually via email by consumer'
        : statusChange === 'resolved'
        ? 'Resolution or acknowledgement received from company'
        : newNote || 'Note appended to timeline';

      const updated = await addRequestEvent(selectedRequest.id, {
        event_type: statusChange ? 'status_changed' : 'note_added',
        description: desc,
        notes: newNote,
        statusChange,
      });

      setSelectedRequest(updated);
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setNewNote('');
    } catch (err: any) {
      alert('Failed to update event: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tracked request? This permanently deletes stored communication records.')) return;
    try {
      await deleteRequest(id);
      const remaining = requests.filter((r) => r.id !== id);
      setRequests(remaining);
      setSelectedRequest(remaining[0] || null);
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleExportJSON = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportDate: new Date().toISOString(),
            totalRequests: requests.length,
            requests: requests.map((r) => ({
              id: r.id,
              service_name: r.service_name,
              recipient_email: r.recipient_email,
              concern_type: r.concern_type,
              status: r.status,
              subject: r.subject,
              created_at: r.created_at,
              updated_at: r.updated_at,
              events_count: r.events.length,
              events: r.events,
            })),
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyayanet-requests-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="text-xs font-bold text-sky-700 tracking-wider uppercase mb-1">
            TIMELINE & AUDIT TRAIL
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Track Grievance Requests & Responses
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Audit the progress of your data subject inquiries, sent dates, company responses, and escalation timelines.
          </p>
        </div>

        {requests.length > 0 && (
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors shrink-0"
            title="Download portable JSON audit record of your submitted requests"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Request Audit (JSON)</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Request List Column */}
        <div className="lg:col-span-5 space-y-3">
          {requests.map((req) => {
            const isSelected = selectedRequest?.id === req.id;
            return (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-sky-50/70 border-sky-300 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">{req.service_name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {req.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-medium line-clamp-1 mb-2">
                  {req.subject}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>ID: {req.id}</span>
                  <span>{new Date(req.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            );
          })}

          {requests.length === 0 && !isLoading && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No tracked requests yet. Use "Raise a Request" to generate and save drafts.
            </div>
          )}
        </div>

        {/* Selected Request Detail Column */}
        <div className="lg:col-span-7">
          {selectedRequest ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Request Reference: {selectedRequest.id}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedRequest.subject}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    To: <span className="font-semibold text-slate-700">{selectedRequest.recipient_email}</span> ({selectedRequest.service_name})
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(selectedRequest.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete Request Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Status Progression Bar */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2">Progress Status:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAddEvent('draft')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      selectedRequest.status === 'draft'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    onClick={() => handleAddEvent('sent_manually')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      selectedRequest.status === 'sent_manually'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Mark as Sent
                  </button>
                  <button
                    onClick={() => handleAddEvent('acknowledged_by_service')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      selectedRequest.status === 'acknowledged_by_service'
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Acknowledged by Company
                  </button>
                  <button
                    onClick={() => handleAddEvent('resolved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      selectedRequest.status === 'resolved'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              {/* Append-Only Timeline Events */}
              <div>
                <div className="text-xs font-bold text-slate-800 mb-3">
                  Event Timeline & Response Notes:
                </div>
                <div className="space-y-3 relative pl-4 border-l-2 border-slate-200">
                  {selectedRequest.events.map((event) => (
                    <div key={event.event_id} className="relative text-xs">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-white" />
                      <div className="font-semibold text-slate-800">
                        {event.description}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(event.timestamp).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })} • Actor: {event.actor}
                      </div>
                      {event.notes && (
                        <div className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                          {event.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Note Input */}
              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record company response reference or custom note..."
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <button
                  onClick={() => handleAddEvent()}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
              Select a request on the left to view timeline history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
