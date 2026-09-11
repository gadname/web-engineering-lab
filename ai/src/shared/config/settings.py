from functools import lru_cache

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """環境変数（と .env）から読む設定。起動時に一度だけ検証する."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore")

    env: str = Field(default="local", description="環境名（local / test / dev / stg / prod）")
    log_level: str = Field(default="INFO")
    database_url: SecretStr = Field(description="PostgreSQL の接続 URL（ジョブと要約の永続化先）")

    # CORS
    cors_enabled: bool = Field(default=True)
    cors_allow_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    # 認証。local / test では Bearer の中身を user_id として扱う
    auth_enabled: bool = Field(default=True)

    # worker（PostgreSQL キュー）
    worker_poll_interval_seconds: float = Field(default=1.0, description="キューが空のときの待機秒数")
    worker_visibility_timeout_seconds: int = Field(
        default=60, description="受信したメッセージを他の worker から隠す秒数"
    )
    worker_max_attempts: int = Field(default=3, description="この回数失敗したメッセージは捨てる（DLQ 相当）")

    @property
    def is_local(self) -> bool:
        return self.env in ("local", "test")


@lru_cache
def get_settings() -> Settings:
    return Settings()
