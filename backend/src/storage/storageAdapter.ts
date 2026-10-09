import { v4 as uuidv4 } from 'uuid';
import {
  ConsumerRequestRecord,
  PolicyAnalysisResult,
  PreferenceRecord,
  RequestStatus,
  RequestTimelineEvent,
} from '../types.js';

// Default initial consumer preferences for demonstration
const DEFAULT_PREFERENCES: PreferenceRecord[] = [
  {
    id: 'pref-1',
    service_name: 'E-Commerce Platform',
    preference_key: 'ad_tracking_telemetry',
    title: 'Behavioral Ad Tracking & Profiling',
    description: 'Allow third-party ad networks to track in-app browsing behavior for targeted promotions.',
    current_value: false,
    default_value: true,
    status: 'local_record',
    is_demo: true,
    status_explanation: 'Locally recorded preference. An opt-out request draft has not yet been submitted to the company.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_action_timestamp: new Date().toISOString(),
  },
  {
    id: 'pref-2',
    service_name: 'E-Commerce Platform',
    preference_key: 'precise_location',
    title: 'Precise Geolocation Sharing',
    description: 'Share continuous GPS location with delivery and analytical partners.',
    current_value: false,
    default_value: true,
    status: 'local_record',
    is_demo: true,
    status_explanation: 'Locally recorded preference. Location permissions adjusted in prototype.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_action_timestamp: new Date().toISOString(),
  },
  {
    id: 'pref-3',
    service_name: 'Financial Services App',
    preference_key: 'credit_bureau_marketing',
    title: 'Cross-selling Financial Products',
    description: 'Permit sharing credit score telemetry with banking partners for pre-approved loans.',
    current_value: false,
    default_value: true,
    status: 'local_record',
    is_demo: true,
    status_explanation: 'Locally recorded preference. Not confirmed by external financial API.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_action_timestamp: new Date().toISOString(),
  },
];

class StorageAdapter {
  private preferences: Map<string, PreferenceRecord> = new Map();
  private requests: Map<string, ConsumerRequestRecord> = new Map();
  private analyses: Map<string, PolicyAnalysisResult> = new Map();

  constructor() {
    // Populate default preferences
    for (const p of DEFAULT_PREFERENCES) {
      this.preferences.set(p.id, { ...p });
    }
  }

  // Analyses
  async saveAnalysis(analysis: PolicyAnalysisResult): Promise<void> {
    this.analyses.set(analysis.analysis_id, analysis);
  }

  async getAnalysis(id: string): Promise<PolicyAnalysisResult | undefined> {
    return this.analyses.get(id);
  }

  async listAnalyses(): Promise<PolicyAnalysisResult[]> {
    return Array.from(this.analyses.values());
  }

  // Preferences
  async listPreferences(): Promise<PreferenceRecord[]> {
    return Array.from(this.preferences.values());
  }

  async getPreference(id: string): Promise<PreferenceRecord | undefined> {
    return this.preferences.get(id);
  }

  async updatePreference(
    id: string,
    updates: Partial<Pick<PreferenceRecord, 'current_value' | 'status' | 'status_explanation'>>
  ): Promise<PreferenceRecord> {
    const existing = this.preferences.get(id);
    if (!existing) {
      throw new Error(`Preference with ID ${id} not found.`);
    }

    const updated: PreferenceRecord = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
      last_action_timestamp: new Date().toISOString(),
    };

    this.preferences.set(id, updated);
    return updated;
  }

  async createPreference(pref: Omit<PreferenceRecord, 'id' | 'created_at' | 'updated_at' | 'last_action_timestamp'>): Promise<PreferenceRecord> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const record: PreferenceRecord = {
      ...pref,
      id,
      created_at: now,
      updated_at: now,
      last_action_timestamp: now,
    };
    this.preferences.set(id, record);
    return record;
  }

  // Requests & Redressal Tracking
  async listRequests(): Promise<ConsumerRequestRecord[]> {
    return Array.from(this.requests.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getRequest(id: string): Promise<ConsumerRequestRecord | undefined> {
    return this.requests.get(id);
  }

  async createRequest(
    data: Omit<ConsumerRequestRecord, 'id' | 'created_at' | 'updated_at' | 'events'>
  ): Promise<ConsumerRequestRecord> {
    const id = `req-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    const initialEvent: RequestTimelineEvent = {
      event_id: uuidv4(),
      request_id: id,
      event_type: 'created',
      timestamp: now,
      description: `Draft inquiry created for ${data.service_name}`,
      actor: 'consumer',
    };

    const record: ConsumerRequestRecord = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
      events: [initialEvent],
    };

    this.requests.set(id, record);
    return record;
  }

  async addRequestEvent(
    requestId: string,
    eventData: {
      event_type: RequestTimelineEvent['event_type'];
      description: string;
      notes?: string;
      statusChange?: RequestStatus;
    }
  ): Promise<ConsumerRequestRecord> {
    const record = this.requests.get(requestId);
    if (!record) {
      throw new Error(`Request record ${requestId} not found.`);
    }

    const now = new Date().toISOString();
    const newEvent: RequestTimelineEvent = {
      event_id: uuidv4(),
      request_id: requestId,
      event_type: eventData.event_type,
      timestamp: now,
      description: eventData.description,
      notes: eventData.notes,
      actor: 'consumer',
    };

    record.events.push(newEvent);
    record.updated_at = now;
    if (eventData.statusChange) {
      record.status = eventData.statusChange;
    }

    this.requests.set(requestId, record);
    return record;
  }

  async deleteRequest(id: string): Promise<boolean> {
    return this.requests.delete(id);
  }
}

export const storage = new StorageAdapter();
