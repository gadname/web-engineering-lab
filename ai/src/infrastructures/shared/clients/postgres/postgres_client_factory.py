from src.shared.errors.codes import INFRASTRUCTURE_ERROR_CODES
from src.shared.exceptions.infrastructure_exception import InfrastructureException

from .postgres_client import PostgresClient


class PostgresClientFactory:
    """プロセスで 1 つのプールを共有する。initialize は起動時（lifespan / worker main）で呼ぶ."""

    _instance: PostgresClient | None = None

    @classmethod
    async def initialize(cls, dsn: str) -> None:
        client = PostgresClient()
        await client.initialize(dsn=dsn)
        cls._instance = client

    @classmethod
    async def close(cls) -> None:
        if cls._instance is not None:
            await cls._instance.close()
            cls._instance = None

    @classmethod
    def get(cls) -> PostgresClient:
        if cls._instance is None:
            raise InfrastructureException(INFRASTRUCTURE_ERROR_CODES.CONFIG.NOT_INITIALIZED)
        return cls._instance

    @classmethod
    def create(cls, postgres_client: PostgresClient | None = None) -> PostgresClient:
        # テストはここにモックやテスト用クライアントを渡す
        return postgres_client if postgres_client is not None else cls.get()
