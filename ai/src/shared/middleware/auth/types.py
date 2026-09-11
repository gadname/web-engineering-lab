from typing import Protocol

from starlette.datastructures import Headers


class AuthenticatorProtocol(Protocol):
    def verify_user_id(self, headers: Headers) -> str:
        """ヘッダーからユーザー ID を確定する。失敗は ValueError."""
        ...
