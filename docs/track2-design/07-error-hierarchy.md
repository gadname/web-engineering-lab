# 2-07 エラー階層とレスポンス整形

> トラック: Track 2: 設計手法 / 目安時間: 3 時間 / 前提: 06

## 学習目標
- 層ごとの例外クラスとエラーコードを設計できる
- エラーレスポンスを単一の整形経路に集約できる
- 監視（エラーレート）を意識した 4xx / 5xx の扱いを説明できる

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では domain / usecase / infrastructure / route / middleware の層別例外（core-backend/src/shared/exceptions/）
>
> 実例: 参考実装では コード定数の集約（core-backend/src/shared/errors/codes/）
>
> 実例: 参考実装では resolveMessageForCode が唯一の文言解決経路（core-backend/src/shared/errors/errorResponseFormatter.ts）
>
> 実例: 参考実装では onError での一括処理（core-backend/src/shared/middlewares/handleOnErrorMiddleware.ts）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track2-design/07-error-hierarchy/README.md`

例外階層 + エラーコード定数 + `errorResponseFormatter` を実装し、OpenAPI にエラースキーマを反映

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
