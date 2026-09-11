from typing import Protocol

from src.domains.shared.job_queue import JobMessage


class JobQueueProtocol(Protocol):
    """ジョブを投入する側の契約（Producer）。SQS でも PostgreSQL でも同じ形で使えるようにする."""

    async def enqueue_job(self, message: JobMessage) -> None: ...
