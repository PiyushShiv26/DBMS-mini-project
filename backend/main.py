"""Canonical application entry point.

Run with: uvicorn backend.main:app --reload --port 8000
"""

from .api import app

__all__ = ["app"]
