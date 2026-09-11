# ------------------------------------------------------------ #
# builder: uv で依存を .venv に解決する（lockfile どおり、開発依存なし）
# ------------------------------------------------------------ #
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:0.9 /uv /usr/local/bin/uv
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# ------------------------------------------------------------ #
# production: 非 root で uvicorn。graceful shutdown はコンテナ基盤の stopTimeout より短くする
# ------------------------------------------------------------ #
FROM python:3.12-slim AS production
WORKDIR /app
RUN useradd -m -u 1000 appuser
COPY --from=builder --chown=appuser:appuser /app/.venv ./.venv
COPY --chown=appuser:appuser src ./src
COPY --chown=appuser:appuser migrations ./migrations
COPY --chown=appuser:appuser scripts ./scripts
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
USER appuser
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--no-access-log", "--timeout-graceful-shutdown", "25"]

# ------------------------------------------------------------ #
# development: ソースをマウントして --reload
# ------------------------------------------------------------ #
FROM builder AS development
RUN uv sync --frozen --no-install-project
COPY . .
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--no-access-log"]
