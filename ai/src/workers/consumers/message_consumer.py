import asyncio
from typing import Protocol

from pydantic import ValidationError

from src.domains.shared.job_queue import JobMessage
from src.domains.workers.protocols import JobExecutorProtocol, MessageQueueClientProtocol, ReceivedMessage
from src.shared.context.request_context import reset_request_id, reset_trace_id, set_request_id, set_trace_id
from src.shared.exceptions.base_exception import BaseException as AppBaseException
from src.shared.logger.logger import logger


class MessageConsumerProtocol(Protocol):
    async def start_consuming(self) -> None: ...

    async def stop_consuming(self) -> None: ...


class MessageConsumer:
    """キューから受信し、JobExecutor に渡す。実装技術に依存しない受信ループ.

    - 成功したら delete（ack）。失敗したら delete せず、visibility timeout 後に再配信される（at-least-once）
    - 4xx 相当（アプリ例外・不正なメッセージ）は再試行しても直らないので削除する（DLQ 相当の扱いはログのみ）
    - max_attempts を超えたメッセージも削除する（無限再試行を防ぐ）
    """

    def __init__(
        self,
        queue_client: MessageQueueClientProtocol,
        job_executor: JobExecutorProtocol,
        pool_size: int = 2,
        poll_interval_seconds: float = 1.0,
        visibility_timeout_seconds: int = 60,
        max_attempts: int = 3,
    ) -> None:
        self._queue_client = queue_client
        self._job_executor = job_executor
        self._pool_size = pool_size
        self._poll_interval = poll_interval_seconds
        self._visibility_timeout = visibility_timeout_seconds
        self._max_attempts = max_attempts
        self._running = True

    async def start_consuming(self) -> None:
        logger.info("Consumer を起動します", **logger.with_context(pool_size=self._pool_size))
        await asyncio.gather(*[self._worker_loop(i) for i in range(self._pool_size)])

    async def stop_consuming(self) -> None:
        self._running = False

    async def _worker_loop(self, worker_id: int) -> None:
        while self._running:
            try:
                messages = await self._queue_client.receive_messages(
                    max_messages=1, visibility_timeout_seconds=self._visibility_timeout
                )
            except Exception:  # noqa: BLE001
                logger.error("メッセージの受信に失敗しました", **logger.with_context(worker_id=worker_id))
                await asyncio.sleep(self._poll_interval)
                continue
            if not messages:
                await asyncio.sleep(self._poll_interval)
                continue
            for message in messages:
                await self._handle(message, worker_id)

    async def _handle(self, message: ReceivedMessage, worker_id: int) -> None:
        try:
            job_message = JobMessage.model_validate_json(message.body)
        except ValidationError:
            logger.error("不正なメッセージを破棄します", **logger.with_context(receipt_handle=message.receipt_handle))
            await self._queue_client.delete_message(message.receipt_handle)
            return

        trace_token = set_trace_id(job_message.trace_id) if job_message.trace_id else None
        request_token = set_request_id(job_message.request_id)
        try:
            logger.info("ジョブを開始します", **logger.with_context(job_type=job_message.job_type, worker_id=worker_id))
            await self._job_executor.execute(job_message)
            await self._queue_client.delete_message(message.receipt_handle)
            logger.info("ジョブを完了しました", **logger.with_context(job_type=job_message.job_type))
        except AppBaseException as e:
            # 業務上の失敗は再試行しても同じ結果になるので、削除して終える
            logger.warning("ジョブが業務エラーで終了しました", **logger.with_context(error_code=e.error_code))
            await self._queue_client.delete_message(message.receipt_handle)
        except Exception:  # noqa: BLE001
            if message.attempts >= self._max_attempts:
                logger.error(
                    "再試行上限に達したためメッセージを破棄します", **logger.with_context(attempts=message.attempts)
                )
                await self._queue_client.delete_message(message.receipt_handle)
            else:
                logger.error(
                    "ジョブが失敗しました。visibility timeout 後に再試行します",
                    **logger.with_context(attempts=message.attempts),
                )
        finally:
            reset_request_id(request_token)
            if trace_token is not None:
                reset_trace_id(trace_token)
