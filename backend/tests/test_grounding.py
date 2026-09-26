"""Unit tests for Google Grounding and Citation Verification."""

import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestGroundingAPI(unittest.TestCase):
    """Test suite for Vertex AI Vector Search and Grounding verification."""

    def test_statutory_precedent_vector_search(self):
        """Verify semantic search retrieves relevant statutes and good law ratings."""
        payload = {
            "query": "Tenant habitability defense and retaliatory eviction rules",
            "jurisdiction": "California",
            "max_results": 3,
        }
        response = client.post("/api/v1/search/precedents", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(data["total_results"], 0)
        self.assertGreater(len(data["citations"]), 0)
        for citation in data["citations"]:
            self.assertEqual(citation["treatment"], "good_law")

    def test_overruled_precedent_detection(self):
        """Verify system catches overruled precedent and flags critical warning."""
        response = client.post(
            "/api/v1/search/verify-citation",
            params={"citation": "Roe v. Wade, 410 U.S. 113 (1973)"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("[CRITICAL CAUTION]", data["title"])
        self.assertFalse(data["verified_authority"])
        self.assertIn("Dobbs", data["snippet"])


if __name__ == "__main__":
    unittest.main()
