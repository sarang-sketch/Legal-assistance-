export type LegalCategory =
  | 'housing_and_eviction'
  | 'immigration_asylum'
  | 'employment_and_labor'
  | 'debt_and_consumer_rights'
  | 'family_and_domestic'
  | 'commercial_contracts'
  | 'intellectual_property'
  | 'civil_rights';

export type RiskLevel = 'negligible' | 'low' | 'medium' | 'high' | 'critical';

export interface GroundedCitationSource {
  title: string;
  uri?: string;
  snippet: string;
  relevance_score: number;
  verified_authority: boolean;
}

export interface LegalAssistantQueryResponse {
  query_id: string;
  answer: string;
  jurisdiction: string;
  confidence_score: number;
  reasoning_summary: string;
  grounded_citations: GroundedCitationSource[];
  actionable_next_steps: string[];
  disclaimer: string;
  model_used: string;
  latency_ms: number;
}

export interface ClauseAnalysis {
  clause_id: string;
  clause_title: string;
  original_text: string;
  risk_level: RiskLevel;
  risk_score: number;
  risk_rationale: string;
  suggested_revision: string;
  governing_statutes: string[];
}

export interface ContractAnalysisResponse {
  document_title: string;
  contract_type: string;
  overall_risk_level: RiskLevel;
  overall_risk_score: number;
  total_clauses_evaluated: number;
  critical_flags_count: number;
  clauses: ClauseAnalysis[];
  executive_summary: string;
  key_liabilities: string[];
  favorable_terms: string[];
  disclaimer: string;
}

export interface LegalAidPartner {
  organization_name: string;
  specialty_area: string;
  address: string;
  phone: string;
  website: string;
  intake_hours: string;
  acceptance_rate: string;
}

export interface ProBonoTriageResponse {
  case_id: string;
  category: LegalCategory;
  urgency_level: string;
  poverty_guideline_percentage: number;
  is_income_eligible: boolean;
  plain_language_summary: string;
  self_help_checklist: string[];
  matched_legal_clinics: LegalAidPartner[];
  statutory_deadline_warning?: string;
  suggested_court_forms: string[];
}

export interface StatutoryCitation {
  citation: string;
  title: string;
  jurisdiction: string;
  court_level?: string;
  treatment: string;
  relevance_score: number;
  snippet: string;
  source_url?: string;
}

export interface PrecedentSearchResponse {
  query: string;
  total_results: number;
  execution_time_ms: number;
  citations: StatutoryCitation[];
}

export interface BigQueryMetricsSummary {
  total_cases_triaged: number;
  pro_bono_match_rate_pct: number;
  total_contracts_scanned: number;
  avg_contract_risk_score: number;
  top_categories: Record<string, number>;
  avg_latency_ms: number;
}
