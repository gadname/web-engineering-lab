from src.domains.shared.job_queue import JobMessage, JobType, SummarizeJobBody
from src.domains.summary_job import SummaryJobRepositoryProtocol
from src.domains.summary_job.services.summarizer_protocol import SummarizerProtocol
from src.usecases.summary_jobs import ExecuteSummaryJobCommand, ExecuteSummaryJobUsecase


class JobExecutor:
    """job_type ごとに body_data を検証し、対応するユースケースを呼ぶ."""

    def __init__(self, repository: SummaryJobRepositoryProtocol, summarizer: SummarizerProtocol) -> None:
        self._repository = repository
        self._summarizer = summarizer

    async def execute(self, job_message: JobMessage) -> None:
        match job_message.job_type:
            case JobType.SUMMARIZE:
                body = SummarizeJobBody.model_validate(job_message.body_data)
                usecase = ExecuteSummaryJobUsecase(repository=self._repository, summarizer=self._summarizer)
                await usecase.execute(ExecuteSummaryJobCommand(job_id=body.job_id))
            case _:
                raise ValueError(f"Unknown job type: {job_message.job_type}")
