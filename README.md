# PrivacyLens (NyayaNet) ⚖️
### National Legal Hackathon 2.0 • Problem Statement 3
**Consumer Data, Consent and the Right to Seek Redressal**

---

## 🌟 Overview

**PrivacyLens (NyayaNet)** is an evidence-backed legal-tech platform built from scratch to empower digital consumers across the entire privacy lifecycle under the **Digital Personal Data Protection Act, 2023 (DPDP Act)** and **DPDP Rules, 2025**.

Moving beyond standard "AI summary" tools, PrivacyLens ensures:
1. **Deterministic Quotation Verification**: Every AI explanation is mapped to an exact source quote, verified character-by-character against raw text to eliminate hallucinations.
2. **Explicit Uncertainty & Omission Visibility**: Highlights stated clauses, flags ambiguous phrasing, and explicitly labels missing sections as `not_found_in_analysed_text`.
3. **Transparent Consent & Preference Tracking**: Separates local preference records from external company actions with honest status disclaimers.
4. **DPDP-Grounded Redressal Studio**: Converts identified privacy concerns into editable, formal inquiry and grievance letters citing DPDP Act Sections 5, 6(4), 12, and 13.
5. **Audit Trail & Response Timeline**: Maintains an append-only timeline tracking sent notices, DPO responses, and resolution milestones.

---

## 🏗️ Architecture & Component Boundaries

```
┌────────────────────────────────────────────────────────┐
│             NyayaNet React + Vite + Tailwind           │
│  - Interactive Dashboard, Policy Dropzone & Presets    │
│  - Evidence-backed Clause Explorer & Quote Badges      │
│  - Consent Preference Center & Audit Export            │
│  - Redressal Studio (Editable DPDP Grievance Letters)  │
│  - Request Timeline & Response Log Tracker             │
│  - Knowledge Hub (DPDP Act 2023 & Rules 2025 Guide)    │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP API (Port 4000)
┌───────────────────────────▼────────────────────────────┐
│              Node.js + Express + TypeScript            │
│  - Ingestion & Streaming PDF/Text Extractor            │
│  - Multi-tier Evidence Verification Matcher            │
│  - Google Gemini JSON Schema AI Extractor (+ Fallback) │
│  - DPDP Act 2023 Statutory Grounds Knowledge Hub       │
│  - Storage & Event History Adapter                     │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start & Local Execution

### 1. Prerequisites
- **Node.js** v20+ (Tested on Node v24)
- **npm** v10+

### 2. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
- API Server: `http://localhost:4000`
- Health Endpoint: `http://localhost:4000/api/health`
- Run Backend Test Suite: `npm test`

### 3. Start Frontend Client
```bash
cd frontend
npm install
npm run dev
```
- Frontend UI: `http://localhost:3000`

---

## 🧪 Automated Testing Suite

The backend includes an automated test suite verifying:
- PDF and UTF-8 document extraction with boundary preservation.
- Verbatim quote verification (`verified`, `approximate`, `unverified`).
- Hallucination rejection on fabricated quotes.
- Categorization and statutory grounding under DPDP Act 2023.
- Redressal draft generation (Consent Withdrawal Sec 6(4), Erasure Sec 12).
- Preference status honesty and timeline event tracking.

```bash
cd backend
npm test
# Result: 10 PASSED | 0 FAILED
```

---

## 📑 Walkthrough & Hackathon Demonstration Script

1. **Dashboard Overview**: Open `http://localhost:3000` to inspect the NyayaNet dashboard matching the designed privacy rights workflow.
2. **Ingest a Policy**: Click **"Analyze a Policy"** and choose a sample preset (e.g., *Flipkart*, *Zomato*, *Spotify*) or upload a PDF.
3. **Inspect Verified Quotes**: Notice how each clause displays its exact quotation with a <span style="color:#059669; font-weight:bold;">VERIFIED QUOTE</span> badge and linked DPDP section.
4. **Spot Omissions**: Check omitted disclosures flagged as `not_found_in_analysed_text`.
5. **Manage Preferences**: Open **"My Consent"** to toggle preferences with transparent local-record tracking.
6. **Raise a Grievance**: Click **"Raise Concern on Clause"** to open the Redressal Studio. Generate an editable grievance draft citing DPDP Act Section 6(4) or Section 12, copy or save it to tracked requests.
7. **Track Resolution**: Open **"Track Requests"** to audit the chronological timeline of notices and responses.

---

## ⚖️ Legal & Responsible-Use Notice

PrivacyLens is an informational prototype developed for **National Legal Hackathon 2.0**. It does not replace formal legal counsel or official regulatory grievance portals. All DPDP Act citations are cross-referenced with official Government of India Gazette notifications.
