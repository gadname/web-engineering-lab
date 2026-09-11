from src.shared.config.settings import get_settings
from src.shared.middleware.auth.authenticators.local_authenticator import LocalAuthenticator
from src.shared.middleware.auth.types import AuthenticatorProtocol


class AuthenticatorFactory:
    """環境に応じて認証方式を選ぶ。IdP（JWT 検証）向け実装は未実装で、非 local では起動時に失敗させる."""

    @staticmethod
    def create(authenticator: AuthenticatorProtocol | None = None) -> AuthenticatorProtocol:
        if authenticator is not None:
            return authenticator
        settings = get_settings()
        if settings.is_local:
            return LocalAuthenticator()
        raise NotImplementedError(f"Authenticator for env={settings.env} is not implemented")
