from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from .handlers import handle_unexpected_exception


class UnexpectedExceptionMiddleware(BaseHTTPMiddleware):
    """未処理例外をルーター直上でレスポンスに変換する.

    Starlette の Exception ハンドラは最外層にあり、レスポンスを返した後に例外を再送出するため
    uvicorn がスタックトレースを重ねて出す。ここで受け止めればエラーログは 1 本になる。
    """

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        try:
            return await call_next(request)
        except Exception as e:  # noqa: BLE001
            return await handle_unexpected_exception(request, e)
