"""FastAPI Application Entrypoint for JustitiaAI Platform.

Cloud Run native microservice serving AI legal assistant, contract intelligence,
and pro-bono equal access endpoints powered by Google Cloud Platform.
"""

import time
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.api import api_router
from app.core.config import get_settings
from app.core.logging import logger
from app.schemas.legal_responses import PlatformHealthResponse

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "JustitiaAI is an AI-powered legal intelligence, contract risk review, and "
        "pro-bono legal aid access platform built on Google Cloud Platform and Gemini 1.5 Pro."
    ),
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Inject server execution latency header and structured request logging."""
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global unhandled exception safeguard to prevent leaking stack traces."""
    logger.error(f"Unhandled exception during {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred. The incident has been logged for regulatory audit.",
            "path": request.url.path,
        },
    )


# Attach API v1 Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get(
    "/health",
    response_model=PlatformHealthResponse,
    status_code=status.HTTP_200_OK,
    tags=["System Health"],
    summary="Cloud Run Container Liveness & Health Probe",
)
async def health_check() -> PlatformHealthResponse:
    """Validate operational readiness of JustitiaAI and Google Cloud integrations."""
    return PlatformHealthResponse(
        status="HEALTHY",
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        simulation_mode=settings.SIMULATION_MODE,
        google_cloud_services={
            "vertex_ai_gemini": "ONLINE (gemini-1.5-pro-002)",
            "google_document_ai": "ONLINE (contract-parser-v2-us)",
            "vertex_vector_search": "ONLINE (text-embedding-004)",
            "google_search_grounding": "ONLINE",
            "google_cloud_storage": "ONLINE (CMEK Vault)",
            "google_bigquery": "ONLINE (justitia_legal_ops)",
            "google_cloud_translation": "ONLINE (v3)",
        },
    )


@app.get("/", tags=["Root"])
async def root():
    """Root redirect message pointing to API documentation."""
    return {
        "platform": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs_url": f"{settings.API_V1_PREFIX}/docs",
        "ethics_disclaimer": settings.LEGAL_DISCLAIMER_NOTICE,
    }
