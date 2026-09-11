from typing import Protocol

from src.domains.shared.job_queue import JobMessage


class JobExecutorProtocol(Protocol):
    """メッセージを受け取り、job_type に応じたユースケースを実行する契約."""

    async def execute(self, job_message: JobMessage) -> None: ...
