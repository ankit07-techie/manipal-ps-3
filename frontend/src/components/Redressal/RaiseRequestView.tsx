import React, { useState, useEffect } from 'react';
import {
  Gavel,
  FileCheck,
  Copy,
  Download,
  Save,
  Check,
  Scale,
  Sparkles,
  Loader2,
  AlertCircle,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { ConcernType, RedressalDraft, AnalysedClause } from '../../types';
import { generateDraft, createRequest } from '../../services/api';

interface RaiseRequestViewProps {
  initialClause?: AnalysedClause | null;
  initialService?: string;
  onSavedRequest: (requestId: string) => void;
}

export const RaiseRequestView: React.FC<RaiseRequestViewProps> = ({
  initialClause,
  initialService = 'QuickMart India Pvt Ltd',
  onSavedRequest,
}) => {
  const [concernType, setConcernType] = useState<ConcernType>(
    initialClause
      ? initialClause.category === 'consent_and_choices'
        ? 'consent_withdrawal'
        : initialClause.category === 'consumer_rights'
        ? 'data_erasure'
        : 'unclear_sharing'
      : 'consent_withdrawal'
  );

  const [serviceName, setServiceName] = useState(initialService || 'QuickMart India Pvt Ltd');
  const [recipientEmail, setRecipientEmail] = useState('grievance.officer@company.example');
  const [consumerName, setConsumerName] = useState('Aarav Singh');
  const [consumerId, setConsumerId] = useState('aarav.singh@example.com');
  const [userNotes, setUserNotes] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState<RedressalDraft | null>(null);
  const [editableBody, setEditableBody] = useState('');
  const [editableSubject, setEditableSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const draft = await generateDraft({
        concern_type: concernType,
        service_name: serviceName,
        recipient_email: recipientEmail,
        consumer_name: consumerName,
        consumer_identifier: consumerId,
        user_notes: userNotes,
        selected_clause_ids: initialClause ? [initialClause.clause_id] : [],
      });
      setGeneratedDraft(draft);
      setEditableSubject(draft.subject);
      setEditableBody(draft.body);
    } catch (err: any) {
      alert('Draft generation failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, [concernType]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${editableSubject}\n\n${editableBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToTracker = async () => {
    if (!editableSubject || !editableBody) return;
    setIsSaving(true);
    try {
      const saved = await createRequest({
        service_name: serviceName,
        recipient_email: recipientEmail,
        concern_type: concernType,
        subject: editableSubject,
        body_content: editableBody,
        status: 'draft',
      });
      onSavedRequest(saved.id);
    } catch (err: any) {
      alert('Failed to save request: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="text-xs font-bold text-amber-700 tracking-wider uppercase mb-1">
          REDRESSAL & GRIEVANCE COMMUNICATIONS
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Raise a Request / Grievance Studio
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Transform your privacy concerns into structured, editable communications grounded in official DPDP Act 2023 sections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameters & Evidence */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Concern & Service Details
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Type of Statutory Request:
              </label>
              <select
                value={concernType}
                onChange={(e) => setConcernType(e.target.value as ConcernType)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="consent_withdrawal">Withdrawal of Consent (DPDP Act Sec 6(4))</option>
                <option value="data_erasure">Request Data Erasure / Deletion (DPDP Act Sec 12)</option>
                <option value="unclear_sharing">Inquiry on Third-Party Sharing (DPDP Act Sec 5)</option>
                <option value="grievance_inquiry">Formal Consumer Grievance Complaint (DPDP Act Sec 13)</option>
                <option value="unauthorized_tracking">Dispute Unauthorized Telemetry / Tracking</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Company / App Name:
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Grievance Officer Email:
                </label>
                <input
                  type="text"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Consumer Name:
                </label>
                <input
                  type="text"
                  value={consumerName}
                  onChange={(e) => setConsumerName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Account Identifier / Email:
                </label>
                <input
                  type="text"
                  value={consumerId}
                  onChange={(e) => setConsumerId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Specific Consumer Facts / Notes:
              </label>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Account closed on 10th Jan, marketing emails still continuing..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Drafting Legal Text...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Regenerate Draft with Citations</span>
                </>
              )}
            </button>
          </div>

          {/* Attached Clause Preview */}
          {initialClause && (
            <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 text-xs">
              <div className="font-bold text-sky-900 mb-1 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-sky-600" />
                <span>Attached Policy Evidence Clause</span>
              </div>
              <div className="text-slate-700 mb-2 font-medium">
                {initialClause.plain_language_explanation}
              </div>
              <div className="font-mono text-[10px] bg-white p-2 rounded-lg border border-sky-200 text-slate-600 italic">
                "{initialClause.evidence_quote}"
              </div>
            </div>
          )}
        </div>

        {/* Right Preview: Editable Legal Letter & Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Editable Draft Communication
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(editableSubject)}&body=${encodeURIComponent(editableBody)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold border border-sky-200 transition-colors"
                    title="Launch your desktop email client with this drafted text"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open in Email</span>
                  </a>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleSaveToTracker}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Save className="w-3.5 h-3.5 text-sky-400" />
                    <span>Save to Tracked Requests</span>
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mb-2 italic">
                Opening an email client prepares your communication for manual dispatch; it does not confirm third-party receipt or statutory delivery.
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Subject Line:
                </label>
                <input
                  type="text"
                  value={editableSubject}
                  onChange={(e) => setEditableSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 mb-3 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Formal Letter Body (Fully Editable):
                </label>
                <textarea
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  rows={14}
                  className="w-full p-4 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Citations Footer */}
            {generatedDraft && generatedDraft.statutory_citations.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-sky-600" />
                  <span>Referenced Statutory Grounds (DPDP Act 2023)</span>
                </div>
                <div className="space-y-1.5">
                  {generatedDraft.statutory_citations.map((c, i) => (
                    <a
                      key={i}
                      href={c.official_url || 'https://www.meity.gov.in/content/digital-personal-data-protection-act-2023-dpdp-act'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-600 flex items-start gap-1.5 hover:text-sky-900 group transition-colors"
                      title={`Open official statutory provision: ${c.statute} ${c.section}`}
                    >
                      <span className="font-semibold text-sky-800 shrink-0 underline decoration-sky-300 underline-offset-2">
                        {c.statute} • {c.section}:
                      </span>
                      <span className="line-clamp-1">{c.title} — {c.summary}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600 shrink-0 opacity-70 group-hover:opacity-100 mt-0.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
