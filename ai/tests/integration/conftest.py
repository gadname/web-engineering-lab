import asyncio
import os
from collections.abc import AsyncIterator, Iterator
from pathlib import Path

import asyncpg
import pytest
from testcontainers.community.postgres import PostgresContainer

from src.infrastructures.shared.clients.postgres import PostgresClient

MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "migrations"


@pytest.fixture(scope="session")
def database_url() -> Iterator[str]:
    """Testcontainers で使い捨ての PostgreSQL を起動し、マイグレーションを適用する."""
    with PostgresContainer("postgres:16-alpine", driver=None) as pg:
        url = pg.get_connection_url()
        os.environ["DATABASE_URL"] = url

        async def migrate() -> None:
            conn = await asyncpg.connect(dsn=url)
            try:
                for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
                    await conn.execute(path.read_text(encoding="utf-8"))
            finally:
                await conn.close()

        asyncio.run(migrate())
        yield url


@pytest.fixture
async def postgres_client(database_url: str) -> AsyncIterator[PostgresClient]:
    client = PostgresClient()
    await client.initialize(dsn=database_url)
    await client.execute("TRUNCATE TABLE summary_jobs, job_queue")
    yield client
    await client.close()
