import asyncio
from uuid import uuid4

from src.domains.shared.job_queue import build_summarize_job_message
from src.infrastructures.adapters.job_queue import PostgresJobQueue
from src.infrastructures.shared.clients.postgres import PostgresClient


class TestPostgresJobQueue:
    async def test_受信したメッセージはvisibility_timeoutの間は他から見えない(
        self, postgres_client: PostgresClient
    ) -> None:
        queue = PostgresJobQueue(postgres_client)
        await queue.enqueue_job(build_summarize_job_message(uuid4(), trace_id=None))

        first = await queue.receive_messages(max_messages=10, visibility_timeout_seconds=60)
        second = await queue.receive_messages(max_messages=10, visibility_timeout_seconds=60)
        assert len(first) == 1
        assert second == []
        assert first[0].attempts == 1

        await queue.delete_message(first[0].receipt_handle)
        assert await queue.receive_messages(max_messages=10, visibility_timeout_seconds=60) == []

    async def test_timeoutが過ぎると再配信されattemptsが増える(self, postgres_client: PostgresClient) -> None:
        queue = PostgresJobQueue(postgres_client)
        await queue.enqueue_job(build_summarize_job_message(uuid4(), trace_id=None))

        first = await queue.receive_messages(max_messages=1, visibility_timeout_seconds=1)
        await asyncio.sleep(1.2)
        redelivered = await queue.receive_messages(max_messages=1, visibility_timeout_seconds=1)
        assert first[0].receipt_handle == redelivered[0].receipt_handle
        assert redelivered[0].attempts == 2

    async def test_並行受信で同じメッセージを二重に取らない(self, postgres_client: PostgresClient) -> None:
        queue = PostgresJobQueue(postgres_client)
        for _ in range(5):
            await queue.enqueue_job(build_summarize_job_message(uuid4(), trace_id=None))

        results = await asyncio.gather(
            *[queue.receive_messages(max_messages=2, visibility_timeout_seconds=60) for _ in range(5)]
        )
        handles = [m.receipt_handle for batch in results for m in batch]
        assert len(handles) == 5
        assert len(set(handles)) == 5
