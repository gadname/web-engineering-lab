import re

from starlette.datastructures import Headers
from starlette.types import ASGIApp, Receive, Scope, Send

from src.shared.context.request_context import reset_user_id, set_user_id
from src.shared.errors.codes import USER_ERROR_CODES
from src.shared.errors.definitions import ERROR_DEFINITIONS
from src.shared.errors.messages import get_message
from src.shared.exception_handlers.responses import error_response
from src.shared.logger.logger import logger
from src.shared.middleware.auth.auth_factory import AuthenticatorFactory
from src.shared.middleware.auth.types import AuthenticatorProtocol


class AuthMiddleware:
    """認証ミドルウェア（純粋な ASGI）。認証済みの user_id を scope["user"] に置く.

    公開パス（docs / health / public）は素通し。認証失敗は 401 をここで返し、下流には渡さない。
    try で囲むのは認証処理だけに限定し、下流の例外を「認証エラー」と誤記録しない。
    """

    PUBLIC_PATHS = [r"^/docs$", r"^/openapi\.json$", r"^/health$", r"^/api/ai/v1/public"]

    def __init__(self, app: ASGIApp, authenticator: AuthenticatorProtocol | None = None) -> None:
        self.app = app
        self._authenticator = AuthenticatorFactory.create(authenticator)
        self._public = [re.compile(p) for p in self.PUBLIC_PATHS]

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        if scope.get("method") == "OPTIONS" or any(p.match(path) for p in self._public):
            scope["user"] = {"user_id": None}
            await self.app(scope, receive, send)
            return

        try:
            user_id = self._authenticator.verify_user_id(Headers(raw=scope.get("headers", [])))
        except ValueError as e:
            logger.warning("HTTP 認証に失敗しました", **logger.with_context(error=str(e), path=path))
            definition = ERROR_DEFINITIONS[USER_ERROR_CODES.LOGIN.NOT_AUTHENTICATED]
            response = error_response(
                status_code=definition.status_code,
                error_code=USER_ERROR_CODES.LOGIN.NOT_AUTHENTICATED,
                message=get_message(definition.message_key),
            )
            await response(scope, receive, send)
            return

        scope["user"] = {"user_id": user_id}
        token = set_user_id(user_id)
        try:
            await self.app(scope, receive, send)
        finally:
            reset_user_id(token)
