import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Download,
  Send,
  User,
  MapPin,
  Share2,
  Laptop,
  CheckCircle2,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { PreferenceRecord } from '../../types';
import { getPreferences, updatePreference } from '../../services/api';

interface ConsentManagerViewProps {
  onDispatchOptOuts: (preferences: PreferenceRecord[]) => void;
}

export const ConsentManagerView: React.FC<ConsentManagerViewProps> = ({ onDispatchOptOuts }) => {
  const [preferences, setPreferences] = useState<PreferenceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  const loadPrefs = async () => {
    setIsLoading(true);
    try {
      const data = await getPreferences();
      setPreferences(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrefs();
  }, []);

  const handleToggle = async (id: string, currentValue: boolean | string) => {
    const nextVal = typeof currentValue === 'boolean' ? !currentValue : false;
    try {
      const updated = await updatePreference(id, {
        current_value: nextVal,
        status: 'local_record',
        status_explanation: 'Locally recorded preference. An opt-out request draft has not yet been submitted to the company.',
      });
      setPreferences((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setSaveSuccessMessage('Preference record updated locally.');
      setTimeout(() => setSaveSuccessMessage(''), 3000);
    } catch (err: any) {
      alert('Failed to update preference: ' + err.message);
    }
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify({ exportDate: new Date().toISOString(), preferences }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacylens-consent-record-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-1">
            CONSUMER PREFERENCE & CONSENT RECORDS
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            My Consent & Data Preferences
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Set and audit your personal privacy preferences across digital services with transparent status tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Record</span>
          </button>
          <button
            onClick={() => onDispatchOptOuts(preferences.filter((p) => !p.current_value))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 transition-all hover:translate-y-[-1px]"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>Dispatch Opt-Out Drafts</span>
          </button>
        </div>
      </div>

      {/* Honest State Disclaimer Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Transparency Notice:</strong> All toggles below reflect your local preference choices. Because third-party platforms do not offer standardized public APIs for real-time consent synchronization, modifying a toggle here records your intent locally. To legally enforce an opt-out, use the Redressal Studio to generate a formal communication under DPDP Act 2023 Section 6(4).
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Preferences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {preferences.map((pref) => {
          const isEnabled = Boolean(pref.current_value);
          return (
            <div
              key={pref.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {pref.service_name}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                    {pref.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{pref.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {pref.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    Status: <span className="font-semibold text-slate-800">{isEnabled ? 'Allowed' : 'Opted Out'}</span>
                  </div>

                  <button
                    onClick={() => handleToggle(pref.id, pref.current_value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isEnabled
                        ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {isEnabled ? 'ALLOWING' : 'OPTED OUT'}
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 italic">
                  {pref.status_explanation}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
