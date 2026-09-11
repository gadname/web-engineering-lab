# 1-06 Next.js App Router とサーバー状態

> トラック: Track 1: Web 基礎 / 目安時間: 3 時間 / 前提: 02

## 学習目標
- Server / Client Component の境界と Route Group の使い方を説明できる
- TanStack Query でサーバー状態を管理し、query key を設計できる
- openapi-fetch で型付きクライアントを組み、ミドルウェアで共通処理を挟める

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では openapi-fetch + 3 つのミドルウェア（認証・テナント・エラー）（core-frontend/src/services/shared/clients/httpClient/core/httpClient.ts）
>
> 実例: 参考実装では `all` を prefix にした階層的 query key（core-frontend/src/services/http/sites/keys.ts）
>
> 実例: 参考実装では Provider の多段ネストと順序（core-frontend/src/app/layout.tsx）
>
> 実例: 参考実装では page.tsx は page-component を返すだけ（core-frontend/src/app/(tenant-context)/tenants/[tenantId]/sites/page.tsx）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track1-web/06-nextjs-query/README.md`

02 の生成型で `openapi-fetch` クライアントを作り、`services/http/projects/{functions,keys,hooks}` 構成で一覧・作成画面を作る

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
