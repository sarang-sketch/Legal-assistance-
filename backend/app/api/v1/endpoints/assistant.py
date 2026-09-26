"""API Endpoints for Legal Assistant Chat and Plain-Language Simplification."""

import uuid
from fastapi import APIRouter, Depends, status
from app.core.logging import logger
from app.core.security import AuthenticatedUser, get_current_user, sanitize_legal_text
from app.models.audit import BigQueryAuditRecord
from app.schemas.legal_requests import LegalAssistantQueryRequest, LegalTranslationRequest
from app.schemas.legal_responses import LegalAssistantQueryResponse, LegalTranslationResponse
from app.services.bigquery_analytics import BigQueryAnalyticsService
from app.services.gemini_legal_service import GeminiLegalService
from app.services.translation_service import TranslationService

router = APIRouter()
gemini_service = GeminiLegalService()
translation_service = TranslationService()
analytics_service = BigQueryAnalyticsService()


@router.post(
    "/query",
    response_model=LegalAssistantQueryResponse,
    status_code=status.HTTP_200_OK,
    summary="Query Gemini 1.5 Pro Legal Copilot",
    description="Processes legal research inquiries using Google Vertex AI and Search Grounding.",
)
async def query_legal_assistant(
    request: LegalAssistantQueryRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> LegalAssistantQueryResponse:
    """Execute grounded legal analysis with PII scrubbing and compliance audit logging."""
    logger.info(f"User {current_user.uid} ({current_user.role}) initiated legal inquiry.")

    # Sanitize sensitive client inputs
    sanitized_prompt = sanitize_legal_text(request.prompt)
    request.prompt = sanitized_prompt

    # Execute Gemini 1.5 Pro reasoning
    response = await gemini_service.query_legal_assistant(request)

    # Stream compliance audit record to BigQuery
    audit_event = BigQueryAuditRecord(
        event_id=str(uuid.uuid4()),
        user_uid=current_user.uid,
        user_role=current_user.role.value,
        action_type="LEGAL_ASSISTANT_QUERY",
        jurisdiction=request.jurisdiction,
        model_version=response.model_used,
        token_usage_prompt=len(request.prompt.split()),
        token_usage_completion=len(response.answer.split()),
        latency_ms=response.latency_ms,
        metadata_json={"query_id": response.query_id, "confidence": response.confidence_score},
    )
    await analytics_service.log_audit_event(audit_event)

    return response


@router.post(
    "/simplify",
    response_model=LegalTranslationResponse,
    status_code=status.HTTP_200_OK,
    summary="Simplify Legal Boilerplate into Plain Language",
    description="Translates complex legalese into accessible 8th-grade language via Google Cloud Translation.",
)
async def simplify_legal_boilerplate(
    request: LegalTranslationRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> LegalTranslationResponse:
    """Simplify and translate dense legal jargon for pro-se litigants."""
    logger.info(f"Simplification requested by user {current_user.uid} for target language {request.target_language}")
    return await translation_service.simplify_and_translate(request)
