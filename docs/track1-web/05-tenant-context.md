# 1-05 マルチテナントとリクエストコンテキスト

> トラック: Track 1: Web 基礎 / 目安時間: 2 時間 / 前提: 04

## 学習目標
- テナント解決（ヘッダ / パス）と越境防止の設計を説明できる
- AsyncLocalStorage でリクエスト情報を暗黙に伝播できる
- 構造化ログに requestId / tenantId を自動付与できる

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では JWT 認証の後段でテナント所属を検証（core-backend/src/shared/middlewares/auth/tenant/tenantAuthMiddleware.ts）
>
> 実例: 参考実装では AsyncLocalStorage によるリクエストコンテキスト（core-backend/src/shared/context/requestContext.ts）
>
> 実例: 参考実装では OTel span から trace_id を自動付与、予約フィールド上書き防止（core-backend/src/shared/logger/logger.ts）
>
> 実例: 参考実装では コンテキスト開始点（core-backend/src/shared/middlewares/requestContextMiddleware.ts）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track1-web/05-tenant-context/README.md`

テナントミドルウェア + AsyncLocalStorage + winston で、全ログに requestId / tenantId が乗る API を作る

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
