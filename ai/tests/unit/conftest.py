import os

import pytest

# settings は環境変数から読む。テストでは DB へ繋がないダミー URL を与える
os.environ.setdefault("ENV", "test")
os.environ.setdefault("DATABASE_URL", "postgresql://postgres:postgres@localhost:5434/taskboard_ai_test")
os.environ.setdefault("LOG_LEVEL", "ERROR")


@pytest.fixture(autouse=True)
def _quiet_logger() -> None:
    from src.shared.logger.logger import logger

    logger.set_level("ERROR")
