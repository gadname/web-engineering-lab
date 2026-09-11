import json
import logging
import sys
from datetime import UTC, datetime
from typing import Any

from src.shared.context.request_context import get_request_id, get_trace_id, get_user_id

# LogRecord の標準属性。これ以外を「呼び出し側が extra で渡した値」として出力する
_STANDARD_ATTRS = set(vars(logging.makeLogRecord({})).keys()) | {"message", "asctime", "taskName"}

# 予約フィールド。extra による上書きを防ぐ
_RESERVED_KEYS = {"timestamp", "level", "message", "trace_id", "request_id", "user_id", "error"}


class JsonFormatter(logging.Formatter):
    """1 行 1 JSON。trace_id / request_id は ContextVar から自動で付与する."""

    def format(self, record: logging.LogRecord) -> str:
        data: dict[str, Any] = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname.lower(),
            "message": record.getMessage(),
            "logger": record.name,
        }
        if trace_id := get_trace_id():
            data["trace_id"] = trace_id
        if request_id := get_request_id():
            data["request_id"] = request_id
        if user_id := get_user_id():
            data["user_id"] = user_id
        for key, value in vars(record).items():
            if key in _STANDARD_ATTRS or key.startswith("_") or key in _RESERVED_KEYS:
                continue
            data[key] = value
        if record.exc_info:
            data["error"] = {"stack": self.formatException(record.exc_info)}
        return json.dumps(data, ensure_ascii=False, default=str)


class Logger:
    """アプリ全体で使うロガー（シングルトン）。`logger.info("msg", **logger.with_context(k=v))` で構造化する."""

    _instance: "Logger | None" = None

    def __new__(cls) -> "Logger":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._setup()
        return cls._instance

    def _setup(self, level: str = "INFO") -> None:
        self._logger = logging.getLogger("taskboard-ai")
        self._logger.propagate = False
        for handler in self._logger.handlers[:]:
            self._logger.removeHandler(handler)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JsonFormatter())
        self._logger.addHandler(handler)
        self.set_level(level)

    def set_level(self, level: str) -> None:
        self._logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    def with_context(self, **kwargs: Any) -> dict[str, Any]:
        """可変値はメッセージに埋めず、フィールドとして渡す（検索できるように）."""
        return {"extra": kwargs}

    def debug(self, message: str, **kwargs: Any) -> None:
        self._logger.debug(message, **kwargs)

    def info(self, message: str, **kwargs: Any) -> None:
        self._logger.info(message, **kwargs)

    def warning(self, message: str, **kwargs: Any) -> None:
        self._logger.warning(message, **kwargs)

    def error(self, message: str, **kwargs: Any) -> None:
        kwargs.setdefault("exc_info", sys.exc_info()[0] is not None)
        self._logger.error(message, **kwargs)

    def critical(self, message: str, **kwargs: Any) -> None:
        kwargs.setdefault("exc_info", sys.exc_info()[0] is not None)
        self._logger.critical(message, **kwargs)


logger = Logger()
