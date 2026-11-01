"""Backward-compatible import shim.

The FastAPI application now lives in :mod:`backend.api`. Core business logic
remains in this package; this shim preserves older ``src.api:app`` commands.
"""

from backend.api import app

__all__ = ["app"]
