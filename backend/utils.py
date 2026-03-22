"""
Shared utilities for the backend application.

Provides reusable decorators and helpers to reduce boilerplate across routers.
"""

import functools
import logging
from typing import Callable

from fastapi import HTTPException

logger = logging.getLogger(__name__)


def handle_endpoint_errors(fn: Callable) -> Callable:
    """Decorator that wraps a FastAPI endpoint with standardised error handling.

    Catches common exception types and maps them to appropriate HTTP status codes:
    - ``ValueError`` -> 400 Bad Request
    - ``FileNotFoundError`` -> 404 Not Found
    - ``TimeoutError`` -> 504 Gateway Timeout
    - Any other ``Exception`` -> 500 Internal Server Error

    Usage::

        from backend.utils import handle_endpoint_errors

        @router.get("/example")
        @handle_endpoint_errors
        def my_endpoint():
            ...

    The decorator preserves the original function signature and docstring so
    that FastAPI's OpenAPI schema generation continues to work correctly.
    """

    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            return fn(*args, **kwargs)
        except HTTPException:
            raise
        except ValueError as e:
            logger.error("Validation error in %s: %s", fn.__name__, e)
            raise HTTPException(status_code=400, detail=str(e))
        except FileNotFoundError as e:
            logger.error("File not found in %s: %s", fn.__name__, e)
            raise HTTPException(status_code=404, detail="Required resource not found")
        except TimeoutError as e:
            logger.error("Timeout in %s: %s", fn.__name__, e)
            raise HTTPException(status_code=504, detail="Request timed out")
        except Exception as e:
            logger.error("Unhandled error in %s: %s", fn.__name__, e)
            raise HTTPException(
                status_code=500,
                detail="Internal server error processing request",
            )

    return wrapper
