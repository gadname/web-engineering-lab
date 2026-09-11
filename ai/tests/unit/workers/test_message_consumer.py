import json

from src.domains.shared.job_queue import JobMessage
from src.domains.workers.protocols import ReceivedMessage
from src.shared.errors.codes import SUMMARY_JOB_ERROR_CODES
from src.shared.exceptions.usecase_exception import UsecaseException
from src.workers.consumers import MessageConsumer


class FakeQueue:
    def __init__(self, messages: list[ReceivedMessage]) -> None:
        self.messages = messages
        self.deleted: list[str] = []

    async def receive_messages(self, max_messages: int, visibility_timeout_seconds: int) -> list[ReceivedMessage]:
        return self.messages

    async def delete_message(self, receipt_handle: str) -> None:
        self.deleted.append(receipt_handle)


class FakeExecutor:
    def __init__(self, error: Exception | None = None) -> None:
        self.error = error
        self.executed: list[JobMessage] = []

    async def execute(self, job_message: JobMessage) -> None:
        self.executed.append(job_message)
        if self.error:
            raise self.error


def message(attempts: int = 1, body: dict | None = None) -> ReceivedMessage:
    payload = body or {"job_type": "summarize", "request_id": "r1", "body_data": {"job_id": "x"}, "trace_id": None}
    return ReceivedMessage(receipt_handle="1", body=json.dumps(payload), attempts=attempts)


class TestMessageConsumer:
    async def test_成功したらackする(self) -> None:
        queue, executor = FakeQueue([message()]), FakeExecutor()
        await MessageConsumer(queue, executor)._handle(message(), worker_id=0)
        assert len(executor.executed) == 1
        assert queue.deleted == ["1"]

    async def test_業務エラーは再試行せずackする(self) -> None:
        queue = FakeQueue([])
        executor = FakeExecutor(UsecaseException(SUMMARY_JOB_ERROR_CODES.ACCESS.NOT_FOUND))
        await MessageConsumer(queue, executor)._handle(message(), worker_id=0)
        assert queue.deleted == ["1"]

    async def test_想定外エラーは上限未満ならackしない(self) -> None:
        queue = FakeQueue([])
        await MessageConsumer(queue, FakeExecutor(RuntimeError("boom")), max_attempts=3)._handle(
            message(attempts=1), worker_id=0
        )
        assert queue.deleted == []

    async def test_想定外エラーでも上限に達したらackする(self) -> None:
        queue = FakeQueue([])
        await MessageConsumer(queue, FakeExecutor(RuntimeError("boom")), max_attempts=3)._handle(
            message(attempts=3), worker_id=0
        )
        assert queue.deleted == ["1"]

    async def test_壊れたメッセージは捨てる(self) -> None:
        queue, executor = FakeQueue([]), FakeExecutor()
        await MessageConsumer(queue, executor)._handle(message(body={"garbage": True}), worker_id=0)
        assert queue.deleted == ["1"]
        assert executor.executed == []
