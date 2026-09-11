from contextvars import ContextVar, Token

# リクエスト（またはジョブ）単位の識別子。asyncio のタスクごとに独立した値を持つため、
# 並行リクエスト間で混ざらない（Node の AsyncLocalStorage に相当）。
_trace_id_var: ContextVar[str | None] = ContextVar("trace_id", default=None)
_request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)
_user_id_var: ContextVar[str | None] = ContextVar("user_id", default=None)


def get_trace_id() -> str | None:
    return _trace_id_var.get()


def set_trace_id(trace_id: str) -> Token[str | None]:
    return _trace_id_var.set(trace_id)


def reset_trace_id(token: Token[str | None]) -> None:
    _trace_id_var.reset(token)


def get_request_id() -> str | None:
    return _request_id_var.get()


def set_request_id(request_id: str) -> Token[str | None]:
    return _request_id_var.set(request_id)


def reset_request_id(token: Token[str | None]) -> None:
    _request_id_var.reset(token)


def get_user_id() -> str | None:
    return _user_id_var.get()


def set_user_id(user_id: str) -> Token[str | None]:
    return _user_id_var.set(user_id)


def reset_user_id(token: Token[str | None]) -> None:
    _user_id_var.reset(token)
