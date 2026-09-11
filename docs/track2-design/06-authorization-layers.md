# 2-06 認可の 2 層モデルとガード

> トラック: Track 2: 設計手法 / 目安時間: 3 時間 / 前提: 05

## 学習目標
- 認証と認可を分離し、認可をドメイン外に切り出せる
- ユーザー文脈 / テナント文脈の 2 層認可を設計できる
- 集約に閉じない事前条件を Guard として独立させられる

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では 2 層の IF（core-backend/src/domains/shared/authorizers/）
>
> 実例: 参考実装では 実装はドメイン外（core-backend/src/authorizers/site.ts）
>
> 実例: 参考実装では 存在確認・重複チェックを Guard に（core-backend/src/guards/siteGuard.ts）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track2-design/06-authorization-layers/README.md`

`IUserContextAuthorizer` / `ITenantContextAuthorizer` と Guard を実装し、表駆動テスト

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
