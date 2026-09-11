from pydantic import BaseModel, ConfigDict

from .job_type import JobType


class JobMessage(BaseModel):
    """キューに載せるメッセージ。body_data の形は job_type ごとの Body スキーマで検証する.

    trace_id を運ぶのは、API → キュー → worker を 1 本の trace として追えるようにするため。
    """

    model_config = ConfigDict(frozen=True, extra="forbid")

    job_type: JobType
    request_id: str
    body_data: dict[str, object]
    trace_id: str | None = None
