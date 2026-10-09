import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { HeroBanner } from './components/Dashboard/HeroBanner';
import { StepFlowBar } from './components/Dashboard/StepFlowBar';
import { AnalyzePolicyCard } from './components/Dashboard/AnalyzePolicyCard';
import { RecentAnalysesCard } from './components/Dashboard/RecentAnalysesCard';
import { ConsentQuickCard } from './components/Dashboard/ConsentQuickCard';
import { RequestsSummaryCard } from './components/Dashboard/RequestsSummaryCard';
import { KnowledgePromoCard } from './components/Dashboard/KnowledgePromoCard';
import { PolicyAnalyzerView } from './components/Analyze/PolicyAnalyzerView';
import { ConsentManagerView } from './components/Consent/ConsentManagerView';
import { RaiseRequestView } from './components/Redressal/RaiseRequestView';
import { TrackRequestsView } from './components/Tracker/TrackRequestsView';
import { KnowledgeHubView } from './components/Knowledge/KnowledgeHubView';
import { HowItWorksModal } from './components/Modal/HowItWorksModal';
import { AnalysedClause, ConsumerRequestRecord } from './types';
import { getRequests } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [requests, setRequests] = useState<ConsumerRequestRecord[]>([]);

  // State to pass from Analyzer to Redressal Studio
  const [selectedClauseForRedressal, setSelectedClauseForRedressal] = useState<AnalysedClause | null>(null);
  const [selectedServiceForRedressal, setSelectedServiceForRedressal] = useState<string>('');

  // State for loaded policy in Analyzer
  const [presetPolicyText, setPresetPolicyText] = useState<string>('');
  const [presetPolicyLabel, setPresetPolicyLabel] = useState<string>('');

  useEffect(() => {
    getRequests()
      .then((data) => setRequests(data))
      .catch((err) => console.log('Could not load initial requests:', err));
  }, []);

  const handleSelectRecentPolicy = (text: string, title: string) => {
    setPresetPolicyText(text);
    setPresetPolicyLabel(title);
    setActiveTab('analyze');
  };

  const handleRaiseRequestWithClause = (clause: AnalysedClause, serviceName: string) => {
    setSelectedClauseForRedressal(clause);
    setSelectedServiceForRedressal(serviceName);
    setActiveTab('raise');
  };

  const handleStepFlowClick = (stepIndex: number) => {
    if (stepIndex === 1 || stepIndex === 2) {
      setActiveTab('analyze');
    } else if (stepIndex === 3) {
      setActiveTab('consent');
    } else if (stepIndex === 4) {
      setActiveTab('raise');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-slate-800">
      {/* Sidebar matching NyayaNet */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onNavigateTab={setActiveTab} />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <HeroBanner
                onAnalyzeClick={() => setActiveTab('analyze')}
                onHowItWorksClick={() => setIsHowItWorksOpen(true)}
              />

              {/* Step Flow Bar */}
              <StepFlowBar onStepClick={handleStepFlowClick} />

              {/* 3-Column Primary Widget Row from Mockup */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnalyzePolicyCard
                  onAnalyzeFile={(file) => {
                    setActiveTab('analyze');
                  }}
                  onAnalyzeText={(text, label) => {
                    setPresetPolicyText(text);
                    setPresetPolicyLabel(label);
                    setActiveTab('analyze');
                  }}
                  isAnalyzing={false}
                />

                <RecentAnalysesCard
                  onSelectPolicy={handleSelectRecentPolicy}
                  onSeeAll={() => setActiveTab('analyze')}
                />

                <ConsentQuickCard
                  onManageClick={() => setActiveTab('consent')}
                />
              </div>

              {/* Bottom 2-Column Row from Mockup */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RequestsSummaryCard
                  requests={requests}
                  onSeeAll={() => setActiveTab('track')}
                  onSelectRequest={(req) => setActiveTab('track')}
                />

                <KnowledgePromoCard
                  onExploreClick={() => setActiveTab('knowledge')}
                />
              </div>
            </div>
          )}

          {activeTab === 'analyze' && (
            <PolicyAnalyzerView
              initialText={presetPolicyText}
              initialLabel={presetPolicyLabel}
              onRaiseRequestWithClause={handleRaiseRequestWithClause}
            />
          )}

          {activeTab === 'consent' && (
            <ConsentManagerView
              onDispatchOptOuts={(prefs) => {
                setActiveTab('raise');
              }}
            />
          )}

          {activeTab === 'raise' && (
            <RaiseRequestView
              initialClause={selectedClauseForRedressal}
              initialService={selectedServiceForRedressal}
              onSavedRequest={(requestId) => {
                setActiveTab('track');
              }}
            />
          )}

          {activeTab === 'track' && <TrackRequestsView />}

          {activeTab === 'knowledge' && <KnowledgeHubView />}

          {activeTab === 'settings' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs max-w-2xl">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Application Settings</h2>
              <p className="text-xs text-slate-500 mb-6">
                Configure your PrivacyLens environment and storage options.
              </p>
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-800">Storage Mode</span>
                    <div className="text-slate-500 text-[11px]">Local In-Memory / Standalone Demo</div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-full text-[10px]">
                    ACTIVE
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-800">Data Protection Framework</span>
                    <div className="text-slate-500 text-[11px]">DPDP Act 2023 & DPDP Rules 2025 (India)</div>
                  </div>
                  <span className="px-2.5 py-1 bg-sky-100 text-sky-700 font-bold rounded-full text-[10px]">
                    ENFORCED
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs max-w-2xl">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Help & Hackathon Support</h2>
              <p className="text-xs text-slate-500 mb-6">
                Assistance and guidance for the National Legal Hackathon 2.0 evaluation.
              </p>
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>PrivacyLens / NyayaNet</strong> is designed to address Problem Statement 3: <em>"Consumer Data, Consent and the Right to Seek Redressal"</em>.
                </p>
                <p>
                  To conduct a demonstration:
                </p>
                <ol className="list-decimal pl-5 space-y-1.5 font-medium">
                  <li>Navigate to <strong>Analyze Policy</strong> and load any sample policy or paste your own.</li>
                  <li>Inspect the verified quotes with <span className="text-emerald-600 font-bold">VERIFIED QUOTE</span> badges.</li>
                  <li>Click <strong>"Raise Concern on Clause"</strong> to open the Redressal Studio.</li>
                  <li>Generate and review the editable DPDP Act draft, then click <strong>"Save to Tracked Requests"</strong>.</li>
                  <li>Inspect the timeline and audit events under <strong>Track Requests</strong>.</li>
                </ol>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* How it works modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </div>
  );
}
