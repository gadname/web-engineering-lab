import json

import asyncpg

from src.domains.shared.adapters.job_queue_protocol import JobQueueProtocol
from src.domains.shared.job_queue import JobMessage
from src.domains.workers.protocols import MessageQueueClientProtocol, ReceivedMessage
from src.infrastructures.shared.clients.postgres import PostgresClient
from src.shared.errors.codes import DATABASE_ERROR_CODES
from src.shared.errors.types import ErrorContext
from src.shared.exceptions.repository_exception import RepositoryException
from src.shared.logger.logger import logger


class PostgresJobQueue(JobQueueProtocol, MessageQueueClientProtocol):
    """PostgreSQL をキューとして使う（SQS の代替）。Producer と Consumer の両方の契約を満たす.

    受信は `FOR UPDATE SKIP LOCKED` で行を取り合う。複数 worker が同時に SELECT しても、
    ロック中の行は飛ばして別の行を取るため、同じメッセージを二重に処理しない。
    受信した行は visible_at を未来にずらす（= SQS の visibility timeout）。処理が完了したら削除する。
    完了前に worker が死ねば visible_at が過ぎた時点で再び受信対象になる（at-least-once）。
    """

    def __init__(self, client: PostgresClient) -> None:
        self._client = client

    async def enqueue_job(self, message: JobMessage) -> None:
        try:
            await self._client.execute(
                "INSERT INTO job_queue (job_type, request_id, body_data, trace_id) VALUES ($1, $2, $3::jsonb, $4)",
                message.job_type.value,
                message.request_id,
                json.dumps(message.body_data),
                message.trace_id,
            )
        except asyncpg.PostgresError as e:
            raise RepositoryException(DATABASE_ERROR_CODES.REPOSITORY.ACCESS_ERROR, ErrorContext(cause=e)) from e
        logger.info(
            "ジョブを投入しました", **logger.with_context(job_type=message.job_type, request_id=message.request_id)
        )

    async def receive_messages(self, max_messages: int, visibility_timeout_seconds: int) -> list[ReceivedMessage]:
        rows = await self._client.fetch(
            """
            UPDATE job_queue
            SET visible_at = now() + make_interval(secs => $2), attempts = attempts + 1
            WHERE id IN (
                SELECT id FROM job_queue
                WHERE visible_at <= now()
                ORDER BY id
                LIMIT $1
                FOR UPDATE SKIP LOCKED
            )
            RETURNING id, job_type, request_id, body_data, trace_id, attempts
            """,
            max_messages,
            float(visibility_timeout_seconds),
        )
        return [
            ReceivedMessage(
                receipt_handle=str(row["id"]),
                body=json.dumps(
                    {
                        "job_type": row["job_type"],
                        "request_id": row["request_id"],
                        "body_data": json.loads(row["body_data"]),
                        "trace_id": row["trace_id"],
                    }
                ),
                attempts=row["attempts"],
            )
            for row in rows
        ]

    async def delete_message(self, receipt_handle: str) -> None:
        await self._client.execute("DELETE FROM job_queue WHERE id = $1", int(receipt_handle))
