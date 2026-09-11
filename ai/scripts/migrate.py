"""migrations/*.sql をファイル名順に適用する最小のマイグレーションランナー.

適用済みは schema_migrations に記録し、二度目は飛ばす。
Prisma のような差分生成はしない（SQL を手で書く）。何が DB に流れたかを一段も隠さないため。
"""

import asyncio
import sys
from pathlib import Path

import asyncpg

from src.shared.config.settings import get_settings

MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"


async def main() -> None:
    settings = get_settings()
    conn = await asyncpg.connect(dsn=settings.database_url.get_secret_value())
    try:
        await conn.execute(
            "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())"
        )
        applied = {r["name"] for r in await conn.fetch("SELECT name FROM schema_migrations")}
        for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
            if path.name in applied:
                continue
            async with conn.transaction():
                await conn.execute(path.read_text(encoding="utf-8"))
                await conn.execute("INSERT INTO schema_migrations (name) VALUES ($1)", path.name)
            print(f"applied {path.name}")
        print("migrations up to date")
    finally:
        await conn.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:  # noqa: BLE001
        print(f"migration failed: {e}", file=sys.stderr)
        sys.exit(1)
