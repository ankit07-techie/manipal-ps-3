import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Scale,
  MessageSquarePlus,
  Search,
  Filter,
  Eye,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Check,
  ExternalLink,
} from 'lucide-react';
import { PolicyAnalysisResult, AnalysedClause, ClauseCategory, InformationState } from '../../types';
import { SAMPLE_POLICIES, analyzePolicy } from '../../services/api';

interface PolicyAnalyzerViewProps {
  initialText?: string;
  initialLabel?: string;
  onRaiseRequestWithClause: (clause: AnalysedClause, serviceName: string) => void;
}

export const PolicyAnalyzerView: React.FC<PolicyAnalyzerViewProps> = ({
  initialText = '',
  initialLabel = '',
  onRaiseRequestWithClause,
}) => {
  const [inputText, setInputText] = useState(initialText || SAMPLE_POLICIES[0].text);
  const [sourceLabel, setSourceLabel] = useState(initialLabel || SAMPLE_POLICIES[0].title);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PolicyAnalysisResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [showRawText, setShowRawText] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRunAnalysis = async (textToAnalyze?: string, labelToAnalyze?: string) => {
    const text = textToAnalyze !== undefined ? textToAnalyze : inputText;
    const label = labelToAnalyze !== undefined ? labelToAnalyze : sourceLabel;

    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const result = await analyzePolicy({ text, source_label: label });
      setAnalysisResult(result);
    } catch (err: any) {
      alert('Analysis Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSourceLabel(file.name);
      setIsLoading(true);
      try {
        const result = await analyzePolicy({ file, source_label: file.name });
        setAnalysisResult(result);
        setInputText(result.raw_text_preview);
      } catch (err: any) {
        alert('File Analysis Error: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLoadSample = (sample: typeof SAMPLE_POLICIES[0]) => {
    setInputText(sample.text);
    setSourceLabel(sample.title);
    handleRunAnalysis(sample.text, sample.title);
  };

  // Filter clauses
  const filteredClauses = analysisResult
    ? analysisResult.clauses.filter((c) => {
        const matchCategory = selectedCategory === 'all' || c.category === selectedCategory;
        const matchState = selectedState === 'all' || c.information_state === selectedState;
        const matchSearch =
          searchQuery === '' ||
          c.plain_language_explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.evidence_quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category_label.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchState && matchSearch;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="text-xs font-bold text-sky-700 tracking-wider uppercase mb-1">
            EVIDENCE-BACKED POLICY INTELLIGENCE
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Policy Analyzer & Clause Explorer
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Extract clauses, verify exact source quotations, identify omitted disclosures, and ground findings in the DPDP Act 2023.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Load Preset:</span>
          {SAMPLE_POLICIES.map((p) => (
            <button
              key={p.id}
              onClick={() => handleLoadSample(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors"
            >
              {p.category}
            </button>
          ))}
        </div>
      </div>

      {/* Input Section if no analysis or editing */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Policy Document Text or Contract Terms
              </label>
              <input
                type="text"
                value={sourceLabel}
                onChange={(e) => setSourceLabel(e.target.value)}
                placeholder="Source / Company Label"
                className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              />
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              placeholder="Paste privacy policy text here..."
              className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-400">
                {inputText.length} characters • Zero data retained by default
              </div>

              <button
                onClick={() => handleRunAnalysis()}
                disabled={isLoading || !inputText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                    <span>Analyzing & Verifying Evidence...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span>Run Policy Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="flex flex-col justify-center items-center border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-xl p-6 text-center hover:border-slate-300 transition-colors">
            <input
              type="file"
              id="analyze-file-upload"
              accept=".pdf,.txt,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-sky-600 mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-slate-800 mb-1">
              Upload PDF or Text Policy
            </div>
            <div className="text-[11px] text-slate-400 mb-4 max-w-[180px]">
              Extracts text preserving page offsets and section headers
            </div>
            <label
              htmlFor="analyze-file-upload"
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
            >
              Select File
            </label>
          </div>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Metrics Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-400">Total Clauses</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {analysisResult.summary.total_clauses}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Extracted & categorized</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-400">Evidence Verification</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1 flex items-center gap-1.5">
                <span>{analysisResult.summary.evidence_verification_rate}%</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Exact source quote match</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-400">Identified Concerns</div>
              <div className="text-2xl font-extrabold text-amber-600 mt-1 flex items-center gap-1.5">
                <span>{analysisResult.summary.primary_concerns_count}</span>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Moderate/High risk clauses</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-400">Missing Disclosures</div>
              <div className="text-2xl font-extrabold text-rose-600 mt-1 flex items-center gap-1.5">
                <span>{analysisResult.summary.missing_or_unclear_categories.length}</span>
                <HelpCircle className="w-5 h-5 text-rose-500" />
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Omitted in analysed text</div>
            </div>
          </div>

          {/* Controls: Search, Category Filters, State Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search extracted clauses or keywords..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Toggle Raw Text Drawer */}
              <button
                onClick={() => setShowRawText(!showRawText)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>{showRawText ? 'Hide Raw Text' : 'View Source Text'}</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Category:
              </span>
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'data_collection', label: 'Data Collected' },
                { id: 'third_party_sharing', label: 'Sharing' },
                { id: 'retention_period', label: 'Retention' },
                { id: 'consent_and_choices', label: 'Consent' },
                { id: 'consumer_rights', label: 'Rights' },
                { id: 'grievance_contact', label: 'Grievance' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedCategory(f.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    selectedCategory === f.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <div className="w-px h-4 bg-slate-200 mx-1" />

              <span className="text-[11px] font-bold text-slate-400">State:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'stated', label: 'Stated' },
                { id: 'unclear', label: 'Unclear' },
                { id: 'not_found_in_analysed_text', label: 'Not Found' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedState(s.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    selectedState === s.id
                      ? 'bg-sky-700 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Raw Text View Drawer */}
          {showRawText && (
            <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-xs max-h-72 overflow-y-auto border border-slate-800 shadow-inner">
              <div className="text-[11px] font-bold text-sky-400 mb-2 uppercase tracking-wider">
                Raw Extracted Document Text ({analysisResult.character_count} chars)
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">{analysisResult.raw_text_preview}</pre>
            </div>
          )}

          {/* Clauses List */}
          <div className="space-y-3.5">
            {filteredClauses.map((clause) => {
              const isVerified = clause.evidence_status === 'verified';
              const isApproximate = clause.evidence_status === 'approximate';
              const isOmitted = clause.information_state === 'not_found_in_analysed_text';

              return (
                <div
                  key={clause.clause_id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {clause.category_label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({clause.source_reference})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Evidence Status Badge */}
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          VERIFIED QUOTE
                        </span>
                      ) : isApproximate ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          APPROXIMATE MATCH
                        </span>
                      ) : isOmitted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          NOT FOUND IN TEXT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          UNVERIFIED
                        </span>
                      )}

                      {/* Information State Badge */}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {clause.information_state}
                      </span>
                    </div>
                  </div>

                  {/* Plain Language Explanation */}
                  <p className="text-xs text-slate-700 leading-relaxed mb-3.5">
                    {clause.plain_language_explanation}
                  </p>

                  {/* Evidence Quote Box */}
                  {clause.evidence_quote ? (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-3 text-xs">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Exact Verbatim Evidence Quote
                      </div>
                      <blockquote className="text-slate-700 font-mono text-[11px] italic border-l-2 border-sky-500 pl-2.5">
                        "{clause.evidence_quote}"
                      </blockquote>
                    </div>
                  ) : (
                    <div className="bg-rose-50/50 border border-rose-200/60 rounded-xl p-3 mb-3 text-xs text-rose-700">
                      <strong>Document Scan:</strong> No specific clauses addressing {clause.category_label.toLowerCase()} were detected in the supplied policy text.
                    </div>
                  )}

                  {/* Statutory Legal Grounding & Suggested Action Footer */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    {clause.legal_reference ? (
                      <a
                        href={clause.legal_reference.official_url || 'https://www.meity.gov.in/content/digital-personal-data-protection-act-2023-dpdp-act'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sky-800 hover:text-sky-950 group transition-colors"
                        title="Open Official Statutory Reference on MeitY Portal"
                      >
                        <Scale className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="font-semibold underline decoration-sky-300 underline-offset-2">
                          {clause.legal_reference.statute} • {clause.legal_reference.section}:
                        </span>
                        <span className="text-slate-500 font-normal line-clamp-1 group-hover:text-slate-700">
                          {clause.legal_reference.summary}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0 opacity-70 group-hover:opacity-100" />
                      </a>
                    ) : (
                      <div />
                    )}

                    <button
                      onClick={() => onRaiseRequestWithClause(clause, sourceLabel)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition-colors shrink-0"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>Raise Concern on Clause</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredClauses.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 text-slate-400 text-xs">
                No clauses matched the selected filters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
