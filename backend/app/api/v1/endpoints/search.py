"""API Endpoints for Statutory Precedent Search & Citation Grounding."""

from fastapi import APIRouter, Depends, status
from app.core.security import AuthenticatedUser, get_current_user
from app.schemas.legal_requests import PrecedentSearchRequest
from app.schemas.legal_responses import GroundedCitationSource, PrecedentSearchResponse
from app.services.grounding_service import CitationGroundingService
from app.services.vector_search_service import VectorSearchService

router = APIRouter()
vector_search_service = VectorSearchService()
grounding_service = CitationGroundingService()


@router.post(
    "/precedents",
    response_model=PrecedentSearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Semantic Precedent Search via Vertex AI Vector Search",
    description="Queries 768-dimensional text-embedding-004 index for relevant statutes and binding cases.",
)
async def search_statutory_precedents(
    request: PrecedentSearchRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> PrecedentSearchResponse:
    """Execute vector similarity search across federal and state legal repositories."""
    return await vector_search_service.search_statutory_precedents(request)


@router.post(
    "/verify-citation",
    response_model=GroundedCitationSource,
    status_code=status.HTTP_200_OK,
    summary="Verify Citation Validity via Google Search Grounding",
    description="Validates that a cited case is not overruled and represents binding authority.",
)
async def verify_legal_citation(
    citation: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> GroundedCitationSource:
    """Shepardize citation using real-time search grounding."""
    return await grounding_service.verify_legal_citation(citation)
