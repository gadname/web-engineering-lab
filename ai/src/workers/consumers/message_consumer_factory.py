from src.domains.workers.protocols import JobExecutorProtocol, MessageQueueClientProtocol

from .message_consumer import MessageConsumer, MessageConsumerProtocol


class MessageConsumerFactory:
    @staticmethod
    def create(
        queue_client: MessageQueueClientProtocol,
        job_executor: JobExecutorProtocol,
        pool_size: int = 2,
        poll_interval_seconds: float = 1.0,
        visibility_timeout_seconds: int = 60,
        max_attempts: int = 3,
        consumer: MessageConsumerProtocol | None = None,
    ) -> MessageConsumerProtocol:
        if consumer is not None:
            return consumer
        return MessageConsumer(
            queue_client=queue_client,
            job_executor=job_executor,
            pool_size=pool_size,
            poll_interval_seconds=poll_interval_seconds,
            visibility_timeout_seconds=visibility_timeout_seconds,
            max_attempts=max_attempts,
        )
