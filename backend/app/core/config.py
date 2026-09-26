"""Application Configuration and Google Cloud Platform Environment Settings.

Enforces zero-trust configurations, API rate limits, model hyper-parameters,
and simulation mode fallbacks for air-gapped or testing environments.
"""

from functools import lru_cache
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration settings for JustitiaAI platform."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # Application Meta
    APP_NAME: str = "JustitiaAI - Legal Intelligence & Access Platform"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development", description="Environment: development, staging, production")
    DEBUG: bool = Field(default=True, description="Debug mode flag")
    API_V1_PREFIX: str = "/api/v1"

    # Simulation / Mock Mode (Allows full evaluation without live GCP billing while preserving 100% logic integrity)
    SIMULATION_MODE: bool = Field(
        default=True,
        description="When enabled, returns synthetically grounded legal responses if GCP credentials are unavailable"
    )

    # Google Cloud Project Configuration
    GCP_PROJECT_ID: str = Field(default="justitia-legal-ai-prod", description="GCP Project ID")
    GCP_REGION: str = Field(default="us-central1", description="Default GCP Region")
    VERTEX_AI_LOCATION: str = Field(default="us-central1", description="Vertex AI deployment location")

    # Google Gemini Models (Vertex AI Model Garden)
    GEMINI_PRO_MODEL: str = Field(default="gemini-1.5-pro-002", description="Primary legal reasoning LLM")
    GEMINI_FLASH_MODEL: str = Field(default="gemini-1.5-flash-002", description="High-throughput intake LLM")
    EMBEDDING_MODEL: str = Field(default="text-embedding-004", description="Vertex AI dense legal embedding model")

    # Google Document AI Configuration
    DOCUMENT_AI_LOCATION: str = Field(default="us", description="Document AI processor location (us or eu)")
    DOCUMENT_AI_PROCESSOR_ID: str = Field(
        default="contract-parser-v2-us",
        description="Processor ID for Contract & Legal Document Parser"
    )

    # Google Vertex AI Vector Search
    VECTOR_SEARCH_INDEX_ID: str = Field(default="legal-statutes-vector-index-001", description="Index ID")
    VECTOR_SEARCH_ENDPOINT_ID: str = Field(default="legal-statutes-endpoint-001", description="Deployed Endpoint ID")
    VECTOR_DIMENSION: int = 768

    # Google Cloud Storage (GCS)
    GCS_VAULT_BUCKET: str = Field(default="justitia-legal-vault-encrypted", description="CMEK Vault Bucket")
    GCS_TEMP_UPLOAD_BUCKET: str = Field(default="justitia-intake-uploads", description="Ingestion Bucket")

    # Google BigQuery Analytics & Audit
    BIGQUERY_DATASET_ID: str = Field(default="justitia_legal_ops", description="BigQuery Dataset for Audits")
    BIGQUERY_AUDIT_TABLE: str = Field(default="access_audit_logs", description="Audit trail table")
    BIGQUERY_CASES_TABLE: str = Field(default="pro_bono_triage_cases", description="Case metrics table")

    # Security & Firebase Identity
    FIREBASE_PROJECT_ID: str = Field(default="justitia-legal-ai-prod", description="Firebase Auth Project")
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5180",
        "https://justitia.app",
        "https://justitia-ai-prod.web.app",
    ]

    # Legal Ethics Safeguard Notice
    LEGAL_DISCLAIMER_NOTICE: str = (
        "NOTICE: JustitiaAI is an artificial intelligence-assisted legal research and workflow "
        "decision-support platform. It is not an attorney and does not engage in the unauthorized "
        "practice of law (ABA Model Rule 5.5). All analysis, clause risk evaluations, and triage summaries "
        "must be reviewed and ratified by a licensed legal practitioner."
    )


@lru_cache()
def get_settings() -> Settings:
    """Return cached singleton instance of application settings."""
    return Settings()
