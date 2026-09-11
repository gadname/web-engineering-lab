from typing import Protocol
from uuid import UUID

from ..summary_job import SummaryJob


class SummaryJobRepositoryProtocol(Protocol):
    async def find_by_id(self, id: UUID) -> SummaryJob | None: ...

    async def save(self, job: SummaryJob) -> None:
        """新規作成."""
        ...

    async def update(self, job: SummaryJob) -> SummaryJob:
        """楽観ロック付き更新。読み取り時の version と一致しなければ OptimisticLockException。
        成功時は version を 1 進めた集約を返す."""
        ...
