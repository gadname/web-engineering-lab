from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class ReceivedMessage:
    """受信したメッセージ。receipt_handle は削除（ack）に使う（SQS の ReceiptHandle に相当）."""

    receipt_handle: str
    body: str
    attempts: int


class MessageQueueClientProtocol(Protocol):
    """受信側の契約（Consumer が使う）。実装技術（SQS / PostgreSQL / Redis）への依存を名前から排除する."""

    async def receive_messages(self, max_messages: int, visibility_timeout_seconds: int) -> list[ReceivedMessage]: ...

    async def delete_message(self, receipt_handle: str) -> None: ...
