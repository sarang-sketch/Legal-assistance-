"""In-Memory High-Performance Caching Layer for Efficiency and Latency Reduction."""

import time
from typing import Any, Dict, Optional
from app.core.logging import logger


class TTLCache:
    """Thread-safe Time-To-Live (TTL) LRU Cache to eliminate redundant AI reasoning cycles."""

    def __init__(self, maxsize: int = 1000, default_ttl_seconds: int = 3600) -> None:
        self.maxsize = maxsize
        self.default_ttl = default_ttl_seconds
        self._cache: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        """Retrieve cached payload if present and unexpired."""
        if key in self._cache:
            entry = self._cache[key]
            if time.time() < entry["expires_at"]:
                logger.debug(f"[CACHE HIT] Key: {key[:32]}...")
                return entry["data"]
            del self._cache[key]
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Store item with expiration TTL."""
        if len(self._cache) >= self.maxsize:
            # Evict oldest entry (LRU emulation)
            oldest_key = min(self._cache.keys(), key=lambda k: self._cache[k]["created_at"])
            del self._cache[oldest_key]

        expiry = time.time() + (ttl if ttl is not None else self.default_ttl)
        self._cache[key] = {
            "data": value,
            "created_at": time.time(),
            "expires_at": expiry,
        }
        logger.debug(f"[CACHE SET] Key: {key[:32]}... expires in {ttl or self.default_ttl}s")

    def clear(self) -> None:
        """Flush cache."""
        self._cache.clear()


# Global cache singletons
query_cache = TTLCache(maxsize=500, default_ttl_seconds=1800)
precedent_cache = TTLCache(maxsize=1000, default_ttl_seconds=7200)
