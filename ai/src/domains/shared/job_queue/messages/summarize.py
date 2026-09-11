from uuid import UUID

from pydantic import BaseModel, ConfigDict

from .job_message import JobMessage
from .job_type import JobType


class SummarizeJobBody(BaseModel):
    """summarize ジョブの本文。worker はこれで body_data を検証してから処理する."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    job_id: UUID


def build_summarize_job_message(job_id: UUID, trace_id: str | None) -> JobMessage:
    return JobMessage(
        job_type=JobType.SUMMARIZE,
        request_id=str(job_id),
        body_data=SummarizeJobBody(job_id=job_id).model_dump(mode="json"),
        trace_id=trace_id,
    )
