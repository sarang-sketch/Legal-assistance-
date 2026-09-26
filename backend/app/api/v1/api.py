"""Aggregation router for JustitiaAI API v1."""

from fastapi import APIRouter
from app.api.v1.endpoints import assistant, audit, contracts, search, triage

api_router = APIRouter()

api_router.include_router(assistant.router, prefix="/assistant", tags=["Legal Assistant"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["Contracts & Document AI"])
api_router.include_router(triage.router, prefix="/triage", tags=["Pro-Bono Legal Access"])
api_router.include_router(search.router, prefix="/search", tags=["Precedent Search & Grounding"])
api_router.include_router(audit.router, prefix="/audit", tags=["BigQuery Analytics & Compliance"])
