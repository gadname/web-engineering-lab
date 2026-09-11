from uuid import UUID

import asyncpg
from asyncpg import Record

from src.domains.summary_job import InputText, JobStatus, SummaryJob, SummaryJobRepositoryProtocol
from src.infrastructures.shared.clients.postgres import PostgresClient
from src.shared.errors.codes import DATABASE_ERROR_CODES
from src.shared.errors.types import ErrorContext
from src.shared.exceptions.repository_exception import OptimisticLockException, RepositoryException


class PostgresSummaryJobRepository(SummaryJobRepositoryProtocol):
    def __init__(self, client: PostgresClient) -> None:
        self._client = client

    async def find_by_id(self, id: UUID) -> SummaryJob | None:
        try:
            row = await self._client.fetchrow("SELECT * FROM summary_jobs WHERE id = $1", id)
        except asyncpg.PostgresError as e:
            raise RepositoryException(DATABASE_ERROR_CODES.REPOSITORY.ACCESS_ERROR, ErrorContext(cause=e)) from e
        return self._to_domain(row) if row else None

    async def save(self, job: SummaryJob) -> None:
        try:
            await self._client.execute(
                """
                INSERT INTO summary_jobs
                    (id, tenant_id, project_id, user_id, status, input_text, summary, error_message, version, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                """,
                job.id,
                job.tenant_id,
                job.project_id,
                job.user_id,
                job.status.value,
                job.input_text.value,
                job.summary,
                job.error_message,
                job.version,
                job.created_at,
                job.updated_at,
            )
        except asyncpg.PostgresError as e:
            raise RepositoryException(DATABASE_ERROR_CODES.REPOSITORY.ACCESS_ERROR, ErrorContext(cause=e)) from e

    async def update(self, job: SummaryJob) -> SummaryJob:
        """楽観ロック: WHERE に読み取り時の version を含め、更新行数 0 なら競合.

        API と worker が別プロセスで同じ行を触るため、後勝ちの上書き（完了済みを処理中に戻す等）を防ぐ。
        """
        next_version = job.version + 1
        try:
            result = await self._client.execute(
                """
                UPDATE summary_jobs
                SET status = $2, summary = $3, error_message = $4, version = $5, updated_at = $6
                WHERE id = $1 AND version = $7
                """,
                job.id,
                job.status.value,
                job.summary,
                job.error_message,
                next_version,
                job.updated_at,
                job.version,
            )
        except asyncpg.PostgresError as e:
            raise RepositoryException(DATABASE_ERROR_CODES.REPOSITORY.ACCESS_ERROR, ErrorContext(cause=e)) from e
        # asyncpg の execute は "UPDATE <n>" を返す
        if result.split()[-1] != "1":
            raise OptimisticLockException(
                DATABASE_ERROR_CODES.REPOSITORY.OPTIMISTIC_LOCK_CONFLICT,
                ErrorContext(data={"job_id": str(job.id), "version": job.version}),
            )
        return job.model_copy(update={"version": next_version})

    @staticmethod
    def _to_domain(row: Record) -> SummaryJob:
        return SummaryJob.reconstruct(
            id=row["id"],
            tenant_id=row["tenant_id"],
            project_id=row["project_id"],
            user_id=row["user_id"],
            status=JobStatus(row["status"]),
            input_text=InputText(value=row["input_text"]),
            summary=row["summary"],
            error_message=row["error_message"],
            version=row["version"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )
