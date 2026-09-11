from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from contextvars import ContextVar

import asyncpg
from asyncpg import Pool, Record

from src.shared.logger.logger import logger

# トランザクション中のコネクションを asyncio タスクの呼び出し鎖に沿って伝搬する。
# Repository はトランザクションの有無を知らず、常に PostgresClient を通して SQL を発行する（Ambient Transaction）。
_current_conn: ContextVar[asyncpg.Connection | None] = ContextVar("_current_conn", default=None)


class PostgresClient:
    """asyncpg のコネクションプールのラッパー."""

    def __init__(self) -> None:
        self._pool: Pool | None = None

    async def initialize(self, dsn: str, min_size: int = 1, max_size: int = 10) -> None:
        self._pool = await asyncpg.create_pool(dsn=dsn, min_size=min_size, max_size=max_size)
        logger.info("PostgreSQL 接続プールを初期化しました")

    async def close(self) -> None:
        if self._pool:
            await self._pool.close()
            self._pool = None
            logger.info("PostgreSQL 接続プールを閉じました")

    def _pool_or_raise(self) -> Pool:
        if self._pool is None:
            raise RuntimeError("PostgreSQL 接続プールが初期化されていません")
        return self._pool

    async def fetch(self, query: str, *args: object) -> list[Record]:
        conn = _current_conn.get()
        if conn is not None:
            return await conn.fetch(query, *args)
        async with self._pool_or_raise().acquire() as conn:
            return await conn.fetch(query, *args)

    async def fetchrow(self, query: str, *args: object) -> Record | None:
        conn = _current_conn.get()
        if conn is not None:
            return await conn.fetchrow(query, *args)
        async with self._pool_or_raise().acquire() as conn:
            return await conn.fetchrow(query, *args)

    async def execute(self, query: str, *args: object) -> str:
        conn = _current_conn.get()
        if conn is not None:
            return await conn.execute(query, *args)
        async with self._pool_or_raise().acquire() as conn:
            return await conn.execute(query, *args)

    @asynccontextmanager
    async def transaction(self) -> AsyncIterator[None]:
        """`async with client.transaction():` の中の fetch / execute は同じコネクションで動く。ネストは外側を再利用."""
        if _current_conn.get() is not None:
            yield
            return
        async with self._pool_or_raise().acquire() as conn:
            async with conn.transaction():
                token = _current_conn.set(conn)
                try:
                    yield
                finally:
                    _current_conn.reset(token)
