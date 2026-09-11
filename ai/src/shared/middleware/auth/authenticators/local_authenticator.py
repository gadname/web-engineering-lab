from starlette.datastructures import Headers


class LocalAuthenticator:
    """local / test 専用。`Authorization: Bearer <userId>` の中身をそのまま user_id として扱う.

    web の FakeRequestMiddlewareStrategy と api の DevelopmentAuthenticator と同じ約束。
    """

    def verify_user_id(self, headers: Headers) -> str:
        authorization = headers.get("authorization", "")
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not token.strip():
            raise ValueError("Authorization: Bearer <userId> is required")
        return token.strip()
