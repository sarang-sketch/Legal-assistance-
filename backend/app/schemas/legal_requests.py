"""Pydantic v2 Request Schemas for Legal Operations."""

from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.domain import LegalCategory


class ChatMessage(BaseModel):
    """Chat message in a multi-turn legal assistant session."""
    role: str = Field(..., description="Role: 'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message text")


class LegalAssistantQueryRequest(BaseModel):
    """Request payload for Gemini 1.5 Pro legal reasoning and citation grounding."""
    prompt: str = Field(..., min_length=3, description="Legal question or procedural inquiry")
    jurisdiction: str = Field(default="Federal", description="Target jurisdiction (e.g. 'California', 'Federal', 'New York')")
    category: Optional[LegalCategory] = Field(None, description="Optional domain categorization")
    history: List[ChatMessage] = Field(default_factory=list, description="Prior conversation context")
    enable_grounding: bool = Field(default=True, description="Verify citations via Google Search Grounding")
    temperature: float = Field(default=0.2, ge=0.0, le=1.0, description="Sampling temperature (low for legal precision)")


class ContractAnalysisRequest(BaseModel):
    """Request payload for Google Document AI and Gemini Contract Risk Analyzer."""
    document_title: str = Field(..., description="Contract or document identifier")
    contract_type: str = Field(default="Commercial Agreement", description="E.g., NDA, Employment, Commercial Lease")
    raw_text: Optional[str] = Field(None, description="Raw text if already extracted")
    client_position: str = Field(default="Neutral", description="E.g., 'Tenant', 'Employee', 'Licensee', 'Service Provider'")
    risk_tolerance: str = Field(default="Moderate", description="'Strict', 'Moderate', or 'Aggressive'")
    focus_clauses: List[str] = Field(
        default=["Indemnification", "Limitation of Liability", "Governing Law", "Termination", "Non-Compete"],
        description="Target clauses to audit"
    )


class ProBonoTriageRequest(BaseModel):
    """Request payload for the Pro-Bono Equal Access Intake Engine."""
    annual_income: float = Field(..., ge=0.0, description="Annual household income in USD")
    household_size: int = Field(..., ge=1, description="Number of dependents in household")
    state_or_zip: str = Field(..., description="Location of legal matter (e.g. 'CA' or '94103')")
    legal_issue_description: str = Field(..., min_length=10, description="Plain language explanation of legal crisis")
    has_court_summons: bool = Field(default=False, description="Whether formal summons/notice to vacate was served")
    hearing_date: Optional[str] = Field(None, description="Upcoming court hearing date if applicable (YYYY-MM-DD)")
    preferred_language: str = Field(default="en", description="BCP-47 language code (e.g., 'es', 'zh', 'vi', 'en')")


class PrecedentSearchRequest(BaseModel):
    """Request payload for Vertex AI Vector Search over legal statutes and case law."""
    query: str = Field(..., min_length=3, description="Semantic or conceptual legal query")
    jurisdiction: Optional[str] = Field(None, description="Filter by jurisdiction")
    max_results: int = Field(default=5, ge=1, le=20, description="Top-k nearest neighbors to retrieve")
    min_similarity: float = Field(default=0.65, ge=0.0, le=1.0, description="Minimum cosine similarity cutoff")


class LegalTranslationRequest(BaseModel):
    """Request payload for Google Cloud Translation & Plain-Language Legalese Simplifier."""
    legal_text: str = Field(..., min_length=5, description="Dense legal text or statutory clause to simplify")
    target_language: str = Field(default="en", description="Target ISO language code")
    reading_level: str = Field(default="8th_grade", description="Target readability (e.g., '8th_grade', 'plain_summary')")
