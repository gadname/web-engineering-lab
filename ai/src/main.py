from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src import routes
from src.infrastructures.shared.clients.postgres import PostgresClientFactory
from src.shared.config.settings import get_settings
from src.shared.exception_handlers import UnexpectedExceptionMiddleware, register_exception_handlers
from src.shared.logger.logger import logger
from src.shared.middleware import AuthMiddleware, RequestResponseLoggingMiddleware, TraceMiddleware

settings = get_settings()
logger.set_level(settings.log_level)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """起動時に接続プールを作り、終了時に閉じる。graceful shutdown（処理中リクエストの待機）は uvicorn が担う."""
    logger.info("API server starting up", **logger.with_context(env=settings.env, auth_enabled=settings.auth_enabled))
    await PostgresClientFactory.initialize(dsn=settings.database_url.get_secret_value())
    yield
    await PostgresClientFactory.close()
    logger.info("API server shut down")


app = FastAPI(
    title="taskboard AI API",
    version="0.1.0",
    docs_url="/docs" if settings.is_local else None,
    redoc_url=None,
    openapi_url="/openapi.json" if settings.is_local else None,
    lifespan=lifespan,
)

# Starlette は後に add_middleware したものが外側になる。内側から順に:
#   UnexpectedException（未処理例外の境界）→ Logging → Trace → Auth → CORS（最外層。401 にも CORS ヘッダを付ける）
app.add_middleware(UnexpectedExceptionMiddleware)
app.add_middleware(RequestResponseLoggingMiddleware)
app.add_middleware(TraceMiddleware)
if settings.auth_enabled:
    app.add_middleware(AuthMiddleware)
if settings.cors_enabled:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Tenant-ID", "X-Trace-ID"],
        expose_headers=["X-Trace-ID"],
    )

register_exception_handlers(app)
app.include_router(routes.router)
