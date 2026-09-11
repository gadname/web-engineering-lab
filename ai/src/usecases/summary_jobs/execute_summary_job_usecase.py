from uuid import UUID

from pydantic import BaseModel, ConfigDict

from src.domains.summary_job import SummaryJobRepositoryProtocol
from src.domains.summary_job.services.summarizer_protocol import SummarizerProtocol
from src.shared.errors.codes import SUMMARY_JOB_ERROR_CODES
from src.shared.exceptions.usecase_exception import UsecaseException
from src.shared.logger.logger import logger


class ExecuteSummaryJobCommand(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    job_id: UUID


class ExecuteSummaryJobUsecase:
    """worker 側のユースケース。pending → processing → completed | failed を集約のメソッドで進める.

    processing への遷移を先に保存するのは、別 worker が同じジョブを拾ったときに
    楽観ロック（version）で片方を弾くため。
    """

    def __init__(self, repository: SummaryJobRepositoryProtocol, summarizer: SummarizerProtocol) -> None:
        self._repository = repository
        self._summarizer = summarizer

    async def execute(self, command: ExecuteSummaryJobCommand) -> None:
        job = await self._repository.find_by_id(command.job_id)
        if job is None:
            raise UsecaseException(SUMMARY_JOB_ERROR_CODES.ACCESS.NOT_FOUND)
        if job.status.is_terminal():
            logger.info(
                "終端状態のジョブなので処理しません", **logger.with_context(job_id=str(job.id), status=job.status)
            )
            return

        processing = await self._repository.update(job.start())
        try:
            summary = await self._summarizer.summarize(processing.input_text.value)
        except Exception as e:  # noqa: BLE001
            logger.warning("要約に失敗しました", **logger.with_context(job_id=str(job.id), error=str(e)))
            await self._repository.update(processing.fail(str(e)))
            return
        await self._repository.update(processing.complete(summary))
        logger.info("要約が完了しました", **logger.with_context(job_id=str(job.id)))
