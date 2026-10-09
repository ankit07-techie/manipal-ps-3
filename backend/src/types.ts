// PrivacyLens Core Domain Types & Schemas

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
  | 'verified'      // Verbatim exact match found in raw source text
  | 'approximate'   // Contiguous normalized match (whitespace/punctuation difference)
  | 'unverified';   // Quote cannot be located contiguously in source text

export type DetectionSource =
  | 'llm_extracted'
  | 'deterministic_rule'
  | 'semantic_fallback';

export type UncertaintyLabel =
  | 'high_certainty'
  | 'moderate_uncertainty'
  | 'unverified_omission'
  | 'requires_human_review';

export type CommencementStatus =
  | 'in_force'
  | 'phased_commencement'
  | 'future_enforcement'
  | 'subject_to_notification';

export interface StatutoryReference {
  statute: string;
  section: string;
  title: string;
  summary: string;
  official_url?: string;
  rationale?: string;
  commencement_status?: CommencementStatus;
  commencement_details?: string;
  statutory_caveat?: string;
}

export interface SourceOffsets {
  start_char: number;
  end_char: number;
}

export interface AnalysedClause {
  clause_id: string;
  category: ClauseCategory;
  category_label: string;
  plain_language_explanation: string;
  original_text?: string;
  evidence_quote: string;
  matched_passage?: string;
  source_offsets?: SourceOffsets;
  source_reference: string;
  evidence_status: EvidenceStatus;
  information_state: InformationState;
  detection_source?: DetectionSource;
  uncertainty_label?: UncertaintyLabel;
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
    evidence_verification_rate: number; // Percentage of clauses with verified/approximate evidence
    primary_concerns_count: number;
  };
  clauses: AnalysedClause[];
  disclaimer: string;
}

export type PreferenceStatus =
  | 'local_record'        // Stored locally in user preferences
  | 'pending_manual_send' // User intends to send opt-out to company
  | 'externally_confirmed'// Officially confirmed via company integration (demo disclaimer)
  | 'revoked';

export interface PreferenceRecord {
  id: string;
  user_id?: string;
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

export interface RedressalDraftRequest {
  concern_type: ConcernType;
  service_name: string;
  recipient_name?: string;
  recipient_email?: string;
  selected_clause_ids?: string[];
  user_notes?: string;
  consumer_name?: string;
  consumer_identifier?: string;
}

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
