from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError

from src.shared.exceptions.base_exception import BaseException as AppBaseException

from .handlers import (
    handle_app_exception,
    handle_http_exception,
    handle_request_validation_error,
    handle_unexpected_exception,
)


def register_exception_handlers(app: FastAPI) -> None:
    # FastAPI は MRO で最も特定のハンドラを選ぶ。層別例外は全て AppBaseException を継承するので 1 つでよい
    app.exception_handler(AppBaseException)(handle_app_exception)
    app.exception_handler(HTTPException)(handle_http_exception)
    app.exception_handler(RequestValidationError)(handle_request_validation_error)
    app.exception_handler(Exception)(handle_unexpected_exception)
