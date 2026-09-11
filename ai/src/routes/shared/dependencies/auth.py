from fastapi import Request

from src.shared.errors.codes import USER_ERROR_CODES
from src.shared.exceptions.route_exception import RouteException


def get_current_user_id(request: Request) -> str:
    """AuthMiddleware が scope["user"] に置いた user_id を取り出す。未認証なら 401."""
    user = request.scope.get("user") or {}
    user_id = user.get("user_id")
    if not user_id:
        raise RouteException(USER_ERROR_CODES.LOGIN.NOT_AUTHENTICATED)
    return user_id
