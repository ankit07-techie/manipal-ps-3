export type ClauseCategory =
  | 'data_collection'
  | 'purpose_specification'
  | 'third_party_sharing'
  | 'retention_period'
  | 'consent_and_choices'
  | 'consumer_rights'
  | 'security_practices'
  | 'grievance_contact'
  | 'other';

export type InformationState =
  | 'stated'
  | 'unclear'
  | 'not_found_in_analysed_text'
  | 'requires_review';

export type EvidenceStatus =
  | 'verified'
  | 'approximate'
  | 'unverified';

export interface StatutoryReference {
  statute: string;
  section: string;
  title: string;
  summary: string;
  official_url?: string;
}

export interface AnalysedClause {
  clause_id: string;
  category: ClauseCategory;
  category_label: string;
  plain_language_explanation: string;
  original_text?: string;
  evidence_quote: string;
  source_reference: string;
  evidence_status: EvidenceStatus;
  information_state: InformationState;
  confidence_score?: number;
  potential_question?: string;
  legal_reference?: StatutoryReference;
  risk_level?: 'low' | 'moderate' | 'high' | 'neutral';
  suggested_action?: string;
}

export interface PolicyAnalysisResult {
  analysis_id: string;
  source_label: string;
  created_at: string;
  character_count: number;
  raw_text_preview: string;
  is_truncated?: boolean;
  unanalysed_chars_count?: number;
  processing_notes?: string;
  summary: {
    total_clauses: number;
    categories_present: ClauseCategory[];
    missing_or_unclear_categories: ClauseCategory[];
    evidence_verification_rate: number;
    primary_concerns_count: number;
  };
  clauses: AnalysedClause[];
  disclaimer: string;
}

export type PreferenceStatus =
  | 'local_record'
  | 'pending_manual_send'
  | 'externally_confirmed'
  | 'revoked';

export interface PreferenceRecord {
  id: string;
  service_name: string;
  preference_key: string;
  title: string;
  description: string;
  current_value: boolean | string;
  default_value: boolean | string;
  status: PreferenceStatus;
  is_demo: boolean;
  status_explanation: string;
  created_at: string;
  updated_at: string;
  last_action_timestamp: string;
}

export type ConcernType =
  | 'unclear_sharing'
  | 'excessive_collection'
  | 'consent_withdrawal'
  | 'data_erasure'
  | 'grievance_inquiry'
  | 'unauthorized_tracking'
  | 'other';

export interface RedressalDraft {
  draft_id: string;
  concern_type: ConcernType;
  service_name: string;
  recipient_email: string;
  subject: string;
  body: string;
  statutory_citations: StatutoryReference[];
  referenced_clauses: {
    clause_id: string;
    category: ClauseCategory;
    evidence_quote: string;
    plain_language_explanation: string;
  }[];
  disclaimer: string;
  created_at: string;
}

export type RequestStatus =
  | 'draft'
  | 'saved'
  | 'sent_manually'
  | 'acknowledged_by_service'
  | 'under_review'
  | 'in_progress'
  | 'follow_up_required'
  | 'resolved'
  | 'escalated';

export interface RequestTimelineEvent {
  event_id: string;
  request_id: string;
  event_type: 'created' | 'draft_edited' | 'marked_as_sent' | 'response_received' | 'status_changed' | 'note_added';
  timestamp: string;
  description: string;
  notes?: string;
  actor: 'consumer' | 'system';
}

export interface ConsumerRequestRecord {
  id: string;
  draft_id?: string;
  service_name: string;
  recipient_email: string;
  concern_type: ConcernType;
  status: RequestStatus;
  subject: string;
  body_content: string;
  created_at: string;
  updated_at: string;
  events: RequestTimelineEvent[];
}
