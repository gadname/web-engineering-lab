from datetime import UTC, datetime
from uuid import UUID, uuid4

from pydantic import Field

from src.domains.shared.domain_objects import Aggregation
from src.shared.errors.codes import SUMMARY_JOB_ERROR_CODES
from src.shared.errors.types import ErrorContext
from src.shared.exceptions.domain_exception import DomainException

from .value_objects import InputText, JobStatus


class SummaryJob(Aggregation):
    """要約ジョブ（集約ルート）.

    - 状態遷移は集約のメソッドだけが行う（Repository や worker が status を直接書かない）
    - version は楽観ロック用。Repository が保存時に検査・加算する
    - tenant_id を持つのは認可のため（別テナントのジョブは「存在しない」扱いにする）
    """

    id: UUID = Field(description="ジョブ ID")
    tenant_id: UUID
    project_id: UUID
    user_id: str = Field(description="依頼者。認証基盤の subject なので UUID を強制しない")
    status: JobStatus
    input_text: InputText
    summary: str | None = None
    error_message: str | None = None
    version: int = Field(default=1, ge=1)
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(cls, tenant_id: UUID, project_id: UUID, user_id: str, input_text: InputText) -> "SummaryJob":
        now = datetime.now(UTC)
        return cls(
            id=uuid4(),
            tenant_id=tenant_id,
            project_id=project_id,
            user_id=user_id,
            status=JobStatus.PENDING,
            input_text=input_text,
            created_at=now,
            updated_at=now,
        )

    @classmethod
    def reconstruct(  # noqa: PLR0913
        cls,
        id: UUID,
        tenant_id: UUID,
        project_id: UUID,
        user_id: str,
        status: JobStatus,
        input_text: InputText,
        summary: str | None,
        error_message: str | None,
        version: int,
        created_at: datetime,
        updated_at: datetime,
    ) -> "SummaryJob":
        return cls(
            id=id,
            tenant_id=tenant_id,
            project_id=project_id,
            user_id=user_id,
            status=status,
            input_text=input_text,
            summary=summary,
            error_message=error_message,
            version=version,
            created_at=created_at,
            updated_at=updated_at,
        )

    def start(self) -> "SummaryJob":
        self._ensure_status(JobStatus.PENDING, action="start")
        return self.model_copy(update={"status": JobStatus.PROCESSING, "updated_at": datetime.now(UTC)})

    def complete(self, summary: str) -> "SummaryJob":
        self._ensure_status(JobStatus.PROCESSING, action="complete")
        return self.model_copy(
            update={"status": JobStatus.COMPLETED, "summary": summary, "updated_at": datetime.now(UTC)}
        )

    def fail(self, error_message: str) -> "SummaryJob":
        # 失敗は pending からでも processing からでも起こりうる（キュー投入失敗・処理失敗）
        if self.status.is_terminal():
            self._raise_invalid_transition("fail")
        return self.model_copy(
            update={"status": JobStatus.FAILED, "error_message": error_message, "updated_at": datetime.now(UTC)}
        )

    def _ensure_status(self, expected: JobStatus, action: str) -> None:
        if self.status != expected:
            self._raise_invalid_transition(action)

    def _raise_invalid_transition(self, action: str) -> None:
        raise DomainException(
            SUMMARY_JOB_ERROR_CODES.VALIDATION.INVALID_TRANSITION,
            ErrorContext(data={"current": self.status.value, "action": action}),
        )
