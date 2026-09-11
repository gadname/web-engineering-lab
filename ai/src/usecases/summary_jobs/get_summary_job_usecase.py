from uuid import UUID

from pydantic import BaseModel, ConfigDict

from src.domains.summary_job import SummaryJob, SummaryJobRepositoryProtocol
from src.shared.errors.codes import SUMMARY_JOB_ERROR_CODES
from src.shared.exceptions.usecase_exception import UsecaseException


class GetSummaryJobCommand(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    job_id: UUID
    tenant_id: UUID


class GetSummaryJobUsecase:
    def __init__(self, repository: SummaryJobRepositoryProtocol) -> None:
        self._repository = repository

    async def execute(self, command: GetSummaryJobCommand) -> SummaryJob:
        job = await self._repository.find_by_id(command.job_id)
        # 別テナントのジョブは「存在しない」に縮退させる（存在の推測を許さない）
        if job is None or job.tenant_id != command.tenant_id:
            raise UsecaseException(SUMMARY_JOB_ERROR_CODES.ACCESS.NOT_FOUND)
        return job
