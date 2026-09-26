"""Core Domain Entities for Legal Assistant and Access Operations."""

from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class LegalCategory(str, Enum):
    """Classified legal domain taxonomy."""
    HOUSING_AND_EVICTION = "housing_and_eviction"
    IMMIGRATION_ASYLUM = "immigration_asylum"
    EMPLOYMENT_AND_LABOR = "employment_and_labor"
    DEBT_AND_CONSUMER_RIGHTS = "debt_and_consumer_rights"
    FAMILY_AND_DOMESTIC = "family_and_domestic"
    COMMERCIAL_CONTRACTS = "commercial_contracts"
    INTELLECTUAL_PROPERTY = "intellectual_property"
    CIVIL_RIGHTS = "civil_rights"


class RiskLevel(str, Enum):
    """Contractual risk severity scale."""
    NEGLIGIBLE = "negligible"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class CitationTreatment(str, Enum):
    """Shepardized treatment indicator for verified case law."""
    GOOD_LAW = "good_law"
    CAUTION = "caution"
    DISTINGUISHED = "distinguished"
    OVERRULED = "overruled"
    QUESTIONED = "questioned"


class StatutoryCitation(BaseModel):
    """Represents a verified legal code or court precedent."""
    citation: str = Field(..., description="Formal legal citation (e.g. '42 U.S.C. § 1983')")
    title: str = Field(..., description="Case or statute title")
    jurisdiction: str = Field(..., description="Applicable court or federal/state jurisdiction")
    court_level: Optional[str] = Field(None, description="Appellate, Supreme Court, or District")
    treatment: CitationTreatment = Field(default=CitationTreatment.GOOD_LAW)
    relevance_score: float = Field(..., ge=0.0, le=1.0, description="Semantic match relevance")
    snippet: str = Field(..., description="Authoritative statutory excerpt or judicial holding")
    source_url: Optional[str] = Field(None, description="Official law repository / Google Scholar link")


class ClauseAnalysis(BaseModel):
    """Analyzed legal clause with risk evaluation and redline suggestion."""
    clause_id: str
    clause_title: str
    original_text: str
    risk_level: RiskLevel
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Calculated risk percentage")
    risk_rationale: str
    suggested_revision: str
    governing_statutes: List[str] = Field(default_factory=list)


class ProBonoTriageResult(BaseModel):
    """Evaluated access-to-justice triage outcome."""
    case_id: str
    applicant_id: str
    category: LegalCategory
    urgency_score: float = Field(..., ge=0.0, le=10.0, description="Urgency index (e.g. eviction date proximity)")
    income_eligibility_flag: bool = Field(..., description="Meets 125% - 200% federal poverty guideline")
    recommended_aid_partners: List[str] = Field(default_factory=list)
    plain_language_summary: str
    pro_se_action_checklist: List[str] = Field(default_factory=list)
    generated_court_forms: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
