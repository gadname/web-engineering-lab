from enum import StrEnum


class JobStatus(StrEnum):
    """ジョブの状態。遷移は pending → processing → completed | failed の一方向."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

    def is_terminal(self) -> bool:
        return self in (JobStatus.COMPLETED, JobStatus.FAILED)
