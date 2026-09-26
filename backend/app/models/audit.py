"""BigQuery Audit Schema and Telemetry Records for Regulatory Compliance."""

from datetime import datetime, timezone
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class BigQueryAuditRecord(BaseModel):
    """Schema representing an immutable audit row inserted into Google BigQuery."""

    event_id: str = Field(..., description="Unique UUID for audit record")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user_uid: str
    user_role: str
    action_type: str = Field(..., description="E.g., CONTRACT_ANALYSIS, LEGAL_QUERY, TRIAGE_EVALUATION")
    resource_id: Optional[str] = None
    jurisdiction: Optional[str] = None
    model_version: str = Field(..., description="Vertex AI model identifier used")
    token_usage_prompt: int = Field(default=0)
    token_usage_completion: int = Field(default=0)
    latency_ms: float = Field(default=0.0)
    client_ip_anonymized: Optional[str] = None
    metadata_json: Dict[str, Any] = Field(default_factory=dict)

    def to_bigquery_row(self) -> Dict[str, Any]:
        """Convert pydantic model to BigQuery streaming insert dictionary."""
        return {
            "event_id": self.event_id,
            "timestamp": self.timestamp.isoformat(),
            "user_uid": self.user_uid,
            "user_role": self.user_role,
            "action_type": self.action_type,
            "resource_id": self.resource_id,
            "jurisdiction": self.jurisdiction,
            "model_version": self.model_version,
            "token_usage_prompt": self.token_usage_prompt,
            "token_usage_completion": self.token_usage_completion,
            "latency_ms": self.latency_ms,
            "client_ip_anonymized": self.client_ip_anonymized,
            "metadata_json": str(self.metadata_json),
        }
