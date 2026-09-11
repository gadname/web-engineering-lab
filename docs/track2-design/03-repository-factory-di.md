# 2-03 リポジトリとファクトリ DI

> トラック: Track 2: 設計手法 / 目安時間: 3 時間 / 前提: 02

## 学習目標
- Repository インターフェースをドメインに、実装をインフラに置ける
- DI コンテナ無しで Factory + optional 引数の DI を組める
- テストでインメモリ実装に差し替えられる

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では IF はドメイン層（core-backend/src/domains/site/repositories/site.ts）
>
> 実例: 参考実装では Prisma 実装（core-backend/src/infrastructures/repositories/site.ts）
>
> 実例: 参考実装では optional 引数で依存を注入する Factory（core-backend/src/infrastructures/shared/clients/databaseClient/factory.ts）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track2-design/03-repository-factory-di/README.md`

`IProjectRepository` + Prisma 実装 + InMemory 実装、Factory で組み立て

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
