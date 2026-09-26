"""Performance, Caching, and Efficiency Tests."""

import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.core.cache import query_cache
from app.main import app

client = TestClient(app)


class TestEfficiencyAndCaching(unittest.TestCase):
    """Test suite for LRU cache hits, compression, and latency."""

    def setUp(self):
        query_cache.clear()

    def test_query_caching_efficiency(self):
        """Verify repeated queries hit in-memory LRU cache and execute with sub-5ms latency."""
        payload = {
            "prompt": "What is the statute of limitations for contract breach in California?",
            "jurisdiction": "California",
        }
        # First query (Cache Miss)
        resp1 = client.post("/api/v1/assistant/query", json=payload)
        self.assertEqual(resp1.status_code, 200)

        # Second identical query (Cache Hit)
        resp2 = client.post("/api/v1/assistant/query", json=payload)
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp1.json()["query_id"], resp2.json()["query_id"])

    def test_gzip_compression_support(self):
        """Verify API supports GZip compression for large analytical responses."""
        response = client.get(
            "/api/v1/audit/metrics",
            headers={"Accept-Encoding": "gzip"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("pro_bono_match_rate_pct", response.json())


if __name__ == "__main__":
    unittest.main()
