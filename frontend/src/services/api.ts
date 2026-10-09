import {
  PolicyAnalysisResult,
  PreferenceRecord,
  RedressalDraft,
  ConsumerRequestRecord,
  ConcernType,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export const SAMPLE_POLICIES = [
  {
    id: 'flipkart',
    title: 'Flipkart Privacy Policy',
    category: 'E-Commerce',
    riskLabel: 'Moderate Risk',
    riskColor: 'amber',
    date: '5 Oct 2026',
    text: `FLIPKART PRIVACY POLICY (INDIA)
Last Updated: October 2026

1. PERSONAL INFORMATION COLLECTED
We collect your full name, primary email address, shipping delivery address, mobile phone number, and payment instrument tokens. While you use the Flipkart platform, we automatically capture your device hardware model, operating system version, unique device identifiers, network state, and precise geolocation data.

2. USE OF COLLECTED INFORMATION
We process your personal data to facilitate product orders, coordinate courier logistics, combat unauthorized fraudulent transactions, and comply with tax reporting obligations. Subject to your affirmative opt-in consent, we process browsing histories to curate algorithmically personalized advertisements and discounts.

3. THIRD-PARTY DATA DISCLOSURES
We share consumer delivery information with third-party logistics and fulfilment partners. Aggregated and de-identified telemetry data is shared with programmatic marketing partners for conversion measurement. We do not sell your personal data for monetary consideration.

4. DATA RETENTION & STORAGE
Consumer order records and taxation documents are retained for seven (7) years in compliance with statutory Indian accounting laws. Non-essential search and telemetry logs are permanently purged within 180 days.

5. YOUR RIGHTS UNDER DPDP ACT 2023
Under the Digital Personal Data Protection Act, 2023, you retain the statutory right to request access to your personal data, seek rectification of inaccurate information, or request the erasure of personal data that is no longer necessary for the specified purpose. You may withdraw consent at any time via your account settings.

6. GRIEVANCE REDRESSAL OFFICER
In accordance with the DPDP Act 2023, please direct any privacy grievances to:
Grievance Officer: Rajesh Kumar Verma
Email: grievance.officer@flipkart.com
Address: Buildings Alyssa, Begonia & Clover, Embassy Tech Village, Outer Ring Road, Bengaluru, Karnataka, India.`,
  },
  {
    id: 'zomato',
    title: 'Zomato Privacy Policy',
    category: 'Food Delivery',
    riskLabel: 'High Risk',
    riskColor: 'rose',
    date: '2 Oct 2026',
    text: `ZOMATO PRIVACY POLICY (INDIA)
1. DATA WE COLLECT
We collect your contact details, live real-time GPS tracking data, dietary preferences, restaurant search queries, and audio call recordings made to delivery riders or support agents.

2. ADVERTISING & PROFILING
We share device identifiers, dining habits, and location histories with third-party advertisement networks and analytics vendors for cross-platform targeted marketing.

3. DATA RETENTION
We retain user account data indefinitely until an explicit account deletion request is verified and processed.

4. GRIEVANCE REDRESSAL
Nodal Grievance Officer: grievance@zomato.com. Responses are provided within 30 days as mandated under Indian IT and DPDP Rules.`,
  },
  {
    id: 'spotify',
    title: 'Spotify Privacy Policy',
    category: 'Streaming',
    riskLabel: 'Low Risk',
    riskColor: 'emerald',
    date: '28 Sep 2026',
    text: `SPOTIFY PRIVACY POLICY
1. INFORMATION COLLECTED
We collect your username, email address, listening history, playlists, and device audio configuration.

2. PURPOSE & CHOICES
Data is processed to personalize music recommendations and stream audio. You can opt out of tailored advertising in your account settings.

3. DATA ERASURE & RIGHTS
Users can download a complete copy of their data or request account deletion directly through the Privacy Settings tab.

4. GRIEVANCE OFFICER (INDIA)
Email: privacy-india@spotify.com`,
  },
  {
    id: 'google',
    title: 'Google Privacy Policy',
    category: 'Search & Cloud',
    riskLabel: 'Moderate Risk',
    riskColor: 'amber',
    date: '21 Sep 2026',
    text: `GOOGLE PRIVACY POLICY
1. INFORMATION GOOGLE COLLECTS
We collect information to provide better services, including search terms, videos watched, voice and audio information, and location data based on GPS, IP address, and sensor data.

2. WHY GOOGLE PROCESSES DATA
We use data to build better services, maintain systems, measure performance, and deliver personalized experiences.

3. EXERCISING YOUR PRIVACY CONTROLS
You can manage your privacy preferences, download your data via Google Takeout, or delete specific activity logs at any time.

4. GRIEVANCE OFFICER (INDIA)
Contact: grievance-officer-india@google.com`,
  },
];

export async function analyzePolicy(payload: { text?: string; source_label?: string; file?: File }): Promise<PolicyAnalysisResult> {
  if (payload.file) {
    const formData = new FormData();
    formData.append('file', payload.file);
    if (payload.source_label) {
      formData.append('source_label', payload.source_label);
    }
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Analysis failed');
    }
    return res.json();
  }

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: payload.text,
      source_label: payload.source_label,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Analysis failed');
  }
  return res.json();
}

export async function getPreferences(): Promise<PreferenceRecord[]> {
  const res = await fetch(`${API_BASE}/preferences`);
  if (!res.ok) throw new Error('Failed to fetch preferences');
  const data = await res.json();
  return data.preferences;
}

export async function updatePreference(id: string, updates: Partial<PreferenceRecord>): Promise<PreferenceRecord> {
  const res = await fetch(`${API_BASE}/preferences/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update preference');
  return res.json();
}

export async function generateDraft(payload: {
  concern_type: ConcernType;
  service_name: string;
  recipient_email?: string;
  consumer_name?: string;
  consumer_identifier?: string;
  user_notes?: string;
  selected_clause_ids?: string[];
}): Promise<RedressalDraft> {
  const res = await fetch(`${API_BASE}/redressal/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Draft generation failed');
  }
  return res.json();
}

export async function getRequests(): Promise<ConsumerRequestRecord[]> {
  const res = await fetch(`${API_BASE}/redressal/requests`);
  if (!res.ok) throw new Error('Failed to fetch requests');
  const data = await res.json();
  return data.requests;
}

export async function createRequest(payload: {
  service_name: string;
  recipient_email: string;
  concern_type: ConcernType;
  subject: string;
  body_content: string;
  draft_id?: string;
  status?: string;
}): Promise<ConsumerRequestRecord> {
  const res = await fetch(`${API_BASE}/redressal/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create request');
  return res.json();
}

export async function addRequestEvent(id: string, payload: {
  event_type: string;
  description: string;
  notes?: string;
  statusChange?: string;
}): Promise<ConsumerRequestRecord> {
  const res = await fetch(`${API_BASE}/redressal/requests/${id}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to add event');
  return res.json();
}

export async function deleteRequest(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/redressal/requests/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete request');
}

export async function getLegalSources(): Promise<any> {
  const res = await fetch(`${API_BASE}/legal/sources`);
  if (!res.ok) throw new Error('Failed to fetch legal sources');
  return res.json();
}
