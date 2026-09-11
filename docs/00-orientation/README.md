# 00 オリエンテーション

## このリポジトリで学ぶこと

「動く Web アプリを作れる」から「なぜその構造なのかを説明でき、運用まで設計できる」へ進むための教材。
3 つのトラックは、1 つの小さなアプリ（taskboard）を **作る → 構造を整える → 本番に載せる** という順序に対応する。

```
Track 1  Web 基礎        HTTP / 契約(OpenAPI) / 永続化 / 認証 / テナント / フロント
   ↓
Track 2  設計手法        層 / ドメインモデル / DI / Tx / CQRS / 認可 / エラー / テスト
   ↓
Track 3  コンテナ・インフラ  Docker / compose / 運用 / 観測 / CI / Terraform / ECS / デプロイ
```

## 1 モジュールの回し方（目安 2〜4 時間）

1. ノートの「学習目標」と「概要」を読む（10 分）
2. 演習 README の「ゴール」を読み、**先に自分で作ってみる**（60〜120 分）
3. ノートの「仕組み」「落とし穴」を読み、自分の実装と照らす（30 分）
4. 「実例」のパスを開き、実務ではどう解いているかを確認する（30 分）。コードを写さず、「なぜ」を 3〜5 行でノートに書く
5. 「確認問題」に答える。答えられなければ 3 に戻る
6. `app/` に反映し、`PROGRESS.md` を更新する

## 実例（参考実装）の読み方

- 実例は **答え合わせ** であって、写す対象ではない。演習は汎用ドメイン（taskboard）で組み直す
- ノートの実例は `> 実例: 参考実装では …（repo/path）` の形式で書かれている。先頭の `core-backend` などはリポジトリの別名で、対応表は `references/reference-map.md` にある
- 実務コードには「なぜその値か」「なぜその順序か」のコメントが多い。**コメントを先に読む**と設計判断が追いやすい
- 参考実装のリポジトリは読み取り専用。`git pull --ff-only` 以外の操作は行わない

## 前提環境

| ツール | バージョン | 用途 |
|---|---|---|
| Node.js | 22（`.node-version`） | 全演習 |
| npm | 10+ | パッケージ管理（参考実装と同じ） |
| Docker Desktop | 最新 | Track 1-03 以降の統合テスト、Track 3 |
| Terraform | >= 1.11 | Track 3-06 以降 |
| act（任意） | 最新 | Track 3-05 の GitHub Actions ローカル実行 |

## 技術スタック（実例と揃えている）

| 領域 | 採用 | 理由 |
|---|---|---|
| API | Hono + `@hono/zod-openapi` | 軽量・Web 標準準拠・コードファースト OpenAPI |
| DB | PostgreSQL + Prisma | 型安全なクライアントとマイグレーション |
| テスト | Vitest + Testcontainers | unit と integration を同じランナーで |
| Lint | Biome | ESLint + Prettier を 1 ツールで置き換え、GritQL で独自ルールも書ける |
| FE | Next.js App Router + TanStack Query + openapi-fetch | サーバー状態管理と型共有 |
| コンテナ | Docker / compose | 本番と同じイメージをローカルでも |
| IaC | Terraform | 宣言的なインフラ管理 |
