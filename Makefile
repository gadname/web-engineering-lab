SHELL := /bin/bash

# 「package.json を持つディレクトリ」を演習として扱う（node_modules 配下は除外）
PKG_DIRS := $(shell find exercises app -name package.json -not -path "*/node_modules/*" -exec dirname {} \; | sort)

.PHONY: help setup check test test-integration up down list

help: ## このヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

list: ## 対象パッケージ一覧
	@for d in $(PKG_DIRS); do echo $$d; done

setup: ## 全パッケージで npm ci
	@for d in $(PKG_DIRS); do echo "== $$d"; (cd $$d && npm ci --no-audit --no-fund) || exit 1; done

check: ## 全パッケージで type-check + biome
	@for d in $(PKG_DIRS); do echo "== $$d"; (cd $$d && npm run check) || exit 1; done

test: ## 全パッケージで unit test
	@for d in $(PKG_DIRS); do echo "== $$d"; (cd $$d && npm test) || exit 1; done

test-integration: ## 統合テスト（Docker 必須）を持つパッケージで実行
	@for d in $(PKG_DIRS); do \
		if grep -q '"test:integration"' $$d/package.json; then echo "== $$d"; (cd $$d && npm run test:integration) || exit 1; fi; \
	done

up: ## app の docker compose 起動
	cd app && docker compose up -d --wait

down: ## app の docker compose 停止
	cd app && docker compose down
