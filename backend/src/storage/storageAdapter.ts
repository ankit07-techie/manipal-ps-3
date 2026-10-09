import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import {
  ConsumerRequestRecord,
  PolicyAnalysisResult,
  PreferenceRecord,
  RequestStatus,
  RequestTimelineEvent,
} from '../types.js';

// Default initial consumer preferences for demonstration
export const DEFAULT_PREFERENCES: PreferenceRecord[] = [
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

interface PersistedState {
  version: string;
  last_saved: string;
  preferences: PreferenceRecord[];
  requests: ConsumerRequestRecord[];
  analyses: PolicyAnalysisResult[];
}

export class StorageAdapter {
  private storageFilePath: string | null = null;
  private preferences: Map<string, PreferenceRecord> = new Map();
  private requests: Map<string, ConsumerRequestRecord> = new Map();
  private analyses: Map<string, PolicyAnalysisResult> = new Map();

  private writeLockPromise: Promise<void> = Promise.resolve();

  constructor(customFilePath?: string | null) {
    if (customFilePath !== undefined) {
      this.storageFilePath = customFilePath;
    } else if (config.storageMode === 'file') {
      this.storageFilePath = config.storageFilePath;
    } else {
      this.storageFilePath = null;
    }

    this.initStore();
  }

  private initStore(): void {
    if (this.storageFilePath) {
      this.loadFromDisk();
    } else {
      // Memory-only mode: populate default preferences
      this.preferences.clear();
      this.requests.clear();
      this.analyses.clear();
      for (const p of DEFAULT_PREFERENCES) {
        this.preferences.set(p.id, { ...p });
      }
    }
  }

  /**
   * Safe loading with corruption detection and automated recovery
   */
  private loadFromDisk(): void {
    if (!this.storageFilePath) return;

    try {
      if (fs.existsSync(this.storageFilePath)) {
        const rawContent = fs.readFileSync(this.storageFilePath, 'utf-8').trim();
        if (rawContent) {
          const parsed: PersistedState = JSON.parse(rawContent);
          if (parsed && Array.isArray(parsed.preferences) && Array.isArray(parsed.requests)) {
            this.preferences.clear();
            for (const p of parsed.preferences) {
              if (p && p.id) {
                this.preferences.set(p.id, p);
              }
            }

            this.requests.clear();
            for (const r of parsed.requests) {
              if (r && r.id) {
                this.requests.set(r.id, r);
              }
            }

            this.analyses.clear();
            if (Array.isArray(parsed.analyses)) {
              for (const a of parsed.analyses) {
                if (a && a.analysis_id) {
                  this.analyses.set(a.analysis_id, a);
                }
              }
            }
            return;
          }
        }
      }
    } catch (err: any) {
      console.warn(`[StorageAdapter] Store at ${this.storageFilePath} is corrupted: ${err.message}. Creating backup...`);
      try {
        const backupPath = `${this.storageFilePath}.corrupt.${Date.now()}`;
        fs.renameSync(this.storageFilePath, backupPath);
      } catch (backupErr) {
        // Ignore backup failure
      }
    }

    // Initialize fresh defaults if file doesn't exist or was corrupt
    this.preferences.clear();
    this.requests.clear();
    this.analyses.clear();
    for (const p of DEFAULT_PREFERENCES) {
      this.preferences.set(p.id, { ...p });
    }
    this.saveToDisk();
  }

  /**
   * Atomic flush to disk with serialized write lock to avoid partial writes or race condition corruption
   */
  private saveToDisk(): void {
    if (!this.storageFilePath) return;

    this.writeLockPromise = this.writeLockPromise.then(() => {
      try {
        const parentDir = path.dirname(this.storageFilePath!);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }

        const state: PersistedState = {
          version: '1.0.0',
          last_saved: new Date().toISOString(),
          preferences: Array.from(this.preferences.values()),
          requests: Array.from(this.requests.values()),
          analyses: Array.from(this.analyses.values()),
        };

        const jsonStr = JSON.stringify(state, null, 2);
        const tmpPath = `${this.storageFilePath}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        fs.writeFileSync(tmpPath, jsonStr, 'utf-8');
        fs.renameSync(tmpPath, this.storageFilePath!);
      } catch (err: any) {
        console.error(`[StorageAdapter] Error saving storage to ${this.storageFilePath}:`, err.message);
      }
    });
  }

  // Analyses
  async saveAnalysis(analysis: PolicyAnalysisResult): Promise<void> {
    this.analyses.set(analysis.analysis_id, analysis);
    this.saveToDisk();
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

  async getPreferences(): Promise<PreferenceRecord[]> {
    return this.listPreferences();
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
    this.saveToDisk();
    return updated;
  }

  async createPreference(
    pref: Omit<PreferenceRecord, 'id' | 'created_at' | 'updated_at' | 'last_action_timestamp'>
  ): Promise<PreferenceRecord> {
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
    this.saveToDisk();
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

  async getRequestById(id: string): Promise<ConsumerRequestRecord | undefined> {
    return this.getRequest(id);
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
    this.saveToDisk();
    return record;
  }

  /**
   * Validates and executes state transitions across the request lifecycle:
   * draft / saved -> sent_manually -> acknowledged_by_service -> under_review / in_progress -> resolved / escalated
   */
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

    if (eventData.statusChange) {
      const current = record.status;
      const target = eventData.statusChange;

      // Disallow re-opening a permanently resolved request back to draft
      if (current === 'resolved' && target === 'draft') {
        throw new Error(`Invalid status transition: A resolved request cannot be reverted to draft.`);
      }

      record.status = target;
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

    this.requests.set(requestId, record);
    this.saveToDisk();
    return record;
  }

  async deleteRequest(id: string): Promise<boolean> {
    const result = this.requests.delete(id);
    if (result) {
      this.saveToDisk();
    }
    return result;
  }

  // Testing helper
  public _resetForTest(): void {
    this.preferences.clear();
    this.requests.clear();
    this.analyses.clear();
    for (const p of DEFAULT_PREFERENCES) {
      this.preferences.set(p.id, { ...p });
    }
    if (this.storageFilePath && fs.existsSync(this.storageFilePath)) {
      try {
        fs.unlinkSync(this.storageFilePath);
      } catch (e) {
        // ignore
      }
    }
  }
}

export const storage = new StorageAdapter();
