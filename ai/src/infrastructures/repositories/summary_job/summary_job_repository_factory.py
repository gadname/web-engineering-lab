from src.domains.summary_job import SummaryJobRepositoryProtocol
from src.infrastructures.shared.clients.postgres import PostgresClient, PostgresClientFactory

from .postgres_summary_job_repository import PostgresSummaryJobRepository


class SummaryJobRepositoryFactory:
    """省略時は PostgreSQL 実装。テストはモックの repository を渡す."""

    @staticmethod
    def create(
        repository: SummaryJobRepositoryProtocol | None = None,
        postgres_client: PostgresClient | None = None,
    ) -> SummaryJobRepositoryProtocol:
        if repository is not None:
            return repository
        return PostgresSummaryJobRepository(PostgresClientFactory.create(postgres_client))
