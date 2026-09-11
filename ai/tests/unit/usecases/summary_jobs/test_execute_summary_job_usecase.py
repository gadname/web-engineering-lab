from uuid import UUID, uuid4

import pytest

from src.domains.summary_job import InputText, JobStatus, SummaryJob
from src.shared.exceptions.usecase_exception import UsecaseException
from src.usecases.summary_jobs import ExecuteSummaryJobCommand, ExecuteSummaryJobUsecase


class InMemoryRepository:
    """Protocol を満たす最小のテストダブル。楽観ロックの挙動も再現する."""

    def __init__(self) -> None:
        self.jobs: dict[UUID, SummaryJob] = {}
        self.update_calls: list[JobStatus] = []

    async def find_by_id(self, id: UUID) -> SummaryJob | None:
        return self.jobs.get(id)

    async def save(self, job: SummaryJob) -> None:
        self.jobs[job.id] = job

    async def update(self, job: SummaryJob) -> SummaryJob:
        self.update_calls.append(job.status)
        saved = job.model_copy(update={"version": job.version + 1})
        self.jobs[job.id] = saved
        return saved


class FakeSummarizer:
    def __init__(self, fail: bool = False) -> None:
        self.fail = fail

    async def summarize(self, text: str) -> str:
        if self.fail:
            raise RuntimeError("llm down")
        return f"summary of {text}"


def seed(repo: InMemoryRepository) -> SummaryJob:
    job = SummaryJob.create(tenant_id=uuid4(), project_id=uuid4(), user_id="u1", input_text=InputText(value="text"))
    repo.jobs[job.id] = job
    return job


class TestExecuteSummaryJobUsecase:
    async def test_成功するとprocessingを経てcompletedで保存される(self) -> None:
        repo = InMemoryRepository()
        job = seed(repo)
        await ExecuteSummaryJobUsecase(repo, FakeSummarizer()).execute(ExecuteSummaryJobCommand(job_id=job.id))
        assert repo.update_calls == [JobStatus.PROCESSING, JobStatus.COMPLETED]
        assert repo.jobs[job.id].summary == "summary of text"
        assert repo.jobs[job.id].version == 3

    async def test_要約器が失敗するとfailedで保存され例外は外に出ない(self) -> None:
        repo = InMemoryRepository()
        job = seed(repo)
        await ExecuteSummaryJobUsecase(repo, FakeSummarizer(fail=True)).execute(ExecuteSummaryJobCommand(job_id=job.id))
        assert repo.jobs[job.id].status == JobStatus.FAILED
        assert repo.jobs[job.id].error_message == "llm down"

    async def test_終端状態のジョブは触らない(self) -> None:
        repo = InMemoryRepository()
        job = seed(repo)
        repo.jobs[job.id] = job.start().complete("done")
        await ExecuteSummaryJobUsecase(repo, FakeSummarizer()).execute(ExecuteSummaryJobCommand(job_id=job.id))
        assert repo.update_calls == []

    async def test_存在しなければNOT_FOUND(self) -> None:
        with pytest.raises(UsecaseException) as e:
            await ExecuteSummaryJobUsecase(InMemoryRepository(), FakeSummarizer()).execute(
                ExecuteSummaryJobCommand(job_id=uuid4())
            )
        assert e.value.error_code == "SUMMARY_JOB.ACCESS.NOT_FOUND"
