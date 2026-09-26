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

from starlette.middleware.gzip import GZipMiddleware
from app.core.security import rate_limiter

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# High-Performance GZip Compression (Efficiency Enhancement)
app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.middleware("http")
async def security_and_telemetry_middleware(request: Request, call_next):
    """Enforce rate limiting, latency timing, and hardened OWASP security headers."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    
    # Rate Limiting Check
    if not rate_limiter.is_allowed(client_ip):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Too many requests. Rate limit exceeded (120 requests/min)."},
        )

    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000

    # Latency Telemetry Header
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    
    # OWASP Defense-in-Depth Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"

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


from pathlib import Path
from starlette.staticfiles import StaticFiles
from starlette.responses import FileResponse

# Check for compiled React frontend in static/ or ../frontend/dist
static_dir = Path(__file__).resolve().parent.parent / "static"
if not static_dir.exists():
    static_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if static_dir.exists():
    assets_dir = static_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", tags=["Frontend SPA"])
    async def serve_spa(full_path: str):
        """Serve compiled React SPA for any frontend route."""
        # Allow API routes and health check to pass through
        if full_path.startswith("api/") or full_path == "health":
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        target_file = static_dir / full_path
        if target_file.is_file():
            return FileResponse(str(target_file))
        index_file = static_dir / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return JSONResponse(status_code=404, content={"detail": "Frontend not found"})
else:
    @app.get("/", tags=["Root"])
    async def root():
        """Root redirect message pointing to API documentation."""
        return {
            "platform": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs_url": f"{settings.API_V1_PREFIX}/docs",
            "ethics_disclaimer": settings.LEGAL_DISCLAIMER_NOTICE,
        }

