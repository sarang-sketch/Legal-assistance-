"""Unit tests for Gemini Legal Assistant API."""

import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestAssistantAPI(unittest.TestCase):
    """Test suite for Gemini Legal Assistant endpoints."""

    def test_health_check_endpoint(self):
        """Verify system health check reports online GCP integrations."""
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "HEALTHY")
        self.assertIn("vertex_ai_gemini", data["google_cloud_services"])
        self.assertIn("google_document_ai", data["google_cloud_services"])

    def test_legal_assistant_query(self):
        """Verify Gemini legal query returns grounded citations and disclaimers."""
        payload = {
            "prompt": "What are the essential elements required to establish an unlawful detainer defense in California?",
            "jurisdiction": "California",
            "enable_grounding": True,
            "temperature": 0.1,
        }
        response = client.post("/api/v1/assistant/query", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("query_id", data)
        self.assertGreater(len(data["grounded_citations"]), 0)
        self.assertIn("disclaimer", data)
        self.assertIn("ABA Model Rule 5.5", data["disclaimer"])

    def test_legal_boilerplate_simplification(self):
        """Verify Google Translation service simplifies dense legalese to plain language."""
        payload = {
            "legal_text": "Tenant shall indemnify, defend and hold harmless Landlord against all claims in perpetuity.",
            "target_language": "en",
            "reading_level": "8th_grade",
        }
        response = client.post("/api/v1/assistant/simplify", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("simplified_text", data)
        has_glossary = "indemnification" in data["glossary_of_terms"] or "indemnify" in data["glossary_of_terms"]
        self.assertTrue(has_glossary)


if __name__ == "__main__":
    unittest.main()
