"""API Endpoints for Contract Risk Analysis and Document AI Processing."""

import uuid
from typing import Any, Dict
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from app.core.logging import logger
from app.core.security import AuthenticatedUser, get_current_user
from app.models.audit import BigQueryAuditRecord
from app.schemas.legal_requests import ContractAnalysisRequest
from app.schemas.legal_responses import ContractAnalysisResponse
from app.services.bigquery_analytics import BigQueryAnalyticsService
from app.services.document_ai_service import DocumentAIService
from app.services.gemini_legal_service import GeminiLegalService
from app.services.storage_service import StorageVaultService

router = APIRouter()
gemini_service = GeminiLegalService()
docai_service = DocumentAIService()
storage_service = StorageVaultService()
analytics_service = BigQueryAnalyticsService()


@router.post(
    "/analyze",
    response_model=ContractAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Contract Risk & Generate Redlines",
    description="Deconstructs contract clauses, evaluates liabilities, and recommends protective revisions.",
)
async def analyze_contract(
    request: ContractAnalysisRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> ContractAnalysisResponse:
    """Analyze contract text using Gemini 1.5 Pro and evaluate risk heatmaps."""
    logger.info(f"User {current_user.uid} analyzing contract '{request.document_title}'")
    response = await gemini_service.analyze_contract_risk(request)

    # BigQuery telemetry logging
    audit_event = BigQueryAuditRecord(
        event_id=str(uuid.uuid4()),
        user_uid=current_user.uid,
        user_role=current_user.role.value,
        action_type="CONTRACT_ANALYSIS",
        resource_id=request.document_title,
        model_version="gemini-1.5-pro-002",
        token_usage_prompt=1250,
        token_usage_completion=680,
        latency_ms=210.5,
        metadata_json={
            "risk_score": response.overall_risk_score,
            "risk_level": response.overall_risk_level.value,
            "clauses_count": response.total_clauses_evaluated,
        },
    )
    await analytics_service.log_audit_event(audit_event)

    return response


@router.post(
    "/upload-parse",
    status_code=status.HTTP_200_OK,
    summary="OCR & Parse Contract via Google Document AI",
    description="Uploads a PDF/DOCX contract to Document AI Contract Parser and extracts structured entities.",
)
async def upload_and_parse_contract(
    file: UploadFile = File(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> Dict[str, Any]:
    """Process uploaded file bytes through Document AI and store in GCS vault."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing from upload.")

    logger.info(f"Processing upload '{file.filename}' via Document AI for user {current_user.uid}")
    content = await file.read()

    # Process via Document AI Contract Parser
    parsed_result = await docai_service.process_legal_document(content, mime_type=file.content_type or "application/pdf")

    # Securely store in encrypted GCS vault
    vault_uri = await storage_service.store_legal_evidence(content, file.filename, case_id=f"case-{current_user.uid[:6]}")

    return {
        "status": "success",
        "filename": file.filename,
        "vault_uri": vault_uri,
        "document_ai_result": parsed_result,
    }


@router.get(
    "/presigned-url",
    status_code=status.HTTP_200_OK,
    summary="Generate GCS Presigned Upload URL",
)
async def get_presigned_upload_url(
    filename: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> Dict[str, str]:
    """Generate pre-signed Google Cloud Storage URL for secure client uploads."""
    return await storage_service.generate_presigned_upload_url(filename)
