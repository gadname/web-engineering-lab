from dataclasses import dataclass
from typing import Literal

LogLevel = Literal["error", "warning", "info"]


@dataclass(frozen=True)
class ErrorDefinition:
    """エラーコードに対する扱い（HTTP ステータス・文言・ログレベル）。throw 箇所には書かない."""

    status_code: int
    message_key: str
    retryable: bool
    log_level: LogLevel


@dataclass(frozen=True)
class ErrorContext:
    """文言の {placeholder} に埋める値と、原因例外."""

    data: dict[str, object] | None = None
    cause: Exception | None = None
