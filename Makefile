SHELL := /bin/bash
API := api
WEB := web
AI  := ai

.PHONY: help setup check fix test test-integration up down logs \
        dev-api dev-web dev-ai dev-ai-worker \
        db-migrate db-seed db-reset generate-client openapi

help: ## このヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ---------- setup ----------
setup: ## 全サービスの依存を入れる（api/web: npm ci, ai: uv sync）
	cd $(API) && npm ci --no-audit --no-fund
	cd $(WEB) && npm ci --no-audit --no-fund
	cd $(AI) && uv sync

# ---------- quality ----------
check: ## 全サービスの type-check + lint（書き換えなし）
	cd $(API) && npm run check
	cd $(WEB) && npm run check
	cd $(AI) && uv run ruff check . && uv run ruff format --check .

fix: ## 全サービスの lint / format を適用
	cd $(API) && npm run fix
	cd $(WEB) && npm run fix
	cd $(AI) && uv run ruff check --fix . && uv run ruff format .

test: ## 全サービスの unit テスト（Docker 不要）
	cd $(API) && npm run test:unit
	cd $(WEB) && npm run test:unit
	cd $(AI) && uv run pytest tests/unit -q

test-integration: ## 統合テスト（Testcontainers で PostgreSQL を起動。Docker 必須）
	cd $(API) && npm run test:integration
	cd $(AI) && uv run pytest tests/integration -q

# ---------- run ----------
up: ## docker compose 起動（db / api / ai / ai-worker / web）
	docker compose up -d --wait

down: ## docker compose 停止
	docker compose down

logs: ## 全コンテナのログ（SERVICE=api などで絞る）
	docker compose logs -f $(SERVICE)

dev-api: ## api をホストで起動（db は make up で起動しておく）
	cd $(API) && npm run dev

dev-web: ## web をホストで起動
	cd $(WEB) && npm run dev

dev-ai: ## ai（API）をホストで起動
	cd $(AI) && uv run uvicorn src.main:app --reload --port 8000

dev-ai-worker: ## ai の worker をホストで起動
	cd $(AI) && uv run python -m src.worker_main

# ---------- db ----------
db-migrate: ## api / ai のマイグレーション適用
	cd $(API) && npm run db:migrate
	cd $(AI) && uv run python -m scripts.migrate

db-seed: ## api のローカル初期データ（dev-user / dev-guest / テナント）
	cd $(API) && npm run db:seed

db-reset: ## api の DB を作り直す（ai は make down -v で volume ごと消す）
	cd $(API) && npm run db:reset && npm run db:generate

# ---------- codegen ----------
openapi: ## api / ai の OpenAPI spec を書き出す
	cd $(API) && npm run openapi:generate
	cd $(AI) && uv run python -m scripts.export_openapi

generate-client: openapi ## OpenAPI から web の型付きクライアントを生成する
	cd $(WEB) && npm run client:generate
