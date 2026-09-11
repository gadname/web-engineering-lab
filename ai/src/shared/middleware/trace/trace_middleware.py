import re
import uuid
from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from src.shared.context.request_context import reset_trace_id, set_trace_id

TRACE_ID_HEADER = "X-Trace-ID"
# 任意の文字列を通すとログ / ヘッダインジェクションの余地があるため UUID だけ引き継ぐ
_UUID_PATTERN = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")


class TraceMiddleware(BaseHTTPMiddleware):
    """リクエストごとに trace_id を払い出し、ContextVar とレスポンスヘッダに載せる."""

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        raw = request.headers.get(TRACE_ID_HEADER)
        trace_id = raw if raw and _UUID_PATTERN.match(raw) else str(uuid.uuid4())
        token = set_trace_id(trace_id)
        request.state.trace_id = trace_id
        try:
            response = await call_next(request)
            response.headers[TRACE_ID_HEADER] = trace_id
            return response
        finally:
            reset_trace_id(token)
