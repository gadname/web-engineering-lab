from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from src.shared.context.request_context import get_trace_id
from src.shared.errors.codes import SYSTEM_ERROR_CODES, VALIDATION_ERROR_CODES
from src.shared.errors.definitions import ERROR_DEFINITIONS
from src.shared.errors.messages import get_message
from src.shared.exceptions.base_exception import BaseException as AppBaseException
from src.shared.exceptions.repository_exception import RepositoryException
from src.shared.logger.logger import logger

from .responses import error_response

# 内部事情を返さない層。文言は定義の固定文言にする
_HIDE_DETAILS_TYPES: tuple[type[Exception], ...] = (RepositoryException,)


async def handle_app_exception(request: Request, exc: AppBaseException) -> JSONResponse:
    """全ての層別例外を 1 つのハンドラで捌く（振り分けは例外自身が持つ定義に従う）."""
    log = getattr(logger, exc.log_level)
    log(
        f"[{type(exc).__name__}] {exc.error_code}",
        **logger.with_context(error_code=exc.error_code, path=request.url.path, details=exc.details),
    )
    hide = isinstance(exc, _HIDE_DETAILS_TYPES)
    return error_response(
        status_code=exc.status_code,
        error_code=exc.error_code,
        message=exc.user_message,
        trace_id=get_trace_id(),
        details=None if hide else exc.details,
    )


async def handle_http_exception(request: Request, exc: HTTPException) -> JSONResponse:
    """FastAPI / Starlette の HTTPException も同じ形に揃える（404 ルート未定義など）."""
    logger.warning("[HTTPException]", **logger.with_context(status=exc.status_code, path=request.url.path))
    return error_response(
        status_code=exc.status_code,
        error_code=f"HTTP.{exc.status_code}",
        message=str(exc.detail),
        trace_id=get_trace_id(),
    )


async def handle_request_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    """pydantic の検証失敗（422）。issues に項目ごとの内容を入れる（web はフィールドに反映する）."""
    definition = ERROR_DEFINITIONS[VALIDATION_ERROR_CODES.REQUEST.INVALID]
    issues = [{"path": ".".join(str(p) for p in e["loc"] if p != "body"), "message": e["msg"]} for e in exc.errors()]
    logger.warning("[RequestValidationError]", **logger.with_context(path=request.url.path, issues=issues))
    return error_response(
        status_code=definition.status_code,
        error_code=VALIDATION_ERROR_CODES.REQUEST.INVALID,
        message=get_message(definition.message_key),
        trace_id=get_trace_id(),
        details={"issues": issues},
    )


async def handle_unexpected_exception(request: Request, exc: Exception) -> JSONResponse:
    """想定外。固定文言で 500。ログはここでだけ出す（二重出力防止）."""
    definition = ERROR_DEFINITIONS[SYSTEM_ERROR_CODES.UNEXPECTED_ERROR]
    logger.error(
        "[UNEXPECTED] Internal Server Error",
        exc_info=(type(exc), exc, exc.__traceback__),
        **logger.with_context(path=request.url.path),
    )
    return error_response(
        status_code=definition.status_code,
        error_code=SYSTEM_ERROR_CODES.UNEXPECTED_ERROR,
        message=get_message(definition.message_key),
        trace_id=get_trace_id(),
    )
