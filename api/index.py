# Vercel Serverless Function - FastAPI Adapter
# This file exposes the FastAPI application as a Vercel serverless function.

import sys
from pathlib import Path

# Add backend directory to Python path so all imports resolve correctly
backend_dir = str(Path(__file__).resolve().parent.parent / "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app  # noqa: E402

# Vercel expects a variable named `app` or `handler` at module level
# FastAPI/Starlette apps are ASGI-compatible and Vercel's Python runtime handles them natively
