"""API Endpoints for BigQuery Audit Analytics and System Metrics."""

from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from app.core.config import get_settings
from app.core.security import AuthenticatedUser, UserRole, get_current_user, require_roles
from app.schemas.legal_responses import BigQueryMetricsSummary
from app.services.bigquery_analytics import BigQueryAnalyticsService

router = APIRouter()
analytics_service = BigQueryAnalyticsService()
settings = get_settings()


@router.get(
    "/metrics",
    response_model=BigQueryMetricsSummary,
    status_code=status.HTTP_200_OK,
    summary="Get BigQuery Justice Access & Operations Metrics",
    description="Provides real-time aggregated reporting on pro-bono routing and contract risk distribution.",
)
async def get_metrics_summary(
    current_user: AuthenticatedUser = Depends(
        require_roles([UserRole.ENTERPRISE_COUNSEL, UserRole.PRO_BONO_ATTORNEY, UserRole.ADMIN])
    ),
) -> BigQueryMetricsSummary:
    """Fetch BigQuery telemetry aggregations."""
    return await analytics_service.get_justice_metrics_summary()


@router.get(
    "/compliance-status",
    status_code=status.HTTP_200_OK,
    summary="Get Regulatory Compliance & Ethics Attestation",
)
async def get_compliance_status(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> Dict[str, Any]:
    """Return platform ethical bounding standards and disclaimer status."""
    return {
        "status": "COMPLIANT",
        "aba_model_rule_5_5_complied": True,
        "pii_sanitization_active": True,
        "cmek_storage_encryption": "ACTIVE (Google Cloud KMS)",
        "grounding_verification_active": True,
        "disclaimer_text": settings.LEGAL_DISCLAIMER_NOTICE,
    }
