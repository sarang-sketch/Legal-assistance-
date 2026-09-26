"""Google Cloud Structured Logging and Compliance Audit Tracer."""

import json
import logging
import sys
from typing import Any, Dict
from app.core.config import get_settings

settings = get_settings()


class GoogleCloudJsonFormatter(logging.Formatter):
    """Formats log records as JSON conforming to Google Cloud Logging payload specs.

    Maps Python logging severity to GCP LogSeverity (DEFAULT, DEBUG, INFO, NOTICE, WARNING, ERROR, CRITICAL).
    """

    GCP_SEVERITY_MAP = {
        "DEBUG": "DEBUG",
        "INFO": "INFO",
        "WARNING": "WARNING",
        "ERROR": "ERROR",
        "CRITICAL": "CRITICAL",
    }

    def format(self, record: logging.LogRecord) -> str:
        log_payload: Dict[str, Any] = {
            "severity": self.GCP_SEVERITY_MAP.get(record.levelname, "DEFAULT"),
            "message": record.getMessage(),
            "timestamp": self.formatTime(record, self.datefmt),
            "logger": record.name,
            "logging.googleapis.com/sourceLocation": {
                "file": record.pathname,
                "line": record.lineno,
                "function": record.funcName,
            },
            "serviceContext": {
                "service": settings.APP_NAME,
                "version": settings.APP_VERSION,
            },
        }

        # Attach custom extra fields if provided
        if hasattr(record, "trace_id"):
            log_payload["logging.googleapis.com/trace"] = getattr(record, "trace_id")
        if hasattr(record, "extra_fields"):
            log_payload["context"] = getattr(record, "extra_fields")

        return json.dumps(log_payload)


def setup_cloud_logging() -> logging.Logger:
    """Initialize structured JSON logger configured for Google Cloud Run."""
    logger = logging.getLogger("justitia_ai")
    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    # Avoid duplicate handlers on re-init
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(GoogleCloudJsonFormatter())
        logger.addHandler(handler)

    return logger


logger = setup_cloud_logging()
