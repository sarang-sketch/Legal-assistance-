"""Pydantic v2 Response Schemas for Legal Intelligence & Access Operations."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.models.domain import ClauseAnalysis, LegalCategory, RiskLevel, StatutoryCitation


class GroundedCitationSource(BaseModel):
    """Citation source verified via Google Search Grounding or Vertex AI Vector Search."""
    title: str
    uri: Optional[str] = None
    snippet: str
    relevance_score: float = 0.95
    verified_authority: bool = True


class LegalAssistantQueryResponse(BaseModel):
    """Structured response for Gemini 1.5 Pro legal queries."""
    query_id: str
    answer: str = Field(..., description="Synthesis of legal doctrine and procedural rules")
    jurisdiction: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    reasoning_summary: str = Field(..., description="Chain-of-thought distillation for transparency")
    grounded_citations: List[GroundedCitationSource] = Field(default_factory=list)
    actionable_next_steps: List[str] = Field(default_factory=list)
    disclaimer: str
    model_used: str
    latency_ms: float


class ContractAnalysisResponse(BaseModel):
    """Structured response for Contract Risk Heatmap & Clause Extraction."""
    document_title: str
    contract_type: str
    overall_risk_level: RiskLevel
    overall_risk_score: float = Field(..., ge=0.0, le=100.0)
    total_clauses_evaluated: int
    critical_flags_count: int
    clauses: List[ClauseAnalysis]
    executive_summary: str
    key_liabilities: List[str]
    favorable_terms: List[str]
    disclaimer: str


class LegalAidPartner(BaseModel):
    """Pro-bono legal clinic or non-profit legal aid foundation match."""
    organization_name: str
    specialty_area: str
    address: str
    phone: str
    website: str
    intake_hours: str
    acceptance_rate: str


class ProBonoTriageResponse(BaseModel):
    """Structured response for Equal Access Legal Intake Engine."""
    case_id: str
    category: LegalCategory
    urgency_level: str = Field(..., description="'CRITICAL_EMERGENCY', 'HIGH', 'STANDARD'")
    poverty_guideline_percentage: float = Field(..., description="Household income relative to FPL")
    is_income_eligible: bool
    plain_language_summary: str
    self_help_checklist: List[str]
    matched_legal_clinics: List[LegalAidPartner]
    statutory_deadline_warning: Optional[str] = None
    suggested_court_forms: List[str]


class PrecedentSearchResponse(BaseModel):
    """Semantic vector search response over legal corpora."""
    query: str
    total_results: int
    execution_time_ms: float
    citations: List[StatutoryCitation]


class LegalTranslationResponse(BaseModel):
    """Response containing simplified plain-language legal explanation."""
    original_text: str
    simplified_text: str
    detected_source_language: str
    target_language: str
    glossary_of_terms: Dict[str, str] = Field(
        default_factory=dict,
        description="Key legal terminology translated into plain definitions"
    )


class PlatformHealthResponse(BaseModel):
    """System health check payload for Cloud Run container monitoring."""
    status: str
    version: str
    environment: str
    simulation_mode: bool
    google_cloud_services: Dict[str, str]


class BigQueryMetricsSummary(BaseModel):
    """Analytical summary of pro-bono access and contract operations."""
    total_cases_triaged: int
    pro_bono_match_rate_pct: float
    total_contracts_scanned: int
    avg_contract_risk_score: float
    top_categories: Dict[str, int]
    avg_latency_ms: float
