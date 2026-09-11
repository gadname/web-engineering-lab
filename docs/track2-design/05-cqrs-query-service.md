# 2-05 CQRS: QueryService

> トラック: Track 2: 設計手法 / 目安時間: 2 時間 / 前提: 04

## 学習目標
- 読み書き分離の動機と適用範囲を説明できる
- 一覧・検索クエリを集約から切り離して実装できる
- ページネーションの設計（offset / cursor）を選べる

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では Query IF はドメイン層（core-backend/src/domains/queries/getSitesQueryService.ts）
>
> 実例: 参考実装では Prisma 直叩きの Read 実装（core-backend/src/infrastructures/queries/getSitesQueryService.ts）
>
> 実例: 参考実装では Query 専用の認可（core-backend/src/authorizers/getSitesQueryServiceAuthorizer.ts）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track2-design/05-cqrs-query-service/README.md`

`GetProjectsQueryService` IF + Prisma 実装、ページネーションと検索

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
