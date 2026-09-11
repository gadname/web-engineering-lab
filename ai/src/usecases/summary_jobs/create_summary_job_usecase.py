from uuid import UUID

from pydantic import BaseModel, ConfigDict

from src.domains.shared.adapters.job_queue_protocol import JobQueueProtocol
from src.domains.shared.job_queue import build_summarize_job_message
from src.domains.summary_job import InputText, SummaryJob, SummaryJobRepositoryProtocol
from src.infrastructures.shared.clients.postgres import PostgresClient
from src.shared.context.request_context import get_trace_id
from src.shared.logger.logger import logger


class CreateSummaryJobCommand(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    tenant_id: UUID
    project_id: UUID
    user_id: str
    text: str


class CreateSummaryJobUsecase:
    """ジョブを作って永続化し、キューへ投入する.

    永続化と投入を 1 トランザクションで行う（キューも PostgreSQL なので可能）。
    SQS のように別システムなら「保存 → 投入失敗 → ジョブが pending のまま残る」を考える必要がある。
    """

    def __init__(
        self,
        repository: SummaryJobRepositoryProtocol,
        job_queue: JobQueueProtocol,
        postgres_client: PostgresClient,
    ) -> None:
        self._repository = repository
        self._job_queue = job_queue
        self._postgres_client = postgres_client

    async def execute(self, command: CreateSummaryJobCommand) -> SummaryJob:
        job = SummaryJob.create(
            tenant_id=command.tenant_id,
            project_id=command.project_id,
            user_id=command.user_id,
            input_text=InputText(value=command.text),
        )
        async with self._postgres_client.transaction():
            await self._repository.save(job)
            await self._job_queue.enqueue_job(build_summarize_job_message(job.id, get_trace_id()))
        logger.info("要約ジョブを受け付けました", **logger.with_context(job_id=str(job.id)))
        return job
