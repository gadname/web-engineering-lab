# web-engineering-lab

Web 基礎・設計手法・コンテナ/インフラを、**ノート（概念）＋演習（小さく再実装）** の対で学ぶリポジトリ。
実務プロダクト（参考実装）の設計を「実例」として横に置き、一般的な Web エンジニアリングの知識として整理する。

## 学習の進め方

1. `docs/00-orientation/` を読む（全体マップと、実例の読み方）
2. トラック順にモジュールを進める。各モジュールは
   - `docs/<track>/<番号>-<slug>.md` … ノート。概念 → なぜ必要か → 仕組み → 実例 → 落とし穴 → 確認問題
   - `exercises/<track>/<番号>-<slug>/` … 独立した npm パッケージ。`npm ci && npm run check && npm test` が通れば完了
   - 演習の成果を `app/`（積み上げアプリ **taskboard**）に反映する
3. `PROGRESS.md` のチェックを更新する

## トラック

| トラック | 内容 | モジュール |
|---|---|---|
| [Track 1: Web 基礎](docs/track1-web/) | HTTP / REST / OpenAPI / Prisma / JWT / マルチテナント / Next.js / フォーム / SSE | 8 |
| [Track 2: 設計手法](docs/track2-design/) | レイヤード / DDD 戦術 / Repository + Factory DI / Usecase + Tx / CQRS / 2 層認可 / エラー階層 / テスト戦略 | 8 |
| [Track 3: コンテナ・インフラ](docs/track3-container-infra/) | Docker 多段ビルド / compose / graceful shutdown / Observability / CI / Terraform / ECS + ALB + RDS / デプロイ戦略 | 8 |
| [Appendix: AI 基盤](docs/appendix-ai/) | Python DDD + SQS ワーカー / エージェント実行サンドボックス（ノートのみ） | 2 |

依存関係の目安: Track 1 (01→02→03) → Track 2 (01→…) → Track 3 (01→…)。Track 1 の 04〜08 は Track 2 と並行してよい。

## 積み上げアプリ taskboard

```
Workspace（テナント） ─┬─ Member（所属ユーザー）
                       └─ Project ─── Task
```

- `app/api/` … Hono + Prisma + Zod-OpenAPI（Track 1 で骨組み → Track 2 で DDD 化 → Track 3 でコンテナ化）
- `app/web/` … Next.js App Router（Track 1-06 以降）
- `app/infra/` … Terraform（Track 3-06 以降）

## コマンド

```bash
make setup             # 全パッケージ npm ci
make check             # type-check + biome
make test              # unit test
make test-integration  # Testcontainers を使う統合テスト（Docker 必須）
make up / make down    # app の docker compose
```

## 参照

- [references/reference-map.md](references/reference-map.md) … 各モジュールで参照する実例（参考実装）のパス索引
- [references/reading-list.md](references/reading-list.md) … RFC / 公式ドキュメント / 書籍
- [CLAUDE.md](CLAUDE.md) … このリポジトリの規約
