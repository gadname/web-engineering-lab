import asyncio
import signal

from src.infrastructures.adapters.job_queue import PostgresJobQueue
from src.infrastructures.adapters.llm import SummarizerFactory
from src.infrastructures.repositories.summary_job import SummaryJobRepositoryFactory
from src.infrastructures.shared.clients.postgres import PostgresClientFactory
from src.shared.config.settings import get_settings
from src.shared.logger.logger import logger
from src.workers.consumers import MessageConsumerFactory
from src.workers.executors import JobExecutor


async def main() -> None:
    """worker のエントリポイント。API とは別プロセスで動き、DB（キュー）だけを共有する."""
    settings = get_settings()
    logger.set_level(settings.log_level)
    await PostgresClientFactory.initialize(dsn=settings.database_url.get_secret_value())

    postgres_client = PostgresClientFactory.get()
    consumer = MessageConsumerFactory.create(
        queue_client=PostgresJobQueue(postgres_client),
        job_executor=JobExecutor(
            repository=SummaryJobRepositoryFactory.create(postgres_client=postgres_client),
            summarizer=SummarizerFactory.create(),
        ),
        poll_interval_seconds=settings.worker_poll_interval_seconds,
        visibility_timeout_seconds=settings.worker_visibility_timeout_seconds,
        max_attempts=settings.worker_max_attempts,
    )

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        # 受信ループを止めるだけ。処理中のジョブは完了まで待つ（コンテナの stop_grace_period 内に収める）
        loop.add_signal_handler(sig, lambda: asyncio.create_task(consumer.stop_consuming()))

    logger.info("Worker を起動しました", **logger.with_context(env=settings.env))
    try:
        await consumer.start_consuming()
    finally:
        await PostgresClientFactory.close()
        logger.info("Worker を停止しました")


if __name__ == "__main__":
    asyncio.run(main())
