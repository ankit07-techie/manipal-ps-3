import { ClauseCategory, InformationState } from '../../src/types.js';

export interface GroundTruthClause {
  category: ClauseCategory;
  expected_state: InformationState;
  expected_quote_snippet?: string;
  is_omission?: boolean;
}

export interface BenchmarkPolicyFixture {
  policy_id: string;
  service_name: string;
  sector: 'e_commerce' | 'fintech' | 'food_delivery' | 'streaming' | 'mobility' | 'edtech';
  document_text: string;
  ground_truth_clauses: GroundTruthClause[];
}

export const EVALUATION_BENCHMARK_DATASET: BenchmarkPolicyFixture[] = [
  {
    policy_id: 'in-ecom-01',
    service_name: 'BharatKart Retail',
    sector: 'e_commerce',
    document_text: `BHARATKART PRIVACY NOTICE
1. DATA WE COLLECT
We collect your full name, primary email address, shipping delivery address, mobile phone number, and payment tokens. We automatically collect device telemetry including IP addresses and GPS coordinates.

2. PURPOSE OF PROCESSING
We process your personal information for order fulfilment, delivery logistics, account verification, and preventing fraudulent orders.

3. THIRD-PARTY SHARING
We share your delivery address with logistics partners. We do not sell your personal data to marketing brokers.

4. DATA RETENTION
We retain order details for 7 years in compliance with applicable Indian commercial and tax laws.

5. YOUR RIGHTS UNDER DPDP ACT 2023
You have the right to access, correct, or request erasure of your personal data. You may withdraw consent via account settings.

6. GRIEVANCE OFFICER
Grievance Officer: Vikram Anand, Email: grievance@bharatkart.in, Address: Bangalore, India.`,
    ground_truth_clauses: [
      { category: 'data_collection', expected_state: 'stated', expected_quote_snippet: 'We collect your full name' },
      { category: 'purpose_specification', expected_state: 'stated', expected_quote_snippet: 'We process your personal information for order fulfilment' },
      { category: 'third_party_sharing', expected_state: 'stated', expected_quote_snippet: 'We share your delivery address with logistics partners' },
      { category: 'retention_period', expected_state: 'stated', expected_quote_snippet: 'We retain order details for 7 years' },
      { category: 'consent_and_choices', expected_state: 'stated', expected_quote_snippet: 'You may withdraw consent via account settings' },
      { category: 'consumer_rights', expected_state: 'stated', expected_quote_snippet: 'You have the right to access, correct, or request erasure' },
      { category: 'grievance_contact', expected_state: 'stated', expected_quote_snippet: 'Grievance Officer: Vikram Anand, Email: grievance@bharatkart.in' },
      { category: 'security_practices', expected_state: 'not_found_in_analysed_text', is_omission: true },
    ],
  },
  {
    policy_id: 'in-fin-02',
    service_name: 'PaisaPay Digital Wallet',
    sector: 'fintech',
    document_text: `PAISAPAY PRIVACY POLICY
1. INFORMATION COLLECTED
We collect Aadhaar-based KYC records, PAN card numbers, bank account numbers, and mobile device identifiers.

2. DISCLOSURE TO CREDIT BUREAUS
We disclose loan repayment records and credit histories to RBI-licensed credit information companies including CIBIL and Experian.

3. SECURITY SAFEGUARDS
We deploy 256-bit AES encryption and ISO 27001 certified data center security safeguards to protect stored financial data from unauthorized access.

4. DATA RETENTION
Financial transaction logs are retained for 10 years as mandated under Prevention of Money Laundering Act regulations.

5. GRIEVANCE REDRESSAL
Principal Nodal Officer: nodalofficer@paisapay.in. Turnaround timeframe for resolution is 30 days.`,
    ground_truth_clauses: [
      { category: 'data_collection', expected_state: 'stated', expected_quote_snippet: 'We collect Aadhaar-based KYC records' },
      { category: 'third_party_sharing', expected_state: 'stated', expected_quote_snippet: 'We disclose loan repayment records' },
      { category: 'security_practices', expected_state: 'stated', expected_quote_snippet: 'We deploy 256-bit AES encryption' },
      { category: 'retention_period', expected_state: 'stated', expected_quote_snippet: 'Financial transaction logs are retained for 10 years' },
      { category: 'grievance_contact', expected_state: 'stated', expected_quote_snippet: 'Principal Nodal Officer: nodalofficer@paisapay.in' },
      { category: 'purpose_specification', expected_state: 'not_found_in_analysed_text', is_omission: true },
      { category: 'consumer_rights', expected_state: 'not_found_in_analysed_text', is_omission: true },
    ],
  },
  {
    policy_id: 'in-food-03',
    service_name: 'QuickBite Food Delivery',
    sector: 'food_delivery',
    document_text: `QUICKBITE PRIVACY POLICY
1. DATA WE COLLECT
We collect your delivery address, live GPS location coordinates, food orders, and telephone call audio records with delivery drivers.

2. THIRD PARTY ADVERTISING
We share anonymized dining telemetry and location patterns with advertising networks for marketing and personalized promotions.

3. YOUR RIGHTS
You may request account deletion or update your profile information by contacting customer support.

4. GRIEVANCE CONTACT
Grievance Officer: support-grievance@quickbite.in.`,
    ground_truth_clauses: [
      { category: 'data_collection', expected_state: 'stated', expected_quote_snippet: 'We collect your delivery address' },
      { category: 'third_party_sharing', expected_state: 'stated', expected_quote_snippet: 'We share anonymized dining telemetry' },
      { category: 'consumer_rights', expected_state: 'stated', expected_quote_snippet: 'You may request account deletion' },
      { category: 'grievance_contact', expected_state: 'stated', expected_quote_snippet: 'Grievance Officer: support-grievance@quickbite.in' },
      { category: 'retention_period', expected_state: 'not_found_in_analysed_text', is_omission: true },
      { category: 'security_practices', expected_state: 'not_found_in_analysed_text', is_omission: true },
    ],
  },
  {
    policy_id: 'in-stream-04',
    service_name: 'Tarang Music Streaming',
    sector: 'streaming',
    document_text: `TARANG STREAMING PRIVACY POLICY
1. INFORMATION WE COLLECT
We collect username, email address, music playback history, playlists, and audio playback settings.

2. PURPOSE OF PROCESSING
We process listening logs to provide streaming audio and personalized music discovery.

3. CONSENT AND PREFERENCES
You can opt out of targeted audio advertisements and withdraw consent for marketing communications in settings.

4. SECURITY MEASURES
We implement SSL/TLS encryption for all audio streams and maintain strict access controls to user playlists.

5. GRIEVANCE REDRESSAL
Contact our Grievance Nodal Officer at: grievance@tarangmusic.in.`,
    ground_truth_clauses: [
      { category: 'data_collection', expected_state: 'stated', expected_quote_snippet: 'We collect username, email address' },
      { category: 'purpose_specification', expected_state: 'stated', expected_quote_snippet: 'We process listening logs to provide streaming audio' },
      { category: 'consent_and_choices', expected_state: 'stated', expected_quote_snippet: 'You can opt out of targeted audio advertisements' },
      { category: 'security_practices', expected_state: 'stated', expected_quote_snippet: 'We implement SSL/TLS encryption' },
      { category: 'grievance_contact', expected_state: 'stated', expected_quote_snippet: 'Contact our Grievance Nodal Officer at: grievance@tarangmusic.in' },
      { category: 'retention_period', expected_state: 'not_found_in_analysed_text', is_omission: true },
      { category: 'third_party_sharing', expected_state: 'not_found_in_analysed_text', is_omission: true },
    ],
  },
  {
    policy_id: 'in-mob-05',
    service_name: 'MetroRide Cabs',
    sector: 'mobility',
    document_text: `METRORIDE MOBILITY PRIVACY NOTICE
1. INFORMATION COLLECTED
We collect rider name, phone number, pickup location, drop coordinates, and route telemetry during the trip.

2. PURPOSE
We process trip telemetry solely for fare calculation, navigation, and driver safety monitoring.

3. DATA RETENTION
GPS route histories are stored for 180 days for dispute resolution, after which they are deleted.

4. EXERCISING RIGHTS
Under the DPDP Act 2023, you have the right to access trip history records or request deletion of your account.

5. GRIEVANCE OFFICER
Email: privacy-nodal@metroride.in.`,
    ground_truth_clauses: [
      { category: 'data_collection', expected_state: 'stated', expected_quote_snippet: 'We collect rider name, phone number' },
      { category: 'purpose_specification', expected_state: 'stated', expected_quote_snippet: 'We process trip telemetry solely for fare calculation' },
      { category: 'retention_period', expected_state: 'stated', expected_quote_snippet: 'GPS route histories are stored for 180 days' },
      { category: 'consumer_rights', expected_state: 'stated', expected_quote_snippet: 'Under the DPDP Act 2023, you have the right to access' },
      { category: 'grievance_contact', expected_state: 'stated', expected_quote_snippet: 'Email: privacy-nodal@metroride.in' },
      { category: 'security_practices', expected_state: 'not_found_in_analysed_text', is_omission: true },
      { category: 'third_party_sharing', expected_state: 'not_found_in_analysed_text', is_omission: true },
    ],
  },
];
