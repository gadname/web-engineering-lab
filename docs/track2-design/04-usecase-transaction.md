# 2-04 ユースケースとトランザクション

> トラック: Track 2: 設計手法 / 目安時間: 3 時間 / 前提: 03

## 学習目標
- 1 ユースケース 1 責務でアプリケーション層を組める
- トランザクション境界を宣言的（デコレータ）に表現できる
- デコレータのコンパイル設定（TC39 / target）の落とし穴を知る

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では コンストラクタ注入 + @databaseTx（core-backend/src/usecases/site/createSite.ts）
>
> 実例: 参考実装では IDatabaseTxManager プロパティ規約（core-backend/src/shared/decorators/transaction.ts）
>
> 実例: 参考実装では decorator を動かすため target を ES2022 に固定する理由（core-backend/tsconfig.build.json）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track2-design/04-usecase-transaction/README.md`

`@databaseTx` 相当のデコレータを実装し、Testcontainers でロールバックを検証

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
