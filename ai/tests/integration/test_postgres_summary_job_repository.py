from uuid import uuid4

import pytest

from src.domains.summary_job import InputText, JobStatus, SummaryJob
from src.infrastructures.repositories.summary_job import PostgresSummaryJobRepository
from src.infrastructures.shared.clients.postgres import PostgresClient
from src.shared.exceptions.repository_exception import OptimisticLockException


class TestPostgresSummaryJobRepository:
    async def test_save_find_update(self, postgres_client: PostgresClient) -> None:
        repo = PostgresSummaryJobRepository(postgres_client)
        job = SummaryJob.create(tenant_id=uuid4(), project_id=uuid4(), user_id="u1", input_text=InputText(value="t"))
        await repo.save(job)

        found = await repo.find_by_id(job.id)
        assert found is not None
        assert found.status == JobStatus.PENDING

        updated = await repo.update(found.start())
        assert updated.version == 2
        assert (await repo.find_by_id(job.id)).status == JobStatus.PROCESSING  # type: ignore[union-attr]

    async def test_古いversionでの更新は楽観ロックで弾かれる(self, postgres_client: PostgresClient) -> None:
        repo = PostgresSummaryJobRepository(postgres_client)
        job = SummaryJob.create(tenant_id=uuid4(), project_id=uuid4(), user_id="u1", input_text=InputText(value="t"))
        await repo.save(job)

        await repo.update(job.start())  # version 1 → 2
        with pytest.raises(OptimisticLockException):
            await repo.update(job.start())  # 古い version 1 のまま再度更新

    async def test_transaction内の失敗はロールバックされる(self, postgres_client: PostgresClient) -> None:
        repo = PostgresSummaryJobRepository(postgres_client)
        job = SummaryJob.create(tenant_id=uuid4(), project_id=uuid4(), user_id="u1", input_text=InputText(value="t"))
        with pytest.raises(RuntimeError):
            async with postgres_client.transaction():
                await repo.save(job)
                raise RuntimeError("boom")
        assert await repo.find_by_id(job.id) is None
