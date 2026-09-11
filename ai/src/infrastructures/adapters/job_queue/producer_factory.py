from src.domains.shared.adapters.job_queue_protocol import JobQueueProtocol
from src.infrastructures.shared.clients.postgres import PostgresClient, PostgresClientFactory

from .postgres_job_queue import PostgresJobQueue


class JobQueueProducerFactory:
    @staticmethod
    def create(
        producer: JobQueueProtocol | None = None,
        postgres_client: PostgresClient | None = None,
    ) -> JobQueueProtocol:
        if producer is not None:
            return producer
        return PostgresJobQueue(PostgresClientFactory.create(postgres_client))
