"""Unit tests for Pro-Bono Legal Aid Triage & Access Engine."""

import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestTriageAPI(unittest.TestCase):
    """Test suite for Pro-Bono Access & Legal Aid triage endpoints."""

    def test_pro_bono_intake_eligible(self):
        """Verify that low-income tenant qualifies for free legal aid and gets emergency checklist."""
        payload = {
            "annual_income": 22000.0,
            "household_size": 3,
            "state_or_zip": "CA",
            "legal_issue_description": "Landlord served a 3-day notice to pay or quit despite unresolved black mold issues.",
            "has_court_summons": True,
            "hearing_date": "2026-10-15",
            "preferred_language": "en",
        }
        response = client.post("/api/v1/triage/evaluate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["is_income_eligible"])
        self.assertEqual(data["urgency_level"], "CRITICAL_EMERGENCY")
        self.assertGreater(len(data["matched_legal_clinics"]), 0)
        self.assertGreaterEqual(len(data["self_help_checklist"]), 3)
        self.assertIsNotNone(data["statutory_deadline_warning"])

    def test_legal_aid_clinic_directory(self):
        """Verify state-specific legal clinic directory returns authorized providers."""
        response = client.get("/api/v1/triage/clinics/NY")
        self.assertEqual(response.status_code, 200)
        clinics = response.json()
        self.assertGreaterEqual(len(clinics), 2)
        has_legal_aid = any("Legal Aid Society" in c["organization_name"] for c in clinics)
        self.assertTrue(has_legal_aid)


if __name__ == "__main__":
    unittest.main()
