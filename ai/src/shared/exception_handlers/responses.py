from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse


def error_response(
    status_code: int,
    error_code: str,
    message: str,
    trace_id: str | None = None,
    details: dict[str, object] | None = None,
) -> JSONResponse:
    """api（Hono）と同じ形 { statusCode, errorCode, message, details? } で返す。web は 1 つの型で両方を扱う."""
    content: dict[str, object] = {"statusCode": status_code, "errorCode": error_code, "message": message}
    merged: dict[str, object] = {}
    if details:
        merged.update(jsonable_encoder(details))
    if trace_id:
        merged["trace_id"] = trace_id
    if merged:
        content["details"] = merged
    return JSONResponse(status_code=status_code, content=content)
