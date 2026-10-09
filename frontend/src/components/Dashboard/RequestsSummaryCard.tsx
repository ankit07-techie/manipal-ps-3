import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { ConsumerRequestRecord } from '../../types';

interface RequestsSummaryCardProps {
  requests: ConsumerRequestRecord[];
  onSeeAll: () => void;
  onSelectRequest: (req: ConsumerRequestRecord) => void;
}

export const RequestsSummaryCard: React.FC<RequestsSummaryCardProps> = ({
  requests,
  onSeeAll,
  onSelectRequest,
}) => {
  const displayRequests = requests.length > 0 ? requests.slice(0, 3) : [
    {
      id: 'REQ-003',
      service_name: 'Zomato',
      concern_type: 'data_erasure' as const,
      status: 'in_progress' as any,
      subject: 'Data Deletion under DPDP Sec 12',
      body_content: '',
      recipient_email: 'grievance@zomato.com',
      created_at: new Date().toISOString(),
      updated_at: '5 Oct 2026',
      events: [],
    },
    {
      id: 'REQ-002',
      service_name: 'Spotify',
      concern_type: 'consent_withdrawal' as const,
      status: 'resolved' as any,
      subject: 'Consent Update under DPDP Sec 6(4)',
      body_content: '',
      recipient_email: 'privacy@spotify.com',
      created_at: new Date().toISOString(),
      updated_at: '28 Sep 2026',
      events: [],
    },
    {
      id: 'REQ-001',
      service_name: 'Google',
      concern_type: 'grievance_inquiry' as const,
      status: 'under_review' as any,
      subject: 'Data Access Request',
      body_content: '',
      recipient_email: 'grievance@google.com',
      created_at: new Date().toISOString(),
      updated_at: '20 Sep 2026',
      events: [],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'in_progress':
      case 'sent_manually':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'under_review':
      case 'acknowledged_by_service':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'resolved': return 'Resolved';
      case 'in_progress':
      case 'sent_manually': return 'In Progress';
      case 'under_review':
      case 'acknowledged_by_service': return 'Under Review';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Your Requests</h3>
          </div>
          <button
            onClick={onSeeAll}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                <th className="pb-3 font-semibold text-slate-400">ID</th>
                <th className="pb-3 font-semibold text-slate-400">Request Type</th>
                <th className="pb-3 font-semibold text-slate-400">Organisation</th>
                <th className="pb-3 font-semibold text-slate-400">Status</th>
                <th className="pb-3 font-semibold text-slate-400 text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayRequests.map((r) => {
                const badge = getStatusBadge(r.status);
                const label = getStatusLabel(r.status);
                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectRequest(r as any)}
                    className="group cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 font-semibold text-slate-700 group-hover:text-sky-600 transition-colors">
                      {r.id}
                    </td>
                    <td className="py-3 text-slate-700">
                      {r.concern_type === 'data_erasure'
                        ? 'Data Deletion'
                        : r.concern_type === 'consent_withdrawal'
                        ? 'Consent Update'
                        : 'Data Access'}
                    </td>
                    <td className="py-3 font-medium text-slate-800">{r.service_name}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${badge}`}>
                        {label}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-right">
                      {typeof r.updated_at === 'string' && r.updated_at.includes('T')
                        ? new Date(r.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : r.updated_at}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

