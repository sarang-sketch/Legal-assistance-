"""Unit tests for Contract Analysis and Document AI endpoints."""

import io
import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestContractsAPI(unittest.TestCase):
    """Test suite for Contract Analysis & Document AI parser endpoints."""

    def test_contract_risk_analysis(self):
        """Verify contract analyzer extracts high-risk clauses and generates redlines."""
        payload = {
            "document_title": "Enterprise Cloud Services Agreement",
            "contract_type": "Commercial SaaS",
            "client_position": "Customer",
            "risk_tolerance": "Strict",
            "focus_clauses": ["Indemnification", "Limitation of Liability"],
        }
        response = client.post("/api/v1/contracts/analyze", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["document_title"], "Enterprise Cloud Services Agreement")
        self.assertGreater(data["overall_risk_score"], 0)
        self.assertGreaterEqual(len(data["clauses"]), 2)
        for clause in data["clauses"]:
            self.assertIn("suggested_revision", clause)
            self.assertIn("risk_rationale", clause)

    def test_contract_upload_and_parse(self):
        """Verify multipart upload processes through Document AI parser."""
        fake_pdf = io.BytesIO(b"%PDF-1.4 Mock Contract Content with Indemnification Clause")
        response = client.post(
            "/api/v1/contracts/upload-parse",
            files={"file": ("contract_sample.pdf", fake_pdf, "application/pdf")},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("document_ai_result", data)
        self.assertIn("entities", data["document_ai_result"])


if __name__ == "__main__":
    unittest.main()
