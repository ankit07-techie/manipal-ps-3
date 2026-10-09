# PrivacyLens — System Architecture & API Specification
**National Legal Hackathon 2.0 • Problem Statement 3: Consumer Data, Consent and the Right to Seek Redressal**

---

## 1. System Overview & Component Boundaries

PrivacyLens is designed around a modular, evidence-first, backend-driven architecture. The system processes privacy policies, validates AI-extracted evidence deterministically against raw source text, manages consumer preference records, and drafts grievance communications grounded in official Indian statutory frameworks (DPDP Act, 2023 & DPDP Rules, 2025).

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client Layer (UI)                             │
│  - Policy Ingestion (Paste / PDF Upload)                                │
│  - Evidence-backed Clause Explorer with Verification Indicators        │
│  - Consumer Preference & Consent Center (Local vs External honesty)   │
│  - Redressal / Grievance Draft Studio & Timeline Tracker               │
│  - Legal Source Grounding & Caveats Viewer                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON API
┌───────────────────────────────────▼────────────────────────────────────┐
│                        Backend Service Layer                           │
│                                                                        │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │ Ingestion & Extractor  │  │ Structured AI Extraction Service     │  │
│  │ - PDF parsing (pdf-parse) │  │ - Google Gemini API via server SDK    │  │
│  │ - Text normalization   │  │ - Strict JSON Schema Constrained     │  │
│  │ - Clause segmentation  │  │   Output                            │  │
│  └───────────┬────────────┘  └──────────────────┬───────────────────┘  │
│              │                                  │                      │
│              └────────────────┬─────────────────┘                      │
│                               ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │               Evidence Verification & Quality Engine             │  │
│  │ - Deterministic exact substring search in raw text               │  │
│  │ - Whitespace / line-break normalized window search               │  │
│  │ - Verification status: [verified | approximate | unverified]     │  │
│  │ - Information state: [stated | unclear | not_found | review]     │  │
│  └────────────────────────────┬─────────────────────────────────────┘  │
│                               │                                        │
│  ┌────────────────────────────▼─────────────────────────────────────┐  │
│  │                 Redressal & Legal Grounding Engine               │  │
│  │ - Concern-to-clause evidence mapping                             │  │
│  │ - DPDP Act 2023 / DPDP Rules 2025 statutory context mapping      │  │
│  │ - Editable draft generator (inquiries, consent withdrawal, etc.) │  │
│  └────────────────────────────┬─────────────────────────────────────┘  │
│                               │                                        │
│  ┌────────────────────────────▼─────────────────────────────────────┐  │
│  │              Storage & Event History Adapter Layer               │  │
│  │ - In-Memory / File-backed demo repository (zero setup required)  │  │
│  │ - Supabase PostgreSQL Adapter (when DB credentials configured)   │  │
│  │ - Append-only request events & audit trail                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Taxonomy

Clauses extracted from privacy policies are categorized into standardized classes aligned with DPDP requirements and consumer digital transactions:

1. `data_collection`: Categories of personal and sensitive data collected (identifiers, telemetry, financial, biometrics, device data).
2. `purpose_specification`: Explicit grounds and purposes for data processing.
3. `third_party_sharing`: Third-party disclosures, SDKs, ad networks, cloud partners, cross-border transfers.
4. `retention_period`: Data retention criteria, duration, or post-purpose deletion.
5. `consent_and_choices`: Mechanisms to give, modify, or withdraw consent, opt-out choices.
6. `consumer_rights`: Access, correction, erasure, grievance redressal, and nomination rights.
7. `security_practices`: Technical and organizational security safeguards, breach notifications.
8. `grievance_contact`: Data Protection Officer (DPO) / Grievance Officer details, escalation timelines.

---

## 3. Evidence Verification Algorithm

To ensure zero hallucination and preserve trust:
1. Every plain-language clause explanation returned by the AI must include an `evidence_quote`.
2. The backend runs the quote against the unaltered extracted source text:
   - **Exact Match**: Quote exists verbatim in source text $\implies$ `evidence_status = "verified"`.
   - **Normalized Match**: Quote matches source text after punctuation/whitespace collapse $\implies$ `evidence_status = "approximate"`.
   - **Unmatched**: Quote cannot be located in source text $\implies$ `evidence_status = "unverified"`.
3. If `evidence_status == "unverified"`, the UI visibly marks the quotation as unverified and points the user to inspect the raw document text.

---

## 4. API Endpoints Contract

### 4.1 `GET /api/health`
- **Response**: `{ status: "ok", version: "1.0.0", timestamp: string, ai_configured: boolean, storage_mode: "memory" | "supabase" }`

### 4.2 `POST /api/analyze`
- **Body**: `{ text?: string, source_label?: string }` or `multipart/form-data` with `file: PDF`.
- **Response**:
  ```json
  {
    "analysis_id": "uuid",
    "source_label": "Example Services Privacy Policy",
    "created_at": "ISO-8601",
    "character_count": 14250,
    "summary": {
      "total_clauses": 12,
      "categories_present": ["data_collection", "purpose_specification", "third_party_sharing"],
      "unclear_count": 2,
      "not_found_categories": ["retention_period"]
    },
    "clauses": [
      {
        "clause_id": "c-01",
        "category": "third_party_sharing",
        "plain_language_explanation": "The company shares your location data with third-party advertisers for targeted campaigns.",
        "evidence_quote": "We may share location data with marketing partners...",
        "source_reference": "Section 4.2",
        "evidence_status": "verified",
        "information_state": "stated",
        "potential_question": "Can I opt out of sharing location data with third-party ad networks?",
        "legal_reference": {
          "statute": "DPDP Act, 2023",
          "section": "Section 6(1)",
          "summary": "Consent must be free, specific, informed, unconditional, and unambiguous with clear notice."
        }
      }
    ],
    "raw_text_preview": "..."
  }
  ```

### 4.3 `GET /api/preferences` & `POST /api/preferences`
- Manages consumer privacy preferences.
- Status values: `local_record`, `pending_action`, `externally_confirmed` (clearly disclaiming whether external synchronization is verified).

### 4.4 `POST /api/redressal/draft`
- **Body**:
  ```json
  {
    "concern_type": "unclear_sharing" | "consent_withdrawal" | "data_erasure" | "grievance_inquiry",
    "service_name": "Acme Corp",
    "recipient_email": "dpo@acme.com",
    "selected_clauses": ["c-01", "c-04"],
    "user_notes": "I requested account deletion 30 days ago, but data is still active.",
    "consumer_name": "Consumer (or Demo User)"
  }
  ```
- **Response**:
  ```json
  {
    "draft_id": "draft-uuid",
    "subject": "Data Subject Inquiry & Grievance under DPDP Act 2023 — Acme Corp",
    "body": "Formal draft with cited clauses and statutory rights under DPDP Act Section 11/12...",
    "statutory_citations": [
      {
        "act": "Digital Personal Data Protection Act, 2023",
        "section": "Section 12",
        "title": "Right to Correction and Erasure of Personal Data"
      }
    ],
    "disclaimer": "Informational draft generated by PrivacyLens. Does not constitute formal legal counsel."
  }
  ```

### 4.5 `GET /api/requests` & `POST /api/requests` & `POST /api/requests/:id/events`
- Stores and tracks communications sent by the user, status updates (`draft`, `sent_manually`, `acknowledged`, `resolved`, `escalated`), and timeline events.

### 4.6 `GET /api/legal-sources`
- Returns verified references for the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025.
