"""FastAPI の OpenAPI spec を ai/openapi.json に書き出す（web の型生成の入力になる）."""

import json
from pathlib import Path

from src.main import app

OUTPUT = Path(__file__).resolve().parent.parent / "openapi.json"

if __name__ == "__main__":
    OUTPUT.write_text(json.dumps(app.openapi(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OpenAPI spec written to {OUTPUT}")
