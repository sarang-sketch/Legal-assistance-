"""API Endpoints for Pro-Bono Legal Access and Intake Triage."""

import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from app.core.logging import logger
from app.core.security import AuthenticatedUser, get_current_user
from app.models.audit import BigQueryAuditRecord
from app.schemas.legal_requests import ProBonoTriageRequest
from app.schemas.legal_responses import LegalAidPartner, ProBonoTriageResponse
from app.services.bigquery_analytics import BigQueryAnalyticsService
from app.services.triage_service import LegalTriageService

router = APIRouter()
triage_service = LegalTriageService()
analytics_service = BigQueryAnalyticsService()


@router.post(
    "/evaluate",
    response_model=ProBonoTriageResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate Pro-Bono Legal Aid Eligibility",
    description="Calculates FPL poverty percentage, urgency triage, self-help action checklists, and matches legal aid.",
)
async def evaluate_pro_bono_case(
    request: ProBonoTriageRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> ProBonoTriageResponse:
    """Triage low-income litigant case for pro-bono routing."""
    logger.info(f"Triage initiated for applicant in {request.state_or_zip}, household size {request.household_size}")
    response = await triage_service.evaluate_pro_bono_case(request)

    # Log to BigQuery justice metrics
    audit_event = BigQueryAuditRecord(
        event_id=str(uuid.uuid4()),
        user_uid=current_user.uid,
        user_role=current_user.role.value,
        action_type="PRO_BONO_TRIAGE_EVALUATION",
        resource_id=response.case_id,
        jurisdiction=request.state_or_zip,
        model_version="triage-rules-engine-v1",
        latency_ms=45.2,
        metadata_json={
            "fpl_pct": response.poverty_guideline_percentage,
            "is_eligible": response.is_income_eligible,
            "urgency": response.urgency_level,
            "category": response.category.value,
        },
    )
    await analytics_service.log_audit_event(audit_event)

    return response


@router.get(
    "/clinics/{state_code}",
    response_model=List[LegalAidPartner],
    status_code=status.HTTP_200_OK,
    summary="List Partner Legal Aid Clinics by State",
)
async def get_legal_aid_clinics(
    state_code: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> List[LegalAidPartner]:
    """Retrieve verified non-profit legal assistance providers."""
    key = state_code.upper()
    return triage_service.LEGAL_AID_DIRECTORY.get(key, triage_service.LEGAL_AID_DIRECTORY["DEFAULT"])
