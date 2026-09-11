import time
from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from src.shared.logger.logger import logger


class RequestResponseLoggingMiddleware(BaseHTTPMiddleware):
    """リクエストの開始と終了を 1 行ずつ出す。本文は出さない（PII を含みうる）."""

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        started = time.perf_counter()
        logger.info("Request started", **logger.with_context(method=request.method, path=request.url.path))
        response = await call_next(request)
        logger.info(
            "Request finished",
            **logger.with_context(
                method=request.method,
                path=request.url.path,
                status=response.status_code,
                duration_ms=round((time.perf_counter() - started) * 1000),
            ),
        )
        return response
