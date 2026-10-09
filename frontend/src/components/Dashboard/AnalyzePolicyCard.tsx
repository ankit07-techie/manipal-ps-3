import React, { useState } from 'react';
import { UploadCloud, Link as LinkIcon, ArrowRight, FileText, Loader2 } from 'lucide-react';

interface AnalyzePolicyCardProps {
  onAnalyzeFile: (file: File) => void;
  onAnalyzeText: (text: string, label: string) => void;
  isAnalyzing: boolean;
}

export const AnalyzePolicyCard: React.FC<AnalyzePolicyCardProps> = ({
  onAnalyzeFile,
  onAnalyzeText,
  isAnalyzing,
}) => {
  const [pasteInput, setPasteInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onAnalyzeFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAnalyzeFile(e.target.files[0]);
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pasteInput.trim()) {
      onAnalyzeText(pasteInput, 'Submitted Notice / Link');
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Analyze a Privacy Policy</h3>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Upload a policy to get clear, simple explanations of how your data is collected, used and shared.
        </p>

        {/* Drag and Drop Zone from Mockup */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            dragActive
              ? 'border-sky-500 bg-sky-50/50'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <input
            type="file"
            id="policy-file-input"
            accept=".pdf,.txt,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-10 h-10 rounded-full bg-white shadow-2xs border border-slate-200/80 mx-auto flex items-center justify-center text-sky-600 mb-3">
            <UploadCloud className="w-5 h-5" />
          </div>

          <div className="text-xs font-semibold text-slate-800 mb-0.5">
            Drag and drop a file here
          </div>
          <div className="text-[11px] text-slate-400 mb-3">
            PDF, DOCX, TXT (Max 10 MB)
          </div>

          <label
            htmlFor="policy-file-input"
            className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
          >
            Browse Files
          </label>
        </div>

        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <span className="relative bg-white px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            or
          </span>
        </div>

        {/* Link / Quick Paste Bar from Mockup */}
        <form onSubmit={handleQuickSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <LinkIcon className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={pasteInput}
            onChange={(e) => setPasteInput(e.target.value)}
            placeholder="Paste policy text or link (e.g. website URL)"
            className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
          <button
            type="submit"
            disabled={isAnalyzing || !pasteInput.trim()}
            className="absolute inset-y-1 right-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 disabled:hover:bg-slate-900 flex items-center justify-center transition-colors"
          >
            {isAnalyzing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
