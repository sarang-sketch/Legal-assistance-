# Multi-stage Distroless Container for Google Cloud Run
# Stage 1: Build & Dependency Resolution
FROM python:3.11-slim as builder

WORKDIR /build

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Minimal Distroless / Hardened Runtime
FROM python:3.11-slim as runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080 \
    APP_ENV=production \
    PYTHONPATH=/app

# Create non-root system user for security compliance (SOC2 / CIS GCP Benchmark)
RUN addgroup --system --gid 1001 justitiagroup && \
    adduser --system --uid 1001 --gid 1001 --no-create-home justitiauser

COPY --from=builder /install /usr/local
COPY app /app/app

# Set non-root execution permissions
RUN chown -R justitiauser:justitiagroup /app
USER justitiauser

EXPOSE 8080

# Healthcheck for Cloud Run container liveness probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health').read()" || exit 1

ENTRYPOINT ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "2"]
